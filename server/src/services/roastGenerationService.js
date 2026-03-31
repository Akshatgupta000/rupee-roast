import RoastCache from '../models/RoastCache.js';
import { generateRoastPrompt } from '../utils/roastPrompt.js';
import { hashExpenses } from '../utils/hashExpenses.js';
import { generateRoastFromGemini } from './geminiService.js';
import { generateFallbackRoast } from '../utils/fallbackRoasts.js';

const formatDateISO = (d) => {
  const date = d instanceof Date ? d : d ? new Date(d) : new Date(0);
  const iso = date.toISOString();
  // Keep it stable and smaller for hashing prompt.
  return iso.split('T')[0];
};

const buildCurrentMonthStats = (expenses = []) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return expenses.reduce(
    (acc, expense) => {
      const d =
        expense?.date instanceof Date
          ? expense.date
          : expense?.date
            ? new Date(expense.date)
            : new Date(0);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        const amt = Number(expense?.amount) || 0;
        acc.totalSpent += amt;
        if (expense.type === 'impulsive') acc.impulsiveSpent += amt;
        if (expense.type === 'necessary') acc.necessarySpent += amt;
        const cat = String(expense?.category ?? 'Other');
        acc.categoryBreakdown[cat] = (acc.categoryBreakdown[cat] || 0) + amt;
      }
      return acc;
    },
    {
      totalSpent: 0,
      impulsiveSpent: 0,
      necessarySpent: 0,
      categoryBreakdown: {},
    },
  );
};

const normalizeExpensesForPrompt = (expenses = []) => {
  return (Array.isArray(expenses) ? expenses : []).map((e) => ({
    title: e?.title || 'Untitled',
    amount: Number(e?.amount) || 0,
    category: e?.category || 'Other',
    type: e?.type || 'unknown',
    date: formatDateISO(e?.date),
  }));
};

const normalizeGoalsForPrompt = (goals = []) => {
  return (Array.isArray(goals) ? goals : []).map((g) => ({
    name: g?.title || 'Unnamed Goal',
    targetAmount: Number(g?.targetAmount) || 0,
    savedAmount: Number(g?.savedAmount) || 0,
    deadline: g?.deadline ? `${g.deadline} months` : '0 months',
  }));
};

export const generateRoastWithCache = async ({
  userId,
  expenses = [],
  goals = [],
  roastMode = 'chill',
  forceRefresh = false,
} = {}) => {
  const recentExpenses = Array.isArray(expenses) ? expenses : [];

  // Hash must represent the same "financial state" consistently.
  const expenseHash = hashExpenses(
    recentExpenses.map((e) => ({
      title: e?.title,
      amount: e?.amount,
      category: e?.category,
      type: e?.type,
      date: e?.date,
    })),
  );

  const safeMode = String(roastMode ?? 'chill').toLowerCase();
  const expenseHashWithMode = `${expenseHash}:${safeMode}`;

  // Backwards compatible: old cache entries only used `expenseHash` without mode suffix.
  if (!forceRefresh) {
    const cached =
      (await RoastCache.findOne({ userId, expenseHash: expenseHashWithMode })) ||
      (safeMode === 'chill'
        ? await RoastCache.findOne({ userId, expenseHash })
        : null);
    if (cached) {
      return {
        roast: cached.roast,
        insight: cached.insight,
        suggestion: cached.suggestion,
        cached: true,
        fallbackUsed: false,
      };
    }
  }

  const expenseSummary = normalizeExpensesForPrompt(recentExpenses);
  const currentMonthStats = buildCurrentMonthStats(recentExpenses);
  const formattedGoals = normalizeGoalsForPrompt(goals);

  const prompt = generateRoastPrompt(
    expenseSummary,
    currentMonthStats,
    formattedGoals,
    safeMode,
  );

  let result;
  let fallbackUsed = false;
  try {
    result = await generateRoastFromGemini(prompt, {});
  } catch (err) {
    // Gemini failed -> fallback must keep the app working.
    fallbackUsed = true;
    console.warn(
      '[RoastGenerationService] Gemini failed, using fallback:',
      err?.message || err,
    );
    result = generateFallbackRoast(expenseSummary, currentMonthStats);
  }

  // Cache regardless (including fallback) to avoid repeated failures/spam.
  try {
    await RoastCache.create({
      userId,
      expenseHash: expenseHashWithMode,
      roast: result.roast,
      insight: result.insight,
      suggestion: result.suggestion,
    });
  } catch (err) {
    // Unique index can race; ignore cache write failures.
    console.warn(
      '[RoastGenerationService] Failed to write roast cache:',
      err?.message || err,
    );
  }

  return {
    roast: result.roast,
    insight: result.insight,
    suggestion: result.suggestion,
    cached: false,
    fallbackUsed,
  };
};
