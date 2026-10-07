import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.vite',
]);

const CODE_EXT = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.html',
  '.json',
  '.md',
]);

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
};

const files = walk(root).filter((f) => CODE_EXT.has(path.extname(f).toLowerCase()));
let totalLines = 0;
const byExt = {};
const rows = [];

for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.length === 0 ? 0 : text.split(/\r?\n/).length;
  totalLines += lines;
  const ext = path.extname(file).toLowerCase() || '(none)';
  byExt[ext] = (byExt[ext] || 0) + lines;
  rows.push({ file: path.relative(root, file), lines });
}

const lockFiles = rows.filter((r) => /package-lock\.json$/i.test(r.file));
const lockLines = lockFiles.reduce((s, r) => s + r.lines, 0);
const result = {
  excluded: [...SKIP_DIRS],
  fileCount: files.length,
  totalLines,
  totalLinesExcludingPackageLock: totalLines - lockLines,
  packageLockLines: lockLines,
  byExt,
};

console.log(JSON.stringify(result, null, 2));

const outDir = path.join(__dirname, 'results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'loc.json'), JSON.stringify({ ...result, files: rows }, null, 2));
