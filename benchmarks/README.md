# Benchmarks

Scripts that measure Rupee Roast with **real process output**. They do not change default app behavior. Service counters only run when `BENCHMARK=true`.

## Prerequisites

- Node.js
- `server/.env` with `MONGO_URI`
- `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) for a live Gemini probe. If the key is missing, invalid, or rate-limited, `gemini-cache.mjs` sets `BENCHMARK_MOCK=true` and uses a **fixed delay** instead. Those results are labeled **mocked**.

From the **repository root**:

```bash
node benchmarks/probe-gemini.mjs
node benchmarks/count-loc.mjs
node benchmarks/count-api-and-collections.mjs
node benchmarks/gemini-cache.mjs
node benchmarks/run-lighthouse.mjs
```

Outputs are written to `benchmarks/results/`.

## Gemini cache / usage (`gemini-cache.mjs`)

Sends **30** analysis calls through `generateRoastWithCache`:

- 10 unique expense/goal inputs
- each unique input repeated 3 times
- uniques `0` and `1` fire the 3 repeats with `Promise.all` (same moment)

It runs that suite **5 times with cache on**, then **5 times with `forceRefresh=true`** (cache bypass). Cache rows for user id `aaaaaaaaaaaaaaaaaaaaaaaa` are deleted before and after each run.

Optional env:

| Variable | Meaning |
| --- | --- |
| `BENCHMARK_MOCK=true` | Skip Gemini; sleep `BENCHMARK_MOCK_DELAY_MS` (default 500) |
| `BENCHMARK_RUNS` | Repeat count (default 5) |

## Lighthouse

`run-lighthouse.mjs` builds the Vite client and scores `http://127.0.0.1:4173/` five times (performance, accessibility, best-practices, SEO).

To score a deployed frontend instead:

```bash
LIGHTHOUSE_URL=https://your-frontend.example/ node benchmarks/run-lighthouse.mjs
```

---

## 📊 Measured Benchmark Scores (Latest Run)

All numbers are measured from real code execution across 5 consecutive runs.

### 1. Gemini Caching & Deduplication (30 requests per run, 5 runs)

| Metric | Method Used | Before (Bypassed) | After (Active Cache) | Improvement % |
| :--- | :--- | :--- | :--- | :--- |
| **External Model Calls** | SHA-256 expense hash in MongoDB | 30.0 / 30 / 30 | 14.0 / 14 / 14 | **53.33% saved** |
| **Response Latency** | Miss vs Hit timing in `roastGenerationService` | 705.19 ms (miss avg) | 57.68 ms (hit avg) | **91.81% faster** |
| **Cache Hit Latency** | Index read on `{ userId, expenseHash }` | N/A (0 hits) | 57.68 ms (min: 54.34, max: 63.19) | **-647.51 ms** |

> *Note on Gemini mode*: External calls were mocked with a fixed 500 ms delay (`BENCHMARK_MOCK=true`) due to the Google API endpoint deprecation (404) on `gemini-1.5-flash`.
> *Note on concurrency*: 10 unique inputs × 3 repeats = 30 requests. Uniques 0 & 1 were fired simultaneously (`Promise.all`); because no in-memory request coalescing exists, concurrent in-flight requests race and miss MongoDB simultaneously before write completion, yielding 14 external calls (16 saved).

### 2. Lighthouse Audit Scores (5 Runs on Vite Production Preview)

| Category | Average | Min | Max | Target Status |
| :--- | :--- | :--- | :--- | :--- |
| **Best Practices** | **100.0** | 100 | 100 | 🟢 Perfect 100/100 |
| **Accessibility** | **83.0** | 83 | 83 | 🟢 Strong (83/100) |
| **SEO** | **82.0** | 82 | 82 | 🟢 Strong (82/100) |
| **Performance** | **71.8** | 67 | 81 | 🟡 Good (71.8/100) |

### 3. Codebase Scale & Inventory

- **API Endpoints**: 26 unique REST endpoints mapped across 6 routers.
- **Mongoose Models**: 6 models (`Budget`, `Expense`, `Goal`, `Roast`, `RoastCache`, `User`).
- **Live MongoDB Collections**: 7 collections in database `test`.
- **Lines of Code (excl. node_modules)**: 6,742 executable source lines (JS, JSX, MJS, CSS, HTML); 57,425 total lines excluding package locks.

