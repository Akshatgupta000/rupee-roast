import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expense from './src/models/Expense.js';

dotenv.config();

const testDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const expenses = await Expense.find().sort({ date: -1 }).limit(5);
    console.log(JSON.stringify(expenses, null, 2));
    
    // Also test the JS Date logic
    const currentMonth = new Date().getMonth();
    console.log("Current Month Index (0-11):", currentMonth);
    
    for (const e of expenses) {
      console.log(`Expense "${e.title}" date:`, e.date);
      console.log(`getMonth():`, e.date.getMonth());
      console.log(`Matches currentMonth?`, e.date.getMonth() === currentMonth);
    }
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testDb();
