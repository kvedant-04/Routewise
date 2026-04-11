/**
 * financialEngine.js
 * Phase 12 — Pure financial data engine for Routewise.
 * Zero side effects. Memoization-safe. Works on safeEvents array.
 */

const CATEGORY_KEYWORDS = {
  Food: ['restaurant', 'lunch', 'dinner', 'breakfast', 'cafe', 'food', 'eat', 'meal', 'snack', 'bar', 'pub', 'bakery'],
  Transport: ['taxi', 'metro', 'bus', 'train', 'uber', 'ride', 'transport', 'ferry', 'flight', 'tram', 'airport', 'station'],
  Accommodation: ['hotel', 'hostel', 'airbnb', 'resort', 'lodge', 'stay', 'check-in', 'check in', 'room'],
  Activities: ['museum', 'tour', 'ticket', 'entry', 'visit', 'explore', 'park', 'gallery', 'show', 'concert', 'experience'],
};

/**
 * Detect category from activity/place/notes text.
 * @param {object} evt - safeEvent object
 * @returns {string} category name
 */
export function detectCategory(evt) {
  const text = `${evt.activity} ${evt.place} ${evt.notes}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return category;
  }
  return 'Other';
}

/**
 * Build financialData from safeEvents array.
 * @param {Array} safeEvents
 * @returns {{ totalCost, perDayCost, categoryCost, eventCount }}
 */
export function buildFinancialData(safeEvents) {
  if (!Array.isArray(safeEvents) || safeEvents.length === 0) {
    return { totalCost: 0, perDayCost: {}, categoryCost: {}, eventCount: 0 };
  }

  const perDayCost = {};
  const categoryCost = {};
  let totalCost = 0;
  let eventCount = 0;

  for (const evt of safeEvents) {
    const cost = parseFloat(evt.cost) || 0;
    const day = evt.day || 1;
    const cat = detectCategory(evt);

    totalCost += cost;
    perDayCost[day] = (perDayCost[day] || 0) + cost;
    categoryCost[cat] = (categoryCost[cat] || 0) + cost;
    eventCount++;
  }

  return { totalCost, perDayCost, categoryCost, eventCount };
}

/**
 * Generate deterministic AI insights from financial data.
 * @param {{ totalCost, perDayCost, categoryCost }} financialData
 * @param {number} budget - user's stated budget
 * @returns {string[]} array of insight strings (min 1)
 */
export function getInsights(financialData, budget = 0) {
  const { totalCost, perDayCost, categoryCost } = financialData;
  const insights = [];

  const days = Object.keys(perDayCost);
  if (days.length === 0) return ['Your itinerary is ready. Add activities to see financial insights.'];

  const dayValues = days.map(d => perDayCost[d]);
  const avgDailySpend = totalCost / days.length;
  const maxDay = days.reduce((a, b) => perDayCost[a] > perDayCost[b] ? a : b, days[0]);
  const topCat = Object.keys(categoryCost).reduce((a, b) => categoryCost[a] > categoryCost[b] ? a : b, Object.keys(categoryCost)[0]);

  // Insight 1: budget comparison
  if (budget > 0) {
    const pct = Math.round((totalCost / budget) * 100);
    if (pct > 100) insights.push(`⚠️ Total spend ($${totalCost.toFixed(0)}) exceeds your budget by ${pct - 100}%.`);
    else if (pct > 80) insights.push(`💛 Spending at ${pct}% of budget — you're close to your limit.`);
    else insights.push(`✅ Great value! Spending at ${pct}% of your $${budget} budget.`);
  }

  // Insight 2: highest spend day
  if (perDayCost[maxDay] > avgDailySpend * 1.3) {
    insights.push(`📅 Day ${maxDay} is your highest-spend day at $${perDayCost[maxDay].toFixed(0)} — ${Math.round(perDayCost[maxDay] / avgDailySpend * 100 - 100)}% above average.`);
  }

  // Insight 3: dominant category
  if (topCat && categoryCost[topCat] > 0) {
    const pct = Math.round((categoryCost[topCat] / totalCost) * 100);
    insights.push(`🏷️ ${topCat} dominates your spend at $${categoryCost[topCat].toFixed(0)} (${pct}% of total).`);
  }

  // Insight 4: free day
  const freeDays = days.filter(d => perDayCost[d] === 0);
  if (freeDays.length > 0) {
    insights.push(`🆓 Day ${freeDays.join(', ')} has no recorded costs — great budget day!`);
  }

  // Fallback
  if (insights.length === 0) {
    insights.push('✅ Your spending looks balanced across all days.');
  }

  return insights;
}
