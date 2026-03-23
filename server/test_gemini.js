import dotenv from 'dotenv';
import fs from 'fs';
import { generateGeminiContent } from './services/geminiService.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const run = async () => {
    try {
        console.log('Testing Gemini API with model configured in geminiService...');
        const prompt = "Say 'Gemini integration is working!' in a funny way.";
        const response = await generateGeminiContent(prompt, false);
        
        const output = {
            status: 'success',
            message: 'Gemini integration is working!',
            aiResponse: response
        };
        
        fs.writeFileSync('test_gemini_out.txt', JSON.stringify(output, null, 2));
        console.log('Test successful. Output saved to test_gemini_out.txt');
    } catch (error) {
        console.error('Test failed:', error.message);
        fs.writeFileSync('test_gemini_out.txt', JSON.stringify({
            status: 'error',
            message: error.message
        }, null, 2));
    }
};

run();
