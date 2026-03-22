import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

export const analyzeGoalFeasibility = async (userId, goal) => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Fetch current month's budget
  const budget = await Budget.findOne({ user: userId, month: currentMonth, year: currentYear });
  const monthlyBudget = budget ? budget.monthlyBudget : 0;

  // Fetch current month's expenses
  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
  
  const expenses = await Expense.find({
    userId: userId, // Current Expense model uses userId
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });

  const currentMonthlySpending = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = monthlyBudget - currentMonthlySpending;

  // Goal calculations
  const remainingAmount = Math.max(0, goal.targetAmount - goal.savedAmount);
  // Based on the spec, deadline is absolute months left from when created.
  // A robust approach calculates monthsLeft dynamically based on createdAt, but
  // assuming deadline field represents the total months targeted from start to end, we can do simplified math.
  // The spec says: monthsLeft = deadline - currentMonth
  // This implies 'deadline' might be a month number (1-12) or total duration. Let's interpret deadline as duration in months.
  // Let's calculate monthsElapsed since creation.
  const monthsElapsed = (currentYear - goal.createdAt.getFullYear()) * 12 + (currentMonth - (goal.createdAt.getMonth() + 1));
  const monthsLeft = Math.max(1, goal.deadline - monthsElapsed); // at least 1 month
  
  const requiredMonthlySaving = remainingAmount / monthsLeft;

  // Score logic
  let affordabilityScore = 0;
  if (requiredMonthlySaving > 0) {
    affordabilityScore = (remainingBudget / requiredMonthlySaving) * 100;
  } else if (remainingAmount === 0) {
    affordabilityScore = 100;
  }

  let status = '';
  let suggestion = '';

  // Reality Check Mode
  if (requiredMonthlySaving > monthlyBudget * 1.5 && remainingAmount > 0) {
    status = 'Impossible';
    suggestion = "Reality Check: Beta sapna dekh rahe ho. This target is completely out of reach.";
  } else if (remainingBudget >= requiredMonthlySaving) {
    status = 'Achievable';
    suggestion = "You are financially capable of reaching this goal.";
  } else if (affordabilityScore >= 50) {
    status = 'Risky';
    suggestion = "You are slightly overspending. Cut down on impulsive expenses to reach this goal.";
  } else {
    status = 'Impossible';
    suggestion = "You are overspending and this goal is unrealistic.";
  }

  return {
    monthlyBudget,
    currentMonthlySpending,
    remainingBudget,
    requiredMonthlySaving,
    affordabilityScore: Math.round(affordabilityScore),
    status,
    suggestion
  };
};
