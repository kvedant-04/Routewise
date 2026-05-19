/**
 * exportEngine.js
 * Phase 12 — Export utilities for Routewise. All async, non-blocking.
 */

/**
 * Sanitize destination name and return a filesystem-safe, human-readable filename.
 * Preserves unicode characters (Japanese, Arabic, accents, emojis, etc.) but removes unsafe filesystem characters.
 * 
 * Format examples:
 * - PDF: Routewise_Japan_Itinerary_2026-05-18.pdf
 * - IMAGE: Routewise_Japan_Travel_Card.png
 * - JSON: Routewise_Japan_Itinerary_Data.json
 * - CALENDAR: Routewise_Japan_Trip.ics
 */
export function getSafeFileName(destination, type, extension) {
  let sanitizedDest = (destination || 'Itinerary')
    .trim()
    .replace(/[\\/:*?"<>|]/g, '') // Remove Windows invalid characters
    .replace(/\s+/g, '_'); // Replace spaces with underscores

  if (!sanitizedDest) {
    sanitizedDest = 'Itinerary';
  }

  const dateStr = new Date().toISOString().split('T')[0];

  if (type === 'pdf') {
    return `Routewise_${sanitizedDest}_Itinerary_${dateStr}.pdf`;
  }
  if (type === 'image') {
    return `Routewise_${sanitizedDest}_Travel_Card.png`;
  }
  if (type === 'json') {
    return `Routewise_${sanitizedDest}_Itinerary_Data.json`;
  }
  if (type === 'calendar') {
    return `Routewise_${sanitizedDest}_Trip.ics`;
  }
  return `Routewise_${sanitizedDest}_${type}_${dateStr}.${extension}`;
}

/**
 * Download a blob file safely — cross-browser (Chrome, Edge, Brave, Safari).
 *
 * MANDATORY PATTERN:
 *   appendChild → click → removeChild (sync) → setTimeout(revokeObjectURL, 1000)
 *
 * Why removeChild is synchronous:
 *   Chrome resolves the blob URL and reads the download attribute AFTER the click
 *   event fires. If the anchor is removed before that resolution completes
 *   (e.g. inside a setTimeout), Chrome loses the `download` attribute context
 *   and falls back to the raw blob UUID as the filename.
 *
 * Why revoke is delayed to 1000ms:
 *   Revoking immediately after click() cancels the stream before the browser
 *   has written the bytes to disk, causing corrupted or empty downloads.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;       // ← MUST be set before appendChild
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a); // ← sync, immediately after click

  // Only revoke AFTER the browser has had time to start the download
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * Export itinerary as a UTF-8 JSON file.
 * @param {object} itinerary - raw itinerary object
 * @param {string} destination - destination name
 */
export function exportJSON(itinerary, destination) {
  if (!itinerary) return;
  const jsonString = JSON.stringify(itinerary, null, 2);
  // Strict UTF-8 declaration
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = getSafeFileName(destination, 'json', 'json');
  downloadBlob(blob, filename);
}

/**
 * Helper to escape special iCalendar character sequences.
 */
function escapeICSValue(str) {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
}

/**
 * Helper to parse activity times into hours/minutes.
 * Defaults intelligently if descriptive words (Morning, Lunch, etc.) are used.
 */
function parseTime(timeStr) {
  const clean = (timeStr || '').trim().toLowerCase();
  
  // Try matching HH:MM (e.g. "09:00" or "14:30")
  const match = clean.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) };
  }
  
  // Fallbacks for descriptive words
  if (clean.includes('morning') || clean.includes('breakfast') || clean.includes('am')) {
    return { hour: 9, minute: 0 };
  }
  if (clean.includes('afternoon') || clean.includes('lunch') || clean.includes('pm')) {
    return { hour: 13, minute: 0 };
  }
  if (clean.includes('evening') || clean.includes('dinner')) {
    return { hour: 18, minute: 0 };
  }
  if (clean.includes('night') || clean.includes('late')) {
    return { hour: 21, minute: 0 };
  }
  
  // Universal default
  return { hour: 10, minute: 0 };
}

/**
 * Helper to format date and time to YYYYMMDDTHHMMSS for iCalendar floating local time.
 */
function formatICSDateTime(date, hour, minute) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(hour).padStart(2, '0');
  const min = String(minute).padStart(2, '0');
  return `${yyyy}${mm}${dd}T${hh}${min}00`;
}

/**
 * Exporter for .ics Calendar files.
 * Generates timezone-safe, correctly formatted events.
 * 
 * @param {Array} safeEvents - list of events from the itinerary
 * @param {string} destination - trip destination
 */
export function exportICS(safeEvents, destination) {
  if (!safeEvents || safeEvents.length === 0) return;

  const now = new Date();
  const dtstamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // We set the start date to tomorrow by default
  const tripStartDate = new Date();
  tripStartDate.setDate(tripStartDate.getDate() + 1);

  let icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Routewise//Travel Itinerary//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  safeEvents.forEach(evt => {
    // Determine the date of the event based on the day number (evt.day is 1-indexed)
    const eventDate = new Date(tripStartDate);
    const dayOffset = Math.max(0, parseInt(evt.day || 1, 10) - 1);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    // Parse the start time
    const { hour, minute } = parseTime(evt.time);
    const dtStart = formatICSDateTime(eventDate, hour, minute);

    // Default duration: 1.5 hours
    let endHour = hour + 1;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
      endHour += 1;
      endMinute -= 60;
    }
    if (endHour >= 24) {
      endHour = 23;
      endMinute = 59;
    }
    const dtEnd = formatICSDateTime(eventDate, endHour, endMinute);

    const uid = `${evt.id || Math.random().toString(36).substring(2)}@routewise.ai`;

    icsLines.push('BEGIN:VEVENT');
    icsLines.push(`UID:${uid}`);
    icsLines.push(`DTSTAMP:${dtstamp}`);
    icsLines.push(`DTSTART:${dtStart}`);
    icsLines.push(`DTEND:${dtEnd}`);
    icsLines.push(`SUMMARY:${escapeICSValue(evt.activity || 'Activity')}`);
    
    if (evt.notes) {
      icsLines.push(`DESCRIPTION:${escapeICSValue(evt.notes)}`);
    }
    if (evt.place) {
      icsLines.push(`LOCATION:${escapeICSValue(evt.place)}`);
    }
    
    icsLines.push('END:VEVENT');
  });

  icsLines.push('END:VCALENDAR');

  const icsContent = icsLines.join('\r\n');
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
  const filename = getSafeFileName(destination, 'calendar', 'ics');
  downloadBlob(blob, filename);
}

/**
 * Build a Google Calendar event URL for a single activity. (Legacy compat fallback)
 */
export function buildGoogleCalendarUrl(evt, dateStr = '') {
  const base = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
  const title = encodeURIComponent(`${evt.activity} @ ${evt.place}`);
  const details = encodeURIComponent(evt.notes || '');
  const location = encodeURIComponent(evt.place || '');
  return `${base}&text=${title}&details=${details}&location=${location}`;
}
