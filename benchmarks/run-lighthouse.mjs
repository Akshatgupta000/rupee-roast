import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const clientDir = path.join(root, 'client');
const RUNS = Number(process.env.LIGHTHOUSE_RUNS || 5);
const PORT = Number(process.env.LIGHTHOUSE_PORT || 4173);
const URL = process.env.LIGHTHOUSE_URL || `http://127.0.0.1:${PORT}/`;

const run = (cmd, args, opts = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], shell: true, ...opts });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('close', (code) => {
      if (code !== 0 && opts.allowFail) resolve({ code, stdout, stderr });
      else if (code !== 0) reject(new Error(`${cmd} ${args.join(' ')} failed (${code}): ${stderr.slice(-800)}`));
      else resolve({ code, stdout, stderr });
    });
  });

const waitForUrl = async (url, timeoutMs = 60000) => {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Timed out waiting for ${url}`);
};

const stats = (arr) => {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { avg, min, max, n: arr.length };
};

console.log('Building client...');
await run('npm', ['run', 'build'], { cwd: clientDir });

console.log(`Starting vite preview on ${PORT}...`);
const preview = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT)], {
  cwd: clientDir,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe'],
});
let previewLog = '';
preview.stdout.on('data', (d) => {
  previewLog += d.toString();
});
preview.stderr.on('data', (d) => {
  previewLog += d.toString();
});

try {
  await waitForUrl(URL);
  console.log('Preview is up:', URL);

  const scores = [];
  for (let i = 1; i <= RUNS; i += 1) {
    console.log(`\n===== Lighthouse run ${i}/${RUNS} =====`);
    const outFile = path.join(__dirname, 'results', `lighthouse-run-${i}.json`);
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    const args = [
      'lighthouse',
      URL,
      '--only-categories=performance,accessibility,best-practices,seo',
      '--chrome-flags=--headless --no-sandbox',
      '--output=json',
      `--output-path=${outFile}`,
      '--quiet',
    ];
    const result = await run('npx', args, { cwd: root });
    const report = JSON.parse(fs.readFileSync(outFile, 'utf8'));
    const cats = report.categories;
    const row = {
      run: i,
      performance: Math.round(cats.performance.score * 100),
      accessibility: Math.round(cats.accessibility.score * 100),
      bestPractices: Math.round(cats['best-practices'].score * 100),
      seo: Math.round(cats.seo.score * 100),
    };
    scores.push(row);
    console.log(JSON.stringify(row, null, 2));
    if (result.stderr) console.log(result.stderr.slice(0, 400));
  }

  const rollup = {
    url: URL,
    runs: scores,
    performance: stats(scores.map((s) => s.performance)),
    accessibility: stats(scores.map((s) => s.accessibility)),
    bestPractices: stats(scores.map((s) => s.bestPractices)),
    seo: stats(scores.map((s) => s.seo)),
  };
  console.log('\n=== Lighthouse rollup ===');
  console.log(JSON.stringify(rollup, null, 2));
  fs.writeFileSync(path.join(__dirname, 'results', 'lighthouse.json'), JSON.stringify(rollup, null, 2));
} finally {
  preview.kill();
}
