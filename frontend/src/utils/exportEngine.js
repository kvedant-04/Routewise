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
 * Export a DOM element as PNG image.
 * @param {string} elementId - ID of element to capture
 */
export async function exportImage(elementId) {
  const { default: html2canvas } = await import('html2canvas');
  const el = document.getElementById(elementId);
  if (!el) { console.warn('exportImage: element not found', elementId); return; }
  const canvas = await html2canvas(el, { backgroundColor: '#0a0f1e', scale: 2, useCORS: true });
  canvas.toBlob(blob => {
    if (blob) downloadBlob(blob, `routewise-itinerary-${Date.now()}.png`);
  });
}

/**
 * Export itinerary as PDF.
 * @param {Array} safeEvents
 * @param {{ totalCost, perDayCost }} financialData
 * @param {string} destination
 */
export async function exportPDF(safeEvents, financialData, destination = 'Routewise') {
  const { default: jsPDF } = await import('jspdf');
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });

  doc.setFillColor(10, 15, 30);
  doc.rect(0, 0, 210, 297, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(`Routewise — ${destination}`, 15, 20);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated ${new Date().toLocaleDateString()}  •  Total: $${(financialData?.totalCost || 0).toFixed(0)}`, 15, 28);

  doc.setDrawColor(34, 211, 238);
  doc.line(15, 32, 195, 32);

  let y = 42;
  const days = [...new Set(safeEvents.map(e => e.day))].sort((a, b) => a - b);

  for (const dayNum of days) {
    const events = safeEvents.filter(e => e.day === dayNum);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(34, 211, 238);
    doc.text(`Day ${dayNum}`, 15, y);
    y += 6;

    for (const evt of events) {
      if (y > 270) { doc.addPage(); doc.setFillColor(10, 15, 30); doc.rect(0, 0, 210, 297, 'F'); y = 20; }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${evt.time}  ${evt.activity}`, 18, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text(`📍 ${evt.place}`, 18, y + 5);
      if (evt.notes) {
        const lines = doc.splitTextToSize(evt.notes, 150);
        doc.text(lines, 18, y + 10);
        y += 10 + lines.length * 4.5 + 6;
      } else {
        y += 14;
      }

      if (evt.cost > 0) {
        doc.setTextColor(34, 211, 238);
        doc.text(`$${Number(evt.cost).toFixed(0)}`, 185, y - 2, { align: 'right' });
      }
    }
    y += 4;
  }

  // Cost summary
  if (y > 250) { doc.addPage(); doc.setFillColor(10, 15, 30); doc.rect(0, 0, 210, 297, 'F'); y = 20; }
  doc.setDrawColor(34, 211, 238);
  doc.line(15, y, 195, y);
  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Cost Summary', 15, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(156, 163, 175);
  for (const [day, cost] of Object.entries(financialData?.perDayCost || {})) {
    doc.text(`Day ${day}`, 18, y);
    doc.text(`$${cost.toFixed(0)}`, 185, y, { align: 'right' });
    y += 5;
  }
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(34, 211, 238);
  doc.text('Total', 18, y + 3);
  doc.text(`$${(financialData?.totalCost || 0).toFixed(0)}`, 185, y + 3, { align: 'right' });

  doc.save(`routewise-${destination.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.pdf`);
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

/**
 * Build a WhatsApp share link from itinerary summary.
 */
export function buildWhatsAppText(safeEvents, financialData, destination = '') {
  const lines = [
    `✈️ *Routewise — ${destination} Itinerary*`,
    `💰 Total Budget: $${(financialData?.totalCost || 0).toFixed(0)}`,
    `📅 ${[...new Set(safeEvents.map(e => e.day))].length} Days`,
    '',
    ...safeEvents.slice(0, 5).map(e => `• Day ${e.day}: ${e.activity} @ ${e.place}`),
    '',
    '🔗 Generated via Routewise AI — routewise.ai'
  ];
  const text = encodeURIComponent(lines.join('\n'));
  return `https://wa.me/?text=${text}`;
}
