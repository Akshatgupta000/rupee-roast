import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/projects/ruupee/rupee-roast/server/.env' });

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function listModels() {
  if (!apiKey) {
    console.error("No API key found in .env");
    return;
  }
  
  try {
    // The Generative AI SDK doesn't have a direct 'listModels' in the same way as the REST API,
    // but we can try to hit the REST API directly or use a model we know should exist.
    console.log("Checking API key with a simple fetch...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log("Available models:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to list models:", error);
  }
}

listModels();
