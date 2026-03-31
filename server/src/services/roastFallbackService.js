/**
 * Fallback roast generator (used when Gemini fails).
 * - Always returns structured JSON: { roast, insight, suggestion }
 * - Output is Hinglish + Indian-context jokes
 * - Slightly adapts wording by roastMode without changing app contracts
 */
export const generateFallbackRoast = ({
  expenseSummary = [],
  currentMonthStats = null,
  roastMode = 'chill',
} = {}) => {
  const expenses = Array.isArray(expenseSummary) ? expenseSummary : [];
  const safeMode = String(roastMode ?? 'chill').toLowerCase();

  const totalsByCategory = expenses.reduce((acc, e) => {
    const cat = String(e?.category ?? 'Other');
    const amt = Number.isFinite(Number(e?.amount)) ? Number(e.amount) : 0;
    acc[cat] = (acc[cat] || 0) + amt;
    return acc;
  }, {});

  const sortedCats = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCats[0]?.[0] ?? 'spending';
  const topCategoryAmount = sortedCats[0]?.[1] ?? 0;

  const titleBlob = expenses.map((e) => String(e?.title ?? '')).join(' ').toLowerCase();
  const lowerCats = Object.keys(totalsByCategory).join(' ').toLowerCase();

  const impulsive = Number(currentMonthStats?.impulsiveSpent ?? 0);
  const necessary = Number(currentMonthStats?.necessarySpent ?? 0);
  const total = Number(currentMonthStats?.totalSpent ?? impulsive + necessary);

  const keywordRules = [
    { key: 'swiggy', re: /\bswiggy\b/i, label: 'Swiggy' },
    { key: 'zomato', re: /\bzomato\b/i, label: 'Zomato' },
    { key: 'uber', re: /\buber\b/i, label: 'Uber' },
    { key: 'rapido', re: /\brapido\b/i, label: 'Rapido' },
    { key: 'chai', re: /\bchai\b/i, label: 'Chai' },
    { key: 'coffee', re: /\bcoffee\b/i, label: 'Coffee' },
    { key: 'cafe', re: /\bcafe\b/i, label: 'Cafe Coffee' },
    { key: 'shopping', re: /\b(amazon|flipkart|shopping|store|cart)\b/i, label: 'Shopping' },
    { key: 'recharge', re: /\brecharge\b/i, label: 'Recharge' },
    { key: 'netflix', re: /\bnetflix\b/i, label: 'Netflix' },
    { key: 'cricket', re: /\bcricket\b/i, label: 'Cricket match tickets' },
    { key: 'food', re: /\b(zomato|swiggy|food|pizza|burger|restaurant)\b/i, label: 'Food Delivery' },
  ];

  const keywordScores = keywordRules.map((rule) => {
    const titleHits = (titleBlob.match(rule.re) || []).length;
    const catHits = (lowerCats.match(rule.re) || []).length;
    return { key: rule.key, label: rule.label, score: titleHits + catHits };
  });

  const topKeyword = keywordScores.sort((a, b) => b.score - a.score)[0];
  const hasKeyword = Number(topKeyword?.score ?? 0) > 0;

  const templatesByKey = {
    swiggy: [
      {
        roast: 'Swiggy tumhe employee of the month dene wala hai, bro.',
        insight: `Food delivery mein tumhara recurring vibe hai. Is mahine total ₹${total.toLocaleString()} spend—impulsive ₹${impulsive.toLocaleString()}.`,
        suggestion: 'Ek fixed delivery day set karo aur baaki din “ghar ka khana supremacy mode”.',
      },
      {
        roast: 'Bro ₹4500 Swiggy pe uda diye? Itna toh mummy ek hafte ka ration le aati.',
        insight: `Agar Swiggy shares hote, toh tu majority shareholder hota.`,
        suggestion: '“Cart tomorrow” rule apply karo: order decision 24 hours ke liye delay.',
      },
    ],
    zomato: [
      {
        roast: 'Zomato pe itna invest kiya toh lag raha hai tu restaurant industry ka angel investor hai.',
        insight: `Is month tumhara food spend tumhare goals ko side pe rakh raha hai.`,
        suggestion: 'Week mein 2 “planned treats” rakh aur rest meals ko budget-friendly bana.',
      },
    ],
    uber: [
      {
        roast: 'Uber ko tum commute nahi, “monthly subscription” ki tarah treat kar rahe ho.',
        insight: `Transport pe spend ₹${topCategoryAmount.toLocaleString()} ke aas-paas ghoom raha hai. Consistency ka ROI 0 hai.`,
        suggestion: 'Short trips ke liye walk/auto plan karo aur Uber ko “emergency only” mode pe shift karo.',
      },
    ],
    rapido: [
      {
        roast: 'Rapido pe itna kharch? Bhai, gaadi nahi—tu “late fees” ko fund kar raha hai.',
        insight: `Transport spend ka pattern impulsive vs necessary mix ko skew kar raha hai.`,
        suggestion: 'Next time booking se pehle 10-minute wait rule try karo.',
      },
    ],
    chai: [
      {
        roast: '₹2000 chai pe kharch? Tu chai nahi pee raha, chai-paani ko startup fuel bana raha hai.',
        insight: `Chai tumhari daily habit ban chuki hai—small buys add up faster than you think.`,
        suggestion: 'Ek “chai cap” set karo: size chhota ya frequency kam, 7 din test.',
      },
    ],
    coffee: [
      {
        roast: 'Tu coffee nahi pee raha, Starbucks ka SIP plan chala raha hai.',
        insight: `Coffee + convenience = wallet ke liye slow disaster.`,
        suggestion: 'Daily coffee ko 3 din/week tak limit karke cravings track karo.',
      },
    ],
    cafe: [
      {
        roast: 'Cafe visits itne frequent ke lag raha hai tum syllabus revise karne nahi, bill revise karne aaye ho.',
        insight: `Bahar ka coffee tumhare “necessary” budget ko silently eat kar raha hai.`,
        suggestion: '1 cafe day/week + home-brew backup plan.',
      },
    ],
    shopping: [
      {
        roast: 'Amazon ko lag raha hoga tum unke investor ho.',
        insight: `Shopping pe spend tumhari savings ko “autopilot” pe disconnect kar raha hai.`,
        suggestion: 'Cart add karo, checkout next day—impulse purchases ko pause.',
      },
      {
        roast: 'Retail therapy itni zyada ki wallet bol raha hai: “bro, enough.”',
        insight: `Impulsive spending ka share strong lag raha hai—budget ka dashboard red zone pe ja raha hai.`,
        suggestion: 'Non-essential buying ke liye 24-hour cooling-off rule apply karo.',
      },
    ],
    recharge: [
      {
        roast: 'Recharge itna regular? Lagta hai tum “network” nahi, “habits” recharge kar rahe ho.',
        insight: `Small recurring spends accumulate. Total ₹${total.toLocaleString()} yaad hai?`,
        suggestion: 'Auto-renew check karo aur usage ke according plan switch karo.',
      },
    ],
    netflix: [
      {
        roast: 'Netflix subscription continue? Bhai, tum entertainment ko data nahi—subscription pe collect kar rahe ho.',
        insight: `Subscriptions tumhare budget mein “quiet thief” ban ke baith gaye hain.`,
        suggestion: '1 month subscription audit: jo use nahi karte, unko cut.',
      },
    ],
    cricket: [
      {
        roast: 'Cricket match tickets? Tu “field” mein nahi—tu “spend” mein loud ho raha hai.',
        insight: `Entertainment spend tumhare impulsive bucket ko boost kar raha hai. Total ₹${total.toLocaleString()}.`,
        suggestion: 'Ticket + snacks budget set karo: ek fixed cap aur rest home snacks.',
      },
    ],
    food: [
      {
        roast: 'Itna paisa food pe kharch kar rahe ho jaise MasterChef judge ho.',
        insight: `Food delivery tumhara stress-coping mechanism ban gaya hai. Is month impulsive ₹${impulsive.toLocaleString()} vs necessary ₹${necessary.toLocaleString()}.`,
        suggestion: '“Ghar ka khana supremacy mode”: week mein 3 din home meals, rest planned treats.',
      },
    ],
    spending: [
      {
        roast: 'Bro tumhare wallet ko therapy ki zarurat hai.',
        insight: total > 0
          ? `Is month tumne total ₹${total.toLocaleString()} spend kiya. Aur ${impulsive > necessary ? 'impulsive' : 'balanced'} vibe dominate kar rahi hai.`
          : 'Data toh chill lag raha hai—par habit abhi bhi watchlist pe hai.',
        suggestion: impulsive > necessary
          ? 'Next 7 days “cooling-off” rule: impulse purchases se pehle 24 hours wait.'
          : 'Top category ke liye ek simple weekly budget set karo aur check-in karo.',
      },
    ],
  };

  const templatesKey = hasKeyword ? topKeyword.key : topCategory.toLowerCase();
  const templates = templatesByKey[templatesKey] || templatesByKey.spending;

  // Deterministic-ish choice: based on total and category keyword string length.
  const seed = Math.floor(total + String(templatesKey).length + impulsive - necessary);
  const idx = Math.abs(seed) % templates.length;
  const chosen = templates[idx] || templates[0];

  const modeTransform = (t) => {
    const roast = String(t?.roast ?? '');
    const insight = String(t?.insight ?? '');
    const suggestion = String(t?.suggestion ?? '');

    if (safeMode === 'mom') {
      return {
        roast: `Beta, ${roast}`,
        insight: insight,
        suggestion: `Beta, ${suggestion}`,
      };
    }

    if (safeMode === 'ca') {
      return {
        roast: roast,
        insight: `CA view: ${insight} (ROI negative lag raha hai, warna budget itna "cry" nahi karta).`,
        suggestion: suggestion.replace('rule', 'rule (ROI safe)'),
      };
    }

    if (safeMode === 'savage') {
      return {
        roast: roast.includes('Bro') ? roast : `Sun ${roast}`,
        insight,
        suggestion,
      };
    }

    return { roast, insight, suggestion };
  };

  return modeTransform(chosen);
};

