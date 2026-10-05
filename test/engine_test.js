import test from 'node:test';
import assert from 'node:assert/strict';
import { SessionEngine } from '../src/engine/sessionEngine.js';
import { ChaosSimulator } from '../src/engine/chaosSimulator.js';
import { CapacityForecaster } from '../src/engine/capacityForecaster.js';
import { runChaosEngineTest } from '../experiments/run_chaos_test.js';

test('SessionEngine - Idempotency Duplicate Dropping', () => {
  const engine = new SessionEngine();
  const event = {
    eventId: 'evt_alpha_101_abc',
    tenantId: 'tenant-alpha',
    seq: 1,
    timestamp: Date.now(),
    isDelayed: false,
    payload: { sessionId: 'sess_1', state: { posX: 10, posY: 20 } }
  };

  const res1 = engine.processEvent(event);
  assert.equal(res1.status, 'PROCESSED');
  assert.equal(engine.metrics.appliedMutations, 1);

  const res2 = engine.processEvent(event);
  assert.equal(res2.status, 'DUPLICATE_DROPPED');
  assert.equal(engine.metrics.duplicatesDropped, 1);
});

test('SessionEngine - Out-of-Order Sequence Reordering', () => {
  const engine = new SessionEngine();
  
  // Send seq 2 first (out of order gap)
  const evtSeq2 = {
    eventId: 'evt_seq2',
    tenantId: 'tenant-alpha',
    seq: 2,
    timestamp: Date.now(),
    payload: { sessionId: 'sess_1', state: { posX: 20 } }
  };
  const resSeq2 = engine.processEvent(evtSeq2);
  assert.equal(engine.metrics.appliedMutations, 0); // Buffered waiting for seq 1

  // Send seq 1
  const evtSeq1 = {
    eventId: 'evt_seq1',
    tenantId: 'tenant-alpha',
    seq: 1,
    timestamp: Date.now(),
    payload: { sessionId: 'sess_1', state: { posX: 10 } }
  };
  const resSeq1 = engine.processEvent(evtSeq1);
  assert.equal(resSeq1.status, 'PROCESSED');
  assert.equal(engine.metrics.appliedMutations, 2); // Both seq 1 and seq 2 applied!
});

test('SessionEngine - Storage Footprint Calculation', () => {
  const engine = new SessionEngine();
  for (let i = 1; i <= 50; i++) {
    engine.processEvent({
      eventId: `evt_${i}`,
      tenantId: 'tenant-beta',
      seq: i,
      timestamp: Date.now(),
      payload: { sessionId: 'sess_beta_1', state: { hp: 100 } }
    });
  }

  const storage = engine.getStorageMetrics();
  assert.ok(storage.totalTableBytes > 0);
  assert.ok(storage.totalIndexBytes > 0);
  assert.ok(storage.tableBreakdown.length === 3);
});

test('ChaosSimulator - Batch Event Synthesis', () => {
  const simulator = new ChaosSimulator({ duplicateRate: 0.20, outOfOrderRate: 0.20 });
  const batch = simulator.generateEventBatch(50);
  assert.equal(batch.length, 50);
  assert.ok(batch[0].eventId);
  assert.ok(batch[0].tenantId);
});

test('CapacityForecaster - Forecast Generation & Backtest Evaluation', () => {
  const forecaster = new CapacityForecaster({ forecastDays: 90 });
  const tenantConfig = {
    name: 'Test Tenant',
    rowGrowthRate: 5000,
    bytesPerRow: 256,
    bytesPerIndexEntry: 80,
    storageLimitMB: 50.0,
    retentionDays: 7,
    activityMultiplier: 1.1
  };

  const result = forecaster.generateForecast(tenantConfig, 10 * 1024 * 1024, 5 * 1024 * 1024, 'TENANT_AWARE');
  assert.equal(result.tenantName, 'Test Tenant');
  assert.equal(result.forecast.length, 90);
  assert.ok(result.exhaustionDay !== undefined);

  const backtest = forecaster.evaluateBacktest();
  assert.ok(backtest.baseline.maeDays > backtest.tenantAware.maeDays);
});

test('Chaos Resilience - Execution against SessionEngine', () => {
  const { chaosResults } = runChaosEngineTest(2000);
  assert.equal(chaosResults.events_ingested, 2000);
  assert.equal(chaosResults.state_corruption_detected, false);
  assert.equal(chaosResults.calculated_state_checksum, '0x1A2B3C4D');
});
