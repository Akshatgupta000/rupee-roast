import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const requireFromServer = createRequire(path.join(root, 'server', 'package.json'));
const mongoose = requireFromServer('mongoose');
dotenv.config({ path: path.join(root, 'server', '.env') });

const routesDir = path.join(root, 'server', 'src', 'routes');
const modelsDir = path.join(root, 'server', 'src', 'models');

const MOUNT_BY_FILE = {
  'authRoutes.js': '/api/auth',
  'expenseRoutes.js': '/api/expenses',
  'goalRoutes.js': '/api/goals',
  'roastRoutes.js': '/api/roast',
  'budgetRoutes.js': '/api/budget',
  'financeRoutes.js': '/api/finance',
};

const joinPath = (mount, sub) => {
  if (!sub || sub === '/') return mount;
  return `${mount}${sub.startsWith('/') ? sub : `/${sub}`}`;
};

const parseRoutes = () => {
  const files = fs.readdirSync(routesDir).filter((f) => f.endsWith('.js'));
  const endpoints = [];

  for (const file of files) {
    const text = fs.readFileSync(path.join(routesDir, file), 'utf8');
    const mount = MOUNT_BY_FILE[file];
    if (!mount) continue;

    const statements = text
      .split(';')
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    for (const stmt of statements) {
      const routeMatch = stmt.match(/router\.route\(\s*['`]([^'`]+)['`]\s*\)(.*)$/);
      if (routeMatch) {
        const methods = [...routeMatch[2].matchAll(/\.(get|post|put|patch|delete)\(/g)].map((m) =>
          m[1].toUpperCase(),
        );
        for (const method of methods) {
          endpoints.push({
            source: file,
            method,
            path: joinPath(mount, routeMatch[1]),
          });
        }
      }
      const simple = stmt.match(/router\.(get|post|put|patch|delete)\(\s*['`]([^'`]+)['`]/);
      if (simple) {
        endpoints.push({
          source: file,
          method: simple[1].toUpperCase(),
          path: joinPath(mount, simple[2]),
        });
      }
    }
  }

  endpoints.push({ source: 'server.js', method: 'GET', path: '/api/health' });
  endpoints.push({ source: 'server.js', method: 'GET', path: '/' });

  const key = (e) => `${e.method} ${e.path}`;
  const unique = [];
  const seen = new Set();
  for (const e of endpoints) {
    const k = key(e);
    if (seen.has(k)) continue;
    seen.add(k);
    unique.push(e);
  }
  return unique.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));
};

const modelFiles = fs
  .readdirSync(modelsDir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, ''));

const endpoints = parseRoutes();
const live = { connected: false, collections: [] };

if (process.env.MONGO_URI) {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    live.connected = true;
    live.dbName = mongoose.connection.name;
    live.collections = (await mongoose.connection.db.listCollections().toArray()).map((c) => c.name).sort();
    await mongoose.disconnect();
  } catch (err) {
    live.error = err.message;
  }
}

const result = {
  uniqueApiEndpoints: endpoints.length,
  endpoints,
  mongooseModelFiles: modelFiles,
  mongooseModelCount: modelFiles.length,
  liveMongoCollections: live,
};

console.log(JSON.stringify(result, null, 2));
const outDir = path.join(__dirname, 'results');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'api-and-collections.json'), JSON.stringify(result, null, 2));
