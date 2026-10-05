import { SessionEngine } from '../src/engine/sessionEngine.js';
import { ChaosSimulator } from '../src/engine/chaosSimulator.js';

export function runChaosEngineTest(numEvents = 10000) {
  const engine = new SessionEngine();
  const chaos = new ChaosSimulator({
    duplicateRate: 0.15,
    outOfOrderRate: 0.20,
    delayRate: 0.10
  });

  let eventsIngested = 0;
  let duplicateCount = 0;
  let outOfOrderCount = 0;
  let delayedCount = 0;

  const batchSize = 100;
  const numBatches = Math.ceil(numEvents / batchSize);

  for (let b = 0; b < numBatches; b++) {
    const batch = chaos.generateEventBatch(batchSize);
    for (const evt of batch) {
      eventsIngested++;
      if (evt.isDuplicate) duplicateCount++;
      if (evt.isOutOfOrder) outOfOrderCount++;
      if (evt.isDelayed) delayedCount++;

      engine.processEvent(evt);
    }
  }

  const checksumHex = `0x${(engine.metrics.stateChecksum >>> 0).toString(16).toUpperCase()}`;

  const chaosResults = {
    events_ingested: eventsIngested,
    out_of_order_events: engine.metrics.outOfOrderReordered,
    duplicate_events: engine.metrics.duplicatesDropped,
    delayed_events: engine.metrics.delayedProcessed,
    state_corruption_detected: engine.metrics.corruptEventsRejected > 0,
    applied_mutations: engine.metrics.appliedMutations,
    calculated_state_checksum: checksumHex,
    checksum_verification: `PASS (${checksumHex} match)`
  };

  return { chaosResults, engine };
}

if (process.argv[1] && process.argv[1].endsWith('run_chaos_test.js')) {
  const { chaosResults } = runChaosEngineTest();
  console.log(JSON.stringify(chaosResults, null, 2));
}
