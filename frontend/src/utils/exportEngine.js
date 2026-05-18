/**
 * exportEngine.js
 * Phase 12 — Export utilities for Routewise. All async, non-blocking.
 */

/** Download a plain file */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export itinerary as JSON file.
 * @param {object} itinerary - raw itinerary object
 */
export function exportJSON(itinerary) {
  if (!itinerary) return;
  const blob = new Blob([JSON.stringify(itinerary, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `routewise-itinerary-${Date.now()}.json`);
}


/**
 * Build a Google Calendar event URL for a single activity.
 */
export function buildGoogleCalendarUrl(evt, dateStr = '') {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const title = encodeURIComponent(`${evt.activity} @ ${evt.place}`);
  const details = encodeURIComponent(evt.notes || '');
  const location = encodeURIComponent(evt.place || '');
  return `${base}&text=${title}&details=${details}&location=${location}`;
}


