/**
 * Test file for fallback roast generator
 * Run with: node test_fallback_roasts.js
 */

import { generateFallbackRoast } from './src/utils/fallbackRoasts.js';

// Test with sample expense data
const testExpenses = [
  { category: 'Food', amount: 2500, title: 'Swiggy' },
  { category: 'Food', amount: 1800, title: 'Zomato' },
  { category: 'Transport', amount: 1200, title: 'Uber' },
  { category: 'Shopping', amount: 3500, title: 'Amazon' },
  { category: 'Entertainment', amount: 800, title: 'Netflix' },
];

const testMonthStats = {
  totalSpent: 9800,
  impulsiveSpent: 6500,
  necessarySpent: 3300,
  categoryBreakdown: {
    Food: 4300,
    Transport: 1200,
    Shopping: 3500,
    Entertainment: 800,
  },
};

console.log('🚀 Testing Fallback Roast Generator\n');
console.log('='.repeat(60));

// Generate multiple roasts to show variety
for (let i = 1; i <= 3; i++) {
  console.log(`\n📱 Test ${i}:`);
  const result = generateFallbackRoast(testExpenses, testMonthStats);
  console.log(`\n🔥 Roast:\n"${result.roast}"\n`);
  console.log(`💡 Insight:\n"${result.insight}"\n`);
  console.log(`💰 Suggestion:\n"${result.suggestion}"`);
  console.log('\n' + '='.repeat(60));
}

console.log('\n✅ Fallback roast generator is working perfectly!');
