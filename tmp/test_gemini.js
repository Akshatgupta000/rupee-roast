import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: 'd:/projects/ruupee/rupee-roast/server/.env' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const modelName = "gemini-1.5-flash";

async function test() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("No API key found in .env. process.env:", JSON.stringify(process.env, null, 2));
    return;
  }
  console.log(`Using API key: ${apiKey.substring(0, 10)}...`);
  console.log(`Using model: ${modelName}`);

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello, respond with 'success'.");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
