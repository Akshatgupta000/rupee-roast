import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.writeFileSync('available_models.json', JSON.stringify(data, null, 2));
        console.log('Available models saved to available_models.json');
        
        if (data.models) {
            console.log('Models found:', data.models.map(m => m.name).join(', '));
        } else {
            console.log('No models found. Error:', data.error?.message || 'Unknown error');
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
