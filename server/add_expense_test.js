import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Expense from './src/models/Expense.js';

dotenv.config();

const addExpense = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find a user ID
    const expense = await Expense.findOne();
    if (!expense) {
      console.log('No user found');
      process.exit(0);
    }
    
    // Add one for April
    await Expense.create({
      userId: expense.userId,
      title: "April Fools Prank Supplies",
      amount: 1540,
      category: "entertainment",
      type: "impulsive",
      date: new Date() // Current date (April)
    });
    
    console.log('Added an expense for April!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

addExpense();
