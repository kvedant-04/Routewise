/**
 * shareFormatters.js
 * 
 * Premium text formatters for clipboard and WhatsApp sharing.
 * Safely constructs URI-encoded strings and clipboard text with professional spacing.
 */

/**
 * Helper to group events by day
 */
function groupByDay(safeEvents) {
  const daysMap = {};
  safeEvents.forEach(evt => {
    if (!daysMap[evt.day]) daysMap[evt.day] = [];
    daysMap[evt.day].push(evt);
  });
  return Object.keys(daysMap).sort((a, b) => Number(a) - Number(b)).map(k => ({
    day: k,
    events: daysMap[k]
  }));
}

/**
 * Generate a beautifully structured string for WhatsApp or Clipboard
 */
function generateStructuredText(safeEvents, financialData, destination, currency = 'USD') {
  if (!safeEvents || safeEvents.length === 0) return 'No itinerary available.';

  const dayGroups = groupByDay(safeEvents);
  const totalDays = dayGroups.length;
  const budget = financialData?.totalCost ? Math.round(financialData.totalCost).toLocaleString() : '0';

  let text = `Routewise — ${destination} Itinerary\n`;
  text += `${totalDays} Days • Budget: ${currency} ${budget}\n\n`;

  dayGroups.forEach(group => {
    text += `Day ${group.day}\n`;
    group.events.forEach(evt => {
      // e.g. "• Visit Senso-ji Temple — 09:00 AM"
      text += `• ${evt.activity} — ${evt.time}\n`;
    });
    text += '\n'; // spacing between days
  });

  text += `Generated via Routewise AI`;
  return text;
}

/**
 * Build a URI-safe WhatsApp share link
 */
export function formatForWhatsApp(safeEvents, financialData, destination, currency = 'USD') {
  const rawText = generateStructuredText(safeEvents, financialData, destination, currency);
  const encodedText = encodeURIComponent(rawText);
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Format string for standard clipboard copy
 */
export function formatForClipboard(safeEvents, financialData, destination, currency = 'USD') {
  return generateStructuredText(safeEvents, financialData, destination, currency);
}
