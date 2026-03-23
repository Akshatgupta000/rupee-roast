import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { generateGeminiContent } from '../services/geminiService.js';
import crypto from 'crypto';

export const getAdvice = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(30);
    const budgetDoc = await Budget.findOne({ userId });
    const monthlyBudget = budgetDoc?.monthlyBudget || 0;

    const currentMonthExpenses = expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const impulsiveSpent = currentMonthExpenses
      .filter((e) => e.type === 'impulsive')
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = currentMonthExpenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ₹${amt}`)
      .join(', ');

    const prompt = `You are a sharp, no-nonsense Indian financial advisor. Based on the user's spending data below, provide a brief roast, a single piece of actionable advice, and one concrete suggestion to improve their finances.

Spending this month:
- Total Spent: ₹${totalSpent}
- Monthly Budget: ₹${monthlyBudget || 'Not set'}
- Impulsive Spending: ₹${impulsiveSpent}
- Top Categories: ${topCategories || 'No data'}

Respond ONLY with a valid JSON object in this exact format:
{
  "roast": "A funny, sharp, short roast (1-2 sentences)",
  "advice": "One clear, actionable financial advice (1-2 sentences)",
  "suggestion": "One specific suggestion to cut spending or save more (1-2 sentences)"
}`;

    const dataKey = JSON.stringify({ totalSpent, impulsiveSpent, categoryBreakdown, monthlyBudget });
    const expenseHash = crypto.createHash('md5').update(dataKey).digest('hex');

    const aiResponse = await generateGeminiContent(prompt, { userId, expenseHash });

    res.json(aiResponse);
  } catch (error) {
    console.error('Advice controller error:', error);
    const statusCode = error?.statusCode || 503;
    res.status(statusCode).json({
      message: error?.message || 'Failed to generate advice',
    });
  }
};
