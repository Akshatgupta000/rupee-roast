import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

dotenv.config();

const run = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent('test');
        fs.writeFileSync('test_gemini_out.txt', 'SUCCESS: ' + result.response.text());
    } catch (error) {
        fs.writeFileSync('test_gemini_out.txt', 'ERROR: ' + JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
};

run();
