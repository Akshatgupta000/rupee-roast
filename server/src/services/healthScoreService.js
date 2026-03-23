import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import Goal from '../models/Goal.js';

/**
 * Calculates financial health score (0-100)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Health score data
 */
export const getFinancialHealthScore = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // 1. Fetch data
  const [budget, expenses, goals] = await Promise.all([
    Budget.findOne({ user: userId, month: currentMonth, year: currentYear }),
    Expense.find({ userId, date: { $gte: new Date(currentYear, currentMonth, 1), $lte: now } }),
    Goal.find({ user: userId, status: 'active' })
  ]);

  const totalBudget = budget ? budget.monthlyBudget : 0;
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const necessarySpent = expenses.filter(e => e.type === 'necessary').reduce((sum, e) => sum + e.amount, 0);
  const impulsiveSpent = expenses.filter(e => e.type === 'impulsive').reduce((sum, e) => sum + e.amount, 0);

  // --- Factors ---

  // A. Savings Ratio (40%)
  let savingsScore = 0;
  if (totalBudget > 0) {
    const savingsRatio = Math.max(0, (totalBudget - totalSpent) / totalBudget);
    savingsScore = Math.min(100, savingsRatio * 200); // 50% savings = 100 score
  }

  // B. Spending Consistency (20%)
  // Simple version: Penalty for overspending the budget
  let consistencyScore = 100;
  if (totalBudget > 0 && totalSpent > totalBudget) {
    consistencyScore = Math.max(0, 100 - ((totalSpent - totalBudget) / totalBudget * 100));
  } else if (totalBudget === 0 && totalSpent > 0) {
    consistencyScore = 50;
  }

  // C. Essential vs Luxury (20%)
  let luxuryScore = 100;
  if (totalSpent > 0) {
    const luxuryRatio = impulsiveSpent / totalSpent;
    luxuryScore = Math.max(0, 100 - (luxuryRatio * 200)); // 50% luxury = 0 score
  }

  // D. Goal Progress (20%)
  let goalScore = 0;
  if (goals.length > 0) {
    const totalProgress = goals.reduce((acc, g) => acc + (g.savedAmount / g.targetAmount), 0);
    goalScore = (totalProgress / goals.length) * 100;
  } else {
    goalScore = 50; // Neutral if no goals
  }

  // --- Weighted Total ---
  const score = Math.round(
    (savingsScore * 0.40) +
    (consistencyScore * 0.20) +
    (luxuryScore * 0.20) +
    (goalScore * 0.20)
  );

  let status = "Poor";
  let message = "Your financial health is in critical condition.";
  
  if (score >= 80) {
    status = "Excellent";
    message = "You are a financial wizard! Keep it up.";
  } else if (score >= 60) {
    status = "Good";
    message = "You're on the right track. Minor adjustments can help.";
  } else if (score >= 40) {
    status = "Risky";
    message = "You are spending more than recommended. Reduce luxury spending.";
  }

  return {
    score,
    status,
    message,
    factors: {
      savings: Math.round(savingsScore),
      consistency: Math.round(consistencyScore),
      luxury: Math.round(luxuryScore),
      goals: Math.round(goalScore)
    }
  };
};
