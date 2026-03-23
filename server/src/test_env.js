import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from the root of the server directory
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

const report = [
  'Loading .env from: ' + envPath,
  'PORT: ' + process.env.PORT,
  'JWT_SECRET: ' + (process.env.JWT_SECRET ? 'Exists' : 'Missing'),
  'MONGO_URI: ' + (process.env.MONGO_URI ? 'Exists' : 'Missing'),
  'GOOGLE_API_KEY: ' + (process.env.GOOGLE_API_KEY ? 'Exists' : 'Missing'),
  'GEMINI_API_KEY: ' + (process.env.GEMINI_API_KEY ? 'Exists' : 'Missing'),
  'GEMINI_MODEL: ' + process.env.GEMINI_MODEL,
].join('\n');

fs.writeFileSync(path.resolve(__dirname, '../env_report.txt'), report, 'utf8');
console.log('Report written to env_report.txt');
