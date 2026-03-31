/**
 * Finance analytics used by /finance/summary and dashboard charts.
 */

const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const monthLabel = (d) => {
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${month} ${d.getFullYear()}`;
};

export const buildFinanceSummary = ({ expenses = [] } = {}) => {
  const all = Array.isArray(expenses) ? expenses : [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthExpenses = all.filter((e) => {
    const d = e?.date instanceof Date ? e.date : e?.date ? new Date(e.date) : new Date(0);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalMonthlySpending = currentMonthExpenses.reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);

  const categoryBreakdown = currentMonthExpenses.reduce((acc, e) => {
    const cat = String(e?.category ?? 'Other');
    acc[cat] = (acc[cat] || 0) + (Number(e?.amount) || 0);
    return acc;
  }, {});

  const [highestCategory, highestAmount] = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])[0] || [null, 0];

  // Trend comparison vs previous month
  const prev = new Date(now);
  prev.setMonth(now.getMonth() - 1);
  const prevMonth = prev.getMonth();
  const prevYear = prev.getFullYear();

  const prevMonthExpenses = all.filter((e) => {
    const d = e?.date instanceof Date ? e.date : e?.date ? new Date(e.date) : new Date(0);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const previousMonthTotal = prevMonthExpenses.reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);
  const differenceAmount = totalMonthlySpending - previousMonthTotal;
  const differencePercent =
    previousMonthTotal > 0 ? (differenceAmount / previousMonthTotal) * 100 : null;

  const trendComparison = {
    currentMonthTotal: totalMonthlySpending,
    previousMonthTotal,
    differenceAmount,
    differencePercent,
  };

  // Monthly trend for charts (last 6 months incl current)
  const months = [];
  const cursor = new Date(now);
  cursor.setDate(1);
  cursor.setHours(0, 0, 0, 0);
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date(cursor);
    d.setMonth(cursor.getMonth() - i);
    months.push(d);
  }

  const monthlyTrend = months.map((d) => {
    const key = monthKey(d);
    const amount = all
      .filter((e) => {
        const date = e?.date instanceof Date ? e.date : e?.date ? new Date(e.date) : new Date(0);
        return monthKey(date) === key;
      })
      .reduce((sum, e) => sum + (Number(e?.amount) || 0), 0);

    return { label: monthLabel(d), amount };
  });

  // Top expenses (for chart/list)
  const topExpenses = [...all]
    .sort((a, b) => (Number(b?.amount) || 0) - (Number(a?.amount) || 0))
    .slice(0, 5)
    .map((e) => ({
      title: String(e?.title ?? 'Expense'),
      category: String(e?.category ?? 'Other'),
      amount: Number(e?.amount) || 0,
      date: e?.date instanceof Date ? e.date.toISOString().split('T')[0] : String(e?.date ?? ''),
    }));

  return {
    totalMonthlySpending,
    categoryBreakdown,
    highestSpendingCategory: highestCategory
      ? { category: highestCategory, amount: highestAmount }
      : null,
    trendComparison,
    monthlyTrend,
    topExpenses,
  };
};

