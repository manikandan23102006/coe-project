/**
 * Chaos Event Simulator
 * Synthesizes multiplayer session events with controlled duplicate, out-of-order,
 * and delayed delivery injection.
 */

export class ChaosSimulator {
  constructor(config = {}) {
    this.duplicateRate = config.duplicateRate || 0.15; // 15% duplicates
    this.outOfOrderRate = config.outOfOrderRate || 0.20; // 20% reordered
    this.delayRate = config.delayRate || 0.10; // 10% network delayed
    this.tenants = ['tenant-alpha', 'tenant-beta', 'tenant-gamma'];
    this.seqCounters = {
      'tenant-alpha': 100,
      'tenant-beta': 500,
      'tenant-gamma': 50
    };
    this.recentEventsBuffer = [];
  }

  generateEventBatch(batchSize = 10) {
    const events = [];
    const now = Date.now();

    for (let i = 0; i < batchSize; i++) {
      const tenantId = this.tenants[Math.floor(Math.random() * this.tenants.length)];
      
      // Check for duplicate injection
      if (Math.random() < this.duplicateRate && this.recentEventsBuffer.length > 0) {
        const dupEvt = this.recentEventsBuffer[Math.floor(Math.random() * this.recentEventsBuffer.length)];
        events.push({
          ...dupEvt,
          timestamp: now,
          isDuplicate: true
        });
        continue;
      }

      // Normal sequence increment or out-of-order jump
      let seq;
      const isOutOfOrder = Math.random() < this.outOfOrderRate;
      if (isOutOfOrder && Math.random() > 0.5) {
        // Future out-of-order sequence (gap)
        seq = this.seqCounters[tenantId] + Math.floor(Math.random() * 5) + 2;
      } else {
        this.seqCounters[tenantId]++;
        seq = this.seqCounters[tenantId];
      }

      const eventId = `evt_${tenantId}_${seq}_${Math.random().toString(36).substring(2, 8)}`;
      const isDelayed = Math.random() < this.delayRate;

      const event = {
        eventId,
        tenantId,
        seq,
        timestamp: isDelayed ? now - (Math.floor(Math.random() * 5000) + 1000) : now,
        isDelayed,
        isOutOfOrder,
        isDuplicate: false,
        payload: {
          sessionId: `sess_${tenantId}_${Math.floor(Math.random() * 50)}`,
          action: ['POSITION_UPDATE', 'INVENTORY_MUTATION', 'MATCH_PING', 'STATE_SYNC'][Math.floor(Math.random() * 4)],
          state: {
            posX: (Math.random() * 100).toFixed(2),
            posY: (Math.random() * 100).toFixed(2),
            hp: Math.floor(Math.random() * 100)
          }
        }
      };

      this.recentEventsBuffer.push(event);
      if (this.recentEventsBuffer.length > 100) {
        this.recentEventsBuffer.shift();
      }

      events.push(event);
    }

    return events;
  }
}
