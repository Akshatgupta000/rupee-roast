import dotenv from 'dotenv';
import { generateGeminiContent } from './services/geminiService.js';
import mongoose from 'mongoose';
import Roast from './models/Roast.js';

dotenv.config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const userId = new mongoose.Types.ObjectId();
        const expenseHash = 'cache-test-hash-' + Date.now();
        
        // 1. Manually insert a roast into the cache
        console.log('Inserting mock roast into cache...');
        await Roast.create({
            userId,
            expenseHash,
            roast: 'This is a cached roast!',
            advice: 'Save money.',
            suggestion: 'Stop eating outside.'
        });

        // 2. Call the service - it should skip the API and return the cached roast
        console.log('Calling service - expecting CACHE HIT...');
        const start = Date.now();
        const res = await generateGeminiContent('Some prompt', { userId, expenseHash, isJson: true });
        const time = Date.now() - start;

        console.log('Result:', res);
        console.log('Time:', time, 'ms');

        if (res._cached && res.roast === 'This is a cached roast!') {
            console.log('SUCCESS: Cache logic works perfectly!');
        } else {
            console.log('FAILURE: Cache hit failed or returned wrong data.');
            console.log('Received:', res);
        }

        // Clean up
        await Roast.deleteMany({ userId });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Test failed:', error.message);
        await mongoose.disconnect();
    }
};

run();
