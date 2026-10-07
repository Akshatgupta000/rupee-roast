import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, 'server', '.env') });

const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const model = 'gemini-1.5-flash'; // production default in geminiService.js

if (!key) {
  console.log('PROBE_RESULT missing_key');
  process.exit(0);
}

const genAI = new GoogleGenerativeAI(key);
const t0 = Date.now();
try {
  const modelInstance = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 32,
      responseMimeType: 'application/json',
    },
  });
  const result = await modelInstance.generateContent('Return JSON {"ok":true}');
  const text = (await result.response).text();
  console.log('PROBE_RESULT ok');
  console.log('PROBE_MS', Date.now() - t0);
  console.log('PROBE_TEXT_LEN', String(text).length);
} catch (err) {
  const msg = String(err?.message || err);
  const rateLimited = msg.includes('429') || msg.toLowerCase().includes('rate limit');
  console.log('PROBE_RESULT', rateLimited ? 'rate_limited' : 'error');
  console.log('PROBE_MS', Date.now() - t0);
  console.log('PROBE_ERROR', msg.slice(0, 400));
  process.exit(0);
}
