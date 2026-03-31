import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const DEFAULT_MODEL = 'gemini-1.5-flash';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getGenAI = () => {
  if (!GEMINI_API_KEY) return null;
  return new GoogleGenerativeAI(GEMINI_API_KEY);
};

const parseJsonFromModelText = (text) => {
  const cleanText = String(text ?? '')
    // Remove ```json / ``` code fences if the model wraps JSON.
    .replace(/```json\s*/g, '')
    .replace(/```\s*/g, '')
    .trim();

  // 1) Fast path: cleanText is already pure JSON.
  try {
    return JSON.parse(cleanText);
  } catch (e) {
    // 2) Slow path: extract the first JSON object from the text.
    // Models sometimes add leading/trailing explanation even when instructed to be JSON-only.
  }

  const match = cleanText.match(/\{[\s\S]*\}/);
  if (match?.[0]) {
    return JSON.parse(match[0]);
  }

  throw new Error('Failed to parse JSON from model output.');
};

const shouldRetry = (err) => {
  const msg = String(err?.message ?? '');
  const status = err?.statusCode ?? err?.status;
  return status === 429 || msg.includes('429') || msg.toLowerCase().includes('rate limit');
};

const executeWithRetry = async (fn, { attempts = 3 } = {}) => {
  let lastErr;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const retry = i < attempts - 1 && shouldRetry(err);
      if (!retry) break;
      const backoffMs = 750 * Math.pow(2, i);
      console.warn(`[GeminiService] Retry ${i + 1}/${attempts} after error: ${err.message}. Backing off ${backoffMs}ms`);
      await sleep(backoffMs);
    }
  }
  throw lastErr;
};

const generateJSON = async (prompt, { model = DEFAULT_MODEL } = {}) => {
  const genAI = getGenAI();
  if (!genAI) {
    const e = new Error('GEMINI_API_KEY is not configured in .env');
    e.statusCode = 401;
    throw e;
  }

  const modelInstance = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
    },
  });

  const result = await modelInstance.generateContent(prompt);
  const response = await result.response;

  if (!response?.candidates || response.candidates.length === 0) {
    throw new Error('AI safety filter blocked the response.');
  }

  const text = response.text();
  return parseJsonFromModelText(text);
};

const generateText = async (prompt, { model = DEFAULT_MODEL } = {}) => {
  const genAI = getGenAI();
  if (!genAI) {
    const e = new Error('GEMINI_API_KEY is not configured in .env');
    e.statusCode = 401;
    throw e;
  }

  const modelInstance = genAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 512,
    },
  });

  const result = await modelInstance.generateContent(prompt);
  const response = await result.response;
  if (!response?.candidates || response.candidates.length === 0) {
    throw new Error('AI safety filter blocked the response.');
  }
  return String(response.text?.() ?? '');
};

/**
 * Generate roast + insight + suggestion from Gemini.
 * Returns: { roast: string, insight: string, suggestion: string }
 */
export const generateRoastFromGemini = async (prompt, { model = DEFAULT_MODEL } = {}) => {
  try {
    const data = await executeWithRetry(() => generateJSON(prompt, { model }), { attempts: 3 });

    if (!data?.roast) throw new Error('AI response missing "roast" field.');
    if (!data?.insight) throw new Error('AI response missing "insight" field.');
    if (!data?.suggestion) throw new Error('AI response missing "suggestion" field.');

    return {
      roast: String(data.roast),
      insight: String(data.insight),
      suggestion: String(data.suggestion),
    };
  } catch (err) {
    console.error('[GeminiService] Failed to generate structured roast:', err?.message || err);
    if (err?.statusCode) throw err;
    const e = new Error(err?.message || 'Gemini service unavailable');
    e.statusCode = shouldRetry(err) ? 429 : 503;
    throw e;
  }
};

/**
 * Generate plain text from Gemini (no JSON parsing).
 */
export const generateTextFromGemini = async (prompt, { model = DEFAULT_MODEL } = {}) => {
  try {
    return await executeWithRetry(() => generateText(prompt, { model }), { attempts: 3 });
  } catch (err) {
    console.error('[GeminiService] Failed to generate text:', err?.message || err);
    if (err?.statusCode) throw err;
    const e = new Error(err?.message || 'Gemini service unavailable');
    e.statusCode = shouldRetry(err) ? 429 : 503;
    throw e;
  }
};

