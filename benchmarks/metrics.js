/**
 * In-process counters used only when BENCHMARK=true.
 * Imported dynamically from server services so production traffic is a no-op.
 */

const empty = () => ({
  cacheHits: 0,
  cacheMisses: 0,
  geminiCalls: 0,
  geminiMockedCalls: 0,
  geminiRealCalls: 0,
  inFlightJoins: 0,
  hitLatenciesMs: [],
  missLatenciesMs: [],
  geminiLatenciesMs: [],
  events: [],
});

export const metrics = empty();

export const isBenchmark = () => process.env.BENCHMARK === 'true';

export const resetMetrics = () => {
  const next = empty();
  for (const key of Object.keys(metrics)) {
    delete metrics[key];
  }
  Object.assign(metrics, next);
};

export const recordEvent = (type, extra = {}) => {
  if (!isBenchmark()) return;
  metrics.events.push({
    type,
    t: Date.now(),
    ...extra,
  });
};

export const recordCacheHit = (latencyMs) => {
  if (!isBenchmark()) return;
  metrics.cacheHits += 1;
  metrics.hitLatenciesMs.push(latencyMs);
  recordEvent('cache_hit', { latencyMs: round1(latencyMs) });
};

export const recordCacheMiss = (latencyMs) => {
  if (!isBenchmark()) return;
  metrics.cacheMisses += 1;
  metrics.missLatenciesMs.push(latencyMs);
  recordEvent('cache_miss', { latencyMs: round1(latencyMs) });
};

export const recordInFlightJoin = () => {
  if (!isBenchmark()) return;
  metrics.inFlightJoins += 1;
  recordEvent('inflight_join');
};

export const recordGeminiCall = ({ latencyMs, mocked }) => {
  if (!isBenchmark()) return;
  metrics.geminiCalls += 1;
  if (mocked) metrics.geminiMockedCalls += 1;
  else metrics.geminiRealCalls += 1;
  metrics.geminiLatenciesMs.push(latencyMs);
  recordEvent('gemini_call', { latencyMs: round1(latencyMs), mocked });
};

export const snapshotMetrics = () => structuredClone(metrics);

const round1 = (n) => Math.round(n * 10) / 10;
