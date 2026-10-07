/**
 * Measures MongoDB hash-cache effect on Gemini usage.
 * Production in-flight request coalescing was not present in the codebase;
 * this script still fires concurrent identical requests so that fact is measured.
 *
 * Usage (from repo root):
 *   node benchmarks/gemini-cache.mjs
 *
 * Optional:
 *   BENCHMARK_MOCK=true BENCHMARK_MOCK_DELAY_MS=500 node benchmarks/gemini-cache.mjs
 */
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

process.env.BENCHMARK = 'true';
process.env.BENCHMARK_MOCK_DELAY_MS = process.env.BENCHMARK_MOCK_DELAY_MS || '500';

const RUNS = Number(process.env.BENCHMARK_RUNS || 5);
const MOCK_DELAY_MS = Number(process.env.BENCHMARK_MOCK_DELAY_MS);
const BENCH_USER_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa';

const stats = (arr) => {
  if (!arr.length) return { avg: null, min: null, max: null, n: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { avg, min, max, n: arr.length };
};

const round2 = (n) => (n === null || n === undefined ? null : Math.round(n * 100) / 100);

const runProbe = () =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(__dirname, 'probe-gemini.mjs')], {
      cwd: root,
      env: process.env,
    });
    let out = '';
    child.stdout.on('data', (d) => {
      out += d.toString();
    });
    child.stderr.on('data', (d) => {
      out += d.toString();
    });
    child.on('close', () => resolve(out.trim()));
  });

const makeInput = (i) => ({
  expenses: [
    {
      title: `Benchmark coffee ${i}`,
      amount: 120 + i * 17,
      category: 'Food',
      type: i % 2 === 0 ? 'impulsive' : 'necessary',
      date: new Date('2026-10-01T10:00:00.000Z'),
    },
    {
      title: `Benchmark metro ${i}`,
      amount: 50 + i,
      category: 'Transport',
      type: 'necessary',
      date: new Date('2026-10-02T10:00:00.000Z'),
    },
  ],
  goals: [
    {
      title: `Emergency fund ${i}`,
      targetAmount: 50000,
      savedAmount: 1000 * i,
      deadline: 6,
    },
  ],
  roastMode: 'chill',
});

const pct = (num, den) => (den === 0 ? null : (num / den) * 100);

const main = async () => {
  console.log('=== Gemini cache / usage benchmark ===');
  console.log('cwd', root);
  console.log('BENCHMARK', process.env.BENCHMARK);
  console.log('RUNS', RUNS);

  const probeOut = await runProbe();
  console.log('\n--- Gemini probe raw output ---');
  console.log(probeOut || '(empty)');
  const probeOk = /PROBE_RESULT ok/.test(probeOut);
  const probeRateLimited = /PROBE_RESULT rate_limited/.test(probeOut);
  const probeMissing = /PROBE_RESULT missing_key/.test(probeOut);

  let geminiMode = 'real';
  if (process.env.BENCHMARK_MOCK === 'true') {
    geminiMode = 'mocked (forced by BENCHMARK_MOCK=true)';
  } else if (!probeOk) {
    process.env.BENCHMARK_MOCK = 'true';
    geminiMode = probeMissing
      ? 'mocked (GEMINI_API_KEY missing)'
      : probeRateLimited
        ? 'mocked (Gemini probe rate-limited)'
        : 'mocked (Gemini probe error)';
  }
  console.log('\nGEMINI_MODE', geminiMode);
  console.log('MOCK_DELAY_MS', process.env.BENCHMARK_MOCK === 'true' ? MOCK_DELAY_MS : 'n/a');

  const requireFromServer = createRequire(path.join(root, 'server', 'package.json'));
  const mongoose = requireFromServer('mongoose');
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('MongoDB connected:', mongoose.connection.name);

  const { generateRoastWithCache } = await import(
    pathToFileURL(path.join(root, 'server/src/services/roastGenerationService.js')).href
  );
  const { resetMetrics, snapshotMetrics } = await import(
    pathToFileURL(path.join(root, 'benchmarks/metrics.js')).href
  );
  const RoastCache = (await import(
    pathToFileURL(path.join(root, 'server/src/models/RoastCache.js')).href
  )).default;

  const callOnce = async (input, forceRefresh) => {
    const t0 = performance.now();
    const result = await generateRoastWithCache({
      userId: BENCH_USER_ID,
      expenses: input.expenses,
      goals: input.goals,
      roastMode: input.roastMode,
      forceRefresh,
    });
    return {
      wallMs: performance.now() - t0,
      cached: result.cached,
      fallbackUsed: result.fallbackUsed,
    };
  };

  const runThirty = async ({ label, forceRefresh, concurrentUniques }) => {
    resetMetrics();
    await RoastCache.deleteMany({ userId: BENCH_USER_ID });

    const inputs = Array.from({ length: 10 }, (_, i) => makeInput(i));
    const perRequest = [];

    for (let i = 0; i < 10; i += 1) {
      const input = inputs[i];
      if (!forceRefresh && concurrentUniques.includes(i)) {
        const burst = await Promise.all([
          callOnce(input, forceRefresh),
          callOnce(input, forceRefresh),
          callOnce(input, forceRefresh),
        ]);
        burst.forEach((r, idx) =>
          perRequest.push({ unique: i, repeat: idx, concurrent: true, ...r }),
        );
      } else {
        for (let r = 0; r < 3; r += 1) {
          const one = await callOnce(input, forceRefresh);
          perRequest.push({ unique: i, repeat: r, concurrent: false, ...one });
        }
      }
    }

    const snap = snapshotMetrics();
    const totalRequests = perRequest.length;
    const geminiCalls = snap.geminiCalls;
    const callsSaved = totalRequests - geminiCalls;
    const callsSavedPct = pct(callsSaved, totalRequests);
    const miss = stats(snap.missLatenciesMs);
    const hit = stats(snap.hitLatenciesMs);
    const latencyImprovementPct =
      miss.avg !== null && hit.avg !== null ? pct(miss.avg - hit.avg, miss.avg) : null;

    const summary = {
      label,
      forceRefresh,
      geminiMode,
      totalRequests,
      cacheHits: snap.cacheHits,
      cacheMisses: snap.cacheMisses,
      geminiCalls,
      geminiRealCalls: snap.geminiRealCalls,
      geminiMockedCalls: snap.geminiMockedCalls,
      inFlightJoins: snap.inFlightJoins,
      callsSaved,
      callsSavedPct: round2(callsSavedPct),
      missLatencyMs: {
        avg: round2(miss.avg),
        min: round2(miss.min),
        max: round2(miss.max),
        n: miss.n,
      },
      hitLatencyMs: {
        avg: round2(hit.avg),
        min: round2(hit.min),
        max: round2(hit.max),
        n: hit.n,
      },
      geminiLatencyMs: stats(snap.geminiLatenciesMs),
      latencyImprovementPct: round2(latencyImprovementPct),
      perRequest: perRequest.map((r) => ({
        unique: r.unique,
        repeat: r.repeat,
        concurrent: r.concurrent,
        cached: r.cached,
        fallbackUsed: r.fallbackUsed,
        wallMs: round2(r.wallMs),
      })),
    };

    await RoastCache.deleteMany({ userId: BENCH_USER_ID });
    return summary;
  };

  const afterRuns = [];
  const beforeRuns = [];

  console.log('\n--- AFTER: cache ON, 10 unique inputs x 3 (uniques 0 and 1 sent concurrently) ---');
  for (let run = 1; run <= RUNS; run += 1) {
    console.log(`\n===== AFTER run ${run}/${RUNS} =====`);
    const result = await runThirty({
      label: `after-${run}`,
      forceRefresh: false,
      concurrentUniques: [0, 1],
    });
    afterRuns.push(result);
    console.log(
      JSON.stringify(
        {
          totalRequests: result.totalRequests,
          geminiCalls: result.geminiCalls,
          geminiMockedCalls: result.geminiMockedCalls,
          geminiRealCalls: result.geminiRealCalls,
          cacheHits: result.cacheHits,
          cacheMisses: result.cacheMisses,
          inFlightJoins: result.inFlightJoins,
          callsSavedPct: result.callsSavedPct,
          missLatencyMs: result.missLatencyMs,
          hitLatencyMs: result.hitLatencyMs,
          latencyImprovementPct: result.latencyImprovementPct,
          perRequest: result.perRequest,
        },
        null,
        2,
      ),
    );
  }

  console.log('\n--- BEFORE: cache bypassed via forceRefresh=true (same 30 requests, sequential) ---');
  for (let run = 1; run <= RUNS; run += 1) {
    console.log(`\n===== BEFORE run ${run}/${RUNS} =====`);
    const result = await runThirty({
      label: `before-${run}`,
      forceRefresh: true,
      concurrentUniques: [],
    });
    beforeRuns.push(result);
    console.log(
      JSON.stringify(
        {
          totalRequests: result.totalRequests,
          geminiCalls: result.geminiCalls,
          geminiMockedCalls: result.geminiMockedCalls,
          geminiRealCalls: result.geminiRealCalls,
          cacheHits: result.cacheHits,
          cacheMisses: result.cacheMisses,
          callsSavedPct: result.callsSavedPct,
          missLatencyMs: result.missLatenciesMs || result.missLatencyMs,
          hitLatencyMs: result.hitLatencyMs,
          latencyImprovementPct: result.latencyImprovementPct,
          perRequest: result.perRequest,
        },
        null,
        2,
      ),
    );
  }

  const numeric = (runs, pick) => stats(runs.map(pick).filter((n) => n !== null && n !== undefined));

  const rollup = {
    geminiMode,
    mockDelayMs: process.env.BENCHMARK_MOCK === 'true' ? MOCK_DELAY_MS : null,
    note:
      'No in-flight request deduplication exists in roastGenerationService.js. Concurrent identical first-hits each miss MongoDB and each call Gemini (or the mock). Sequential repeats hit RoastCache.',
    after: {
      geminiCalls: numeric(afterRuns, (r) => r.geminiCalls),
      callsSavedPct: numeric(afterRuns, (r) => r.callsSavedPct),
      cacheHits: numeric(afterRuns, (r) => r.cacheHits),
      cacheMisses: numeric(afterRuns, (r) => r.cacheMisses),
      missLatencyMs: numeric(afterRuns, (r) => r.missLatencyMs.avg),
      hitLatencyMs: numeric(afterRuns, (r) => r.hitLatencyMs.avg),
      latencyImprovementPct: numeric(afterRuns, (r) => r.latencyImprovementPct),
    },
    before: {
      geminiCalls: numeric(beforeRuns, (r) => r.geminiCalls),
      callsSavedPct: numeric(beforeRuns, (r) => r.callsSavedPct),
      missLatencyMs: numeric(beforeRuns, (r) => r.missLatencyMs.avg),
    },
  };

  console.log('\n=== ROLLUP (avg / min / max across runs) ===');
  console.log(JSON.stringify(rollup, null, 2));

  const outDir = path.join(__dirname, 'results');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'gemini-cache.json');
  fs.writeFileSync(
    outPath,
    JSON.stringify({ probeOut, geminiMode, afterRuns, beforeRuns, rollup }, null, 2),
  );
  console.log('\nWrote', outPath);

  await mongoose.disconnect();
};

main().catch((err) => {
  console.error('BENCHMARK_FAILED', err);
  process.exit(1);
});
