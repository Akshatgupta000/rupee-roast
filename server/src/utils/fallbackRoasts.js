/**
 * Fallback Hinglish Roast Generator
 * Used when Gemini API fails or hits rate limits
 * Returns: { roast: string, insight: string, suggestion: string }
 */

const roastLines = [
  'Bro tum paisa spend nahi kar rahe, paisa tumse bhaag raha hai.',
  'Wallet tumhara hai par control Swiggy ka lag raha hai.',
  '₹500 coffee pe? Barista tumhe shareholder samajh raha hoga.',
  'Itna online shopping karte ho, Amazon ko lag raha hoga tum investor ho.',
  'Bro tum budget nahi banate, tum budget todte ho.',
  'Zomato tumhe loyalty award dene wala hai.',
  'Wallet kholte hi hawa chalne lagti hogi.',
  'Swiggy tumhe employee of the month bana de.',
  'Itna food order karte ho jaise MasterChef judge ho.',
  'Tumhara bank balance bhi tumse emotional ho gaya hai.',
  'Papa ko pata chal gaya toh tumhari financial independence khatam.',
  'UPI app bhi tumhe dekh ke darr jaata hoga.',
  'Bro tum savings nahi karte, tum savings se door bhaagte ho.',
  'Budget sheet tumhari dekh ke Excel bhi crash ho gaya.',
  'Tumhara wallet aur gym membership dono unused lag rahe hain.',
  'Recharge bhi karte ho aur pocket bhi discharge kar dete ho.',
  'Swiggy tumhari wajah se IPO launch karega.',
  'Tumhari spending dekh ke RBI bhi confused hai.',
  'Bro tum investment nahi karte, tum impulse shopping karte ho.',
  'Tumhara paisa Zomato ke warehouse mein reh raha hai.',
  '₹200 chai pe? Tu chai nahi pee raha, startup fuel kar raha hai.',
  'Tumhara wallet bol raha hai: bhai mujhe bachao.',
  'Bro tumhari spending Netflix series se zyada dramatic hai.',
  'Shopping cart tumhari permanent residence ban gaya hai.',
  'Tumhare bank account ka mood permanent sad hai.',
  'Tu khana order nahi kar raha, tu restaurant sponsor kar raha hai.',
  'Tumhari financial planning ek Bollywood plot jaisi hai.',
  'UPI notification bhi tumse thak gaya hai.',
  'Bro tumhara paisa travel nahi karta, seedha disappear ho jata hai.',
  'Tumhara budget ek myth hai.',
  'Swiggy wale tumhe naam se jaante honge.',
  'Tu paisa uda raha hai jaise IPL auction chal raha ho.',
  'Tumhari wallet story Netflix documentary ban sakti hai.',
  'Bro tumhara expense graph Himalaya chadh raha hai.',
  'Tumhare kharche dekh ke calculator bhi stress mein hai.',
  'Bank balance ka BP low ho gaya hai.',
  'Bro tum savings ko ghost kar rahe ho.',
  'Tumhare kharche dekh ke CA bhi resign kar de.',
  'Swiggy aur Zomato tumhe joint appreciation award denge.',
  'Tumhara paisa WiFi signal jaisa hai — kabhi stable nahi.',
  'Tumhari financial life ek meme template hai.',
  'Tum budget nahi follow karte, budget tumse bhaagta hai.',
  'Tumhara wallet therapy lene wala hai.',
  'Bro tumhara paisa bhi tumse break lena chahta hai.',
  'Tumhare kharche dekh ke Excel sheet bhi ro rahi hai.',
  'Tu chai pe nahi jee raha, chai pe survive kar raha hai.',
  'Tumhara paisa Amazon warehouse mein shift ho gaya.',
  'Tumhari spending habits RBI ko bhi emotional kar de.',
  'Wallet khali aur cart full — classic combo.',
  'Bro tumhara paisa weekend pe permanently chhutti pe chala jata hai.',
];

const categoryInsights = {
  Food: 'Is mahine tumhara sabse zyada paisa Food category mein gaya. Swiggy/Zomato ko thanks bolna padega.',
  Transport:
    'Transport par tum royalty de rahe ho. Uber aur Ola tumhe VIP member samajhte honge.',
  Shopping:
    'Shopping addiction tumhara diagnosis confirm ho gaya hai. Amazon aur Flipkart tumhare best friends.',
  Entertainment:
    'Entertainment ke naam pe wallets ghumti hain! OTT subscriptions aur tickets ka combo deadly hai.',
  Utilities: 'Bills bhi paisa the aur tum unhe celebrate kar rahe ho!',
  Health:
    'Health par invest accha hai, par itna? Doctor bhi surprised ho jaega.',
  Education:
    'Education budget mein toh tum serious ho, lekin spending logs se nahi dikh raha.',
  Other: 'Miscellaneous mein jo spend kar rahe ho, woh samajh nahi aata.',
};

const categorySuggestions = [
  'Try ghar ka khana 3 din per week.',
  'Weekly spending limit set karo.',
  'Impulse shopping se bachne ke liye 24 hour rule try karo.',
  'Cart ko paani se dhone se pehle 24 hours soch lo kya chahiye.',
  'Subscriptions audit karo—jo use nahi karte unhe cancel karo.',
  'Ek fixed budget day-wise set karo aur strictly follow karo.',
  'Bank notifications on rakho—har paisa ka alert tumhe rok dega.',
  'Savings goal set karo aur uske against paisa lock karo.',
];

/**
 * Generate a fallback roast when Gemini API fails
 * @param {Object} expenseSummary - Array of normalized expenses
 * @param {Object} currentMonthStats - Current month statistics
 * @returns {Object} { roast, insight, suggestion }
 */
export const generateFallbackRoast = (
  expenseSummary = [],
  currentMonthStats = {},
) => {
  const expenses = Array.isArray(expenseSummary) ? expenseSummary : [];

  // Pick random roast line
  const randomRoast = roastLines[Math.floor(Math.random() * roastLines.length)];

  // Calculate top spending category
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = expense?.category || 'Other';
    const amount = Number(expense?.amount) || 0;
    acc[category] = (acc[category] || 0) + amount;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  );
  const topCategory = sortedCategories[0]?.[0] || 'Other';

  // Generate insight based on top category
  const baseInsight = categoryInsights[topCategory] || categoryInsights.Other;
  const totalSpent = currentMonthStats?.totalSpent || 0;
  const topCategoryAmount = categoryTotals[topCategory] || 0;

  const insight =
    totalSpent > 0
      ? `${baseInsight} (Total spend: ₹${totalSpent.toLocaleString()}, ${topCategory}: ₹${topCategoryAmount.toLocaleString()})`
      : baseInsight;

  // Generate suggestion - pick random or category-specific
  const randomSuggestion =
    categorySuggestions[Math.floor(Math.random() * categorySuggestions.length)];
  let finalSuggestion = randomSuggestion;

  if (topCategory === 'Food') {
    finalSuggestion =
      'Try ghar ka khana 3 din per week. Baaki din planned treats only.';
  } else if (topCategory === 'Transport') {
    finalSuggestion =
      'Short trips ke liye walk/auto lo aur Uber ko emergency mode se nikalo.';
  } else if (topCategory === 'Shopping') {
    finalSuggestion =
      '24-hour rule: keemat dkh lo, fir wait karo next day. Phir decide karna kya chahiye.';
  } else if (topCategory === 'Entertainment') {
    finalSuggestion =
      'Subscription audit: Jo use nahi karte, unhe abhi cut karo.';
  }

  return {
    roast: randomRoast,
    insight: insight,
    suggestion: finalSuggestion,
  };
};
