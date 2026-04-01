import mongoose from 'mongoose';
import connectDB from './src/config/db.js';
import { getFinancialHealthScore } from './src/services/healthScoreService.js';
import { setBudget } from './src/controllers/budgetController.js';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  await connectDB();
  const userId = new mongoose.Types.ObjectId().toHexString(); // generating random mock user id
  
  // mock request and response
  const req = {
    user: { id: userId },
    body: { monthlyBudget: 5000 }
  };
  const res = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { console.log('res.json:', data); return this; }
  };
  const next = function(err) { console.error('next(err):', err); };

  console.log('Testing setBudget...');
  await setBudget(req, res, next);
  
  console.log('Testing healthScoreService...');
  try {
    const health = await getFinancialHealthScore(userId);
    console.log('Health:', health);
  } catch (err) {
    console.error('getFinancialHealthScore threw:', err);
  }
  process.exit();
}
test();
