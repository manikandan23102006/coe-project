/**
 * Multiplayer Session State Engine
 * Manages real-time session state, idempotency cache, out-of-order sequence window reordering,
 * table row mutations, and index overhead calculations.
 */

export class SessionEngine {
  constructor() {
    this.seenEventIds = new Set();
    this.sequenceBuffer = new Map(); // tenantId -> Map(seq -> event)
    this.lastProcessedSeq = new Map(); // tenantId -> highest processed seq
    
    // Table store representation
    this.tables = {
      session_state: {
        name: 'session_state',
        bytesPerRow: 256, // avg payload bytes
        indexes: [
          { name: 'idx_tenant_room', type: 'B-TREE', bytesPerEntry: 48, entryFactor: 1.0 },
          { name: 'idx_session_token', type: 'HASH', bytesPerEntry: 32, entryFactor: 1.0 }
        ],
        rows: []
      },
      player_events: {
        name: 'player_events',
        bytesPerRow: 128,
        indexes: [
          { name: 'idx_player_seq', type: 'B-TREE', bytesPerEntry: 40, entryFactor: 1.0 },
          { name: 'idx_event_timestamp', type: 'BRIN', bytesPerEntry: 16, entryFactor: 0.1 }
        ],
        rows: []
      },
      match_metadata: {
        name: 'match_metadata',
        bytesPerRow: 512,
        indexes: [
          { name: 'idx_match_tenant', type: 'B-TREE', bytesPerEntry: 64, entryFactor: 1.0 }
        ],
        rows: []
      }
    };

    // Tenant activity tracking
    this.tenantStats = {
      'tenant-alpha': { name: 'Alpha Studio (FPS)', activeSessions: 420, rowGrowthRate: 450, storageLimitMB: 500, retentionDays: 7 },
      'tenant-beta': { name: 'Beta Games (MMO)', activeSessions: 1280, rowGrowthRate: 1850, storageLimitMB: 2000, retentionDays: 14 },
      'tenant-gamma': { name: 'Gamma Arcade (Casual)', activeSessions: 150, rowGrowthRate: 120, storageLimitMB: 250, retentionDays: 3 }
    };

    // System event counters
    this.metrics = {
      totalReceived: 0,
      duplicatesDropped: 0,
      outOfOrderReordered: 0,
      delayedProcessed: 0,
      corruptEventsRejected: 0,
      appliedMutations: 0,
      stateChecksum: 0x1A2B3C4D
    };
  }

  /**
   * Process incoming session event stream
   */
  processEvent(event) {
    this.metrics.totalReceived++;
    const { eventId, tenantId, seq, timestamp, isDelayed, payload } = event;

    // 1. Idempotency Check (Duplicate drop)
    if (this.seenEventIds.has(eventId)) {
      this.metrics.duplicatesDropped++;
      return { status: 'DUPLICATE_DROPPED', eventId, seq };
    }
    this.seenEventIds.add(eventId);

    if (isDelayed) {
      this.metrics.delayedProcessed++;
    }

    // 2. Out-of-order sequence check & sliding window insertion
    const currentSeq = this.lastProcessedSeq.get(tenantId) || 0;

    if (!this.sequenceBuffer.has(tenantId)) {
      this.sequenceBuffer.set(tenantId, new Map());
    }
    const tenantBuffer = this.sequenceBuffer.get(tenantId);

    if (seq < currentSeq) {
      // Very late duplicate/out-of-bound event already applied in state snapshot
      this.metrics.duplicatesDropped++;
      return { status: 'EXPIRED_SEQ_DROPPED', eventId, seq };
    }

    // Store in buffer
    tenantBuffer.set(seq, event);

    // Drain ordered events from buffer
    let nextSeqToProcess = (this.lastProcessedSeq.get(tenantId) || 0) + 1;
    let processedCount = 0;

    while (tenantBuffer.has(nextSeqToProcess)) {
      const nextEvt = tenantBuffer.get(nextSeqToProcess);
      tenantBuffer.delete(nextSeqToProcess);
      this._applyMutation(nextEvt);
      this.lastProcessedSeq.set(tenantId, nextSeqToProcess);
      nextSeqToProcess++;
      processedCount++;
    }

    if (processedCount > 1 || (seq > currentSeq + 1)) {
      this.metrics.outOfOrderReordered++;
    }

    return {
      status: 'PROCESSED',
      tenantId,
      seq,
      processedSeq: this.lastProcessedSeq.get(tenantId),
      checksum: this.metrics.stateChecksum
    };
  }

  _applyMutation(event) {
    this.metrics.appliedMutations++;
    const { tenantId, payload, timestamp } = event;

    // Append to player_events table
    this.tables.player_events.rows.push({
      tenantId,
      timestamp,
      payload
    });

    // Update active session state row
    const existingIndex = this.tables.session_state.rows.findIndex(
      r => r.tenantId === tenantId && r.sessionId === payload.sessionId
    );

    if (existingIndex >= 0) {
      this.tables.session_state.rows[existingIndex] = {
        tenantId,
        sessionId: payload.sessionId,
        updatedAt: timestamp,
        state: payload.state
      };
    } else {
      this.tables.session_state.rows.push({
        tenantId,
        sessionId: payload.sessionId,
        updatedAt: timestamp,
        state: payload.state
      });
    }

    // Update simple state checksum (hash invariant verification)
    this.metrics.stateChecksum = (this.metrics.stateChecksum ^ (event.seq * 31) ^ (timestamp & 0xFFFF)) >>> 0;
  }

  /**
   * Get table and index size footprint in Bytes / MB
   */
  getStorageMetrics() {
    let totalTableBytes = 0;
    let totalIndexBytes = 0;
    const tableBreakdown = [];

    for (const [tableName, table] of Object.entries(this.tables)) {
      const rowCount = table.rows.length;
      const dataBytes = rowCount * table.bytesPerRow;

      let indexBytes = 0;
      const indexDetails = table.indexes.map(idx => {
        const bytes = Math.round(rowCount * idx.bytesPerEntry * idx.entryFactor * 1.35); // 1.35x B-Tree node fragmentation
        indexBytes += bytes;
        return {
          name: idx.name,
          type: idx.type,
          bytes,
          mb: (bytes / (1024 * 1024)).toFixed(3)
        };
      });

      totalTableBytes += dataBytes;
      totalIndexBytes += indexBytes;

      tableBreakdown.push({
        table: tableName,
        rowCount,
        dataBytes,
        dataMB: (dataBytes / (1024 * 1024)).toFixed(3),
        indexBytes,
        indexMB: (indexBytes / (1024 * 1024)).toFixed(3),
        totalMB: ((dataBytes + indexBytes) / (1024 * 1024)).toFixed(3),
        indexDetails
      });
    }

    return {
      totalTableBytes,
      totalTableMB: (totalTableBytes / (1024 * 1024)).toFixed(3),
      totalIndexBytes,
      totalIndexMB: (totalIndexBytes / (1024 * 1024)).toFixed(3),
      grandTotalMB: ((totalTableBytes + totalIndexBytes) / (1024 * 1024)).toFixed(3),
      tableBreakdown
    };
  }
}
