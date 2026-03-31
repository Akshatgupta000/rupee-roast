import crypto from 'crypto';

/**
 * Create a stable SHA256 hash for a user's expense "financial state".
 * Requirement:
 * - Sort expenses
 * - Convert to JSON
 * - Generate SHA256 hash
 */
export const hashExpenses = (expenses = []) => {
  const normalized = (Array.isArray(expenses) ? expenses : [])
    .map((e) => {
      const d =
        e?.date instanceof Date ? e.date : e?.date ? new Date(e.date) : new Date(0);
      const iso = Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();

      return {
        title: String(e?.title ?? ''),
        amount: Number.isFinite(Number(e?.amount)) ? Number(e.amount) : 0,
        category: String(e?.category ?? ''),
        type: String(e?.type ?? ''),
        date: iso,
      };
    })
    .sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (da !== db) return da - db;
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      if (a.type !== b.type) return a.type.localeCompare(b.type);
      if (a.title !== b.title) return a.title.localeCompare(b.title);
      return a.amount - b.amount;
    });

  const json = JSON.stringify(normalized);
  return crypto.createHash('sha256').update(json).digest('hex');
};

