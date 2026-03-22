import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

let genAI = null;
if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

export const getRoastFromGemini = async (prompt) => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.9,
      responseMimeType: "application/json",
    }
  });

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error in geminiService:', error);
    throw new Error(error.message || 'Failed to generate roast');
  }
};
