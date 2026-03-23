import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import Roast from '../models/Roast.js';

dotenv.config();

// Configuration constants as per requirements
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const MIN_COOLDOWN_MS = 20000; // 20 seconds minimum cooldown
const BACKOFF_TIMES = [10000, 20000, 40000]; // 10s, 20s, 40s wait times

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class GeminiQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
    this.lastCallEndTime = 0;
    this.genAI = null;
  }

  getGenAI() {
    if (this.genAI) return this.genAI;

    // Read key at runtime to ensure dotenv has loaded
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  async enqueue(prompt, options) {
    return new Promise((resolve, reject) => {
      this.queue.push({ prompt, options, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const { prompt, options, resolve, reject } = this.queue.shift();

    try {
      const result = await this.executeWithRetry(prompt, options);
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this.lastCallEndTime = Date.now();
      // Trigger next process check after cooldown
      setTimeout(() => this.processQueue(), 100);
    }
  }

  async executeWithRetry(prompt, options, attempt = 0) {
    const genAI = this.getGenAI();
    if (!genAI) {
      const e = new Error('GEMINI_API_KEY is not configured in .env');
      e.statusCode = 401;
      throw e;
    }

    // 1. Enforce Cooldown
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallEndTime;
    if (timeSinceLastCall < MIN_COOLDOWN_MS) {
      const waitTime = MIN_COOLDOWN_MS - timeSinceLastCall;
      console.log(`[GeminiQueue] Enforcing cooldown. Waiting ${waitTime / 1000}s...`);
      await sleep(waitTime);
    }

    try {
      console.log(`[GeminiQueue] Calling Gemini API (Model: ${GEMINI_MODEL})...`);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 512,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('AI safety filter blocked the response.');
      }

      const text = response.text();
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanText);

      // Validate required fields
      if (!data.roast) throw new Error('AI response missing "roast" field.');

      // Ensure specific fields exist
      data.advice = data.advice || 'No advice available.';
      data.suggestion = data.suggestion || 'No suggestion available.';

      // Save to MongoDB Cache
      if (options.userId && options.expenseHash) {
        await Roast.create({
          userId: options.userId,
          expenseHash: options.expenseHash,
          roast: data.roast,
          advice: data.advice,
          suggestion: data.suggestion,
        });
        console.log(`[GeminiQueue] Response cached for user ${options.userId}`);
      }

      return data;
    } catch (error) {
      const is429 = error.message?.includes('429') || error.status === 429;

      if (is429 && attempt < BACKOFF_TIMES.length) {
        const backoffMs = BACKOFF_TIMES[attempt];
        console.warn(`[GeminiQueue] 429 Rate Limited. Attempt ${attempt + 1}. Retrying in ${backoffMs / 1000}s...`);
        await sleep(backoffMs);
        return this.executeWithRetry(prompt, options, attempt + 1);
      }

      // Map errors to friendly messages / correct statuses
      if (is429) {
        const e = new Error('AI is overwhelmed by too many poor financial decisions. Please try again in a minute.');
        e.statusCode = 429;
        throw e;
      }

      const e = new Error(error.message || 'Gemini service unavailable');
      e.statusCode = 503;
      throw e;
    }
  }
}

// Singleton instances
const geminiQueue = new GeminiQueue();

/**
 * Main entry point for generating content with Gemini.
 * Includes global queueing, strict cooldown, and caching.
 */
export const generateGeminiContent = async (prompt, options = {}) => {
  const { userId, expenseHash } = options;

  // 1. Check MongoDB Cache FIRST
  if (userId && expenseHash) {
    const cached = await Roast.findOne({ userId, expenseHash });
    if (cached) {
      console.log(`[GeminiService] Cache hit for user ${userId}`);
      return {
        roast: cached.roast,
        advice: cached.advice,
        suggestion: cached.suggestion,
        _cached: true,
      };
    }
  }

  // 2. Not in cache -> add to Global Queue
  console.log(`[GeminiService] No cache found. Adding request to global queue...`);
  return geminiQueue.enqueue(prompt, options);
};

// Legacy support for backward compatibility
export const getRoastFromGemini = async (prompt, userId = null, expenseHash = null) => {
  return generateGeminiContent(prompt, { userId, expenseHash });
};
