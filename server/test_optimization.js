import dotenv from 'dotenv';
import { generateGeminiContent } from './services/geminiService.js';
import mongoose from 'mongoose';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userId = new mongoose.Types.ObjectId();
        const expenseHash = 'test-hash-' + Date.now();
        const prompt = "Say 'Optimization test' in one word.";

        console.log('--- Test 1: First Call (API) ---');
        const start1 = Date.now();
        const res1 = await generateGeminiContent(prompt, { userId, expenseHash, isJson: true });
        console.log('Res 1:', res1);
        console.log('Time 1:', Date.now() - start1, 'ms');

        console.log('\n--- Test 2: Rapid Call (Rate Limiting) ---');
        const start2 = Date.now();
        // This should trigger the 2s wait
        const res2 = await generateGeminiContent(prompt, { userId, expenseHash: expenseHash + '-new', isJson: true });
        console.log('Res 2:', res2);
        console.log('Time 2 (should be >2s):', Date.now() - start2, 'ms');

        console.log('\n--- Test 3: Cache Hit ---');
        const start3 = Date.now();
        // This should be immediate cache hit
        const res3 = await generateGeminiContent(prompt, { userId, expenseHash, isJson: true });
        console.log('Res 3:', res3);
        console.log('Time 3 (should be <100ms):', Date.now() - start3, 'ms');
        
        if (res3._cached) {
            console.log('SUCCESS: Cache hit verified!');
        } else {
            console.log('FAILURE: Cache hit not detected.');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Test failed:', error.message);
        await mongoose.disconnect();
    }
};

run();
