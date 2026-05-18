import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * pdfEngine.js
 * 
 * Professional PDF generator that takes a structured, hidden DOM tree 
 * containing `.pdf-page` elements and sequentially renders them to A4 pages.
 * Ensures memory safety by destroying canvases immediately after appending.
 */

export async function generatePDF(containerId, destination, onProgress) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('PDF container not found in DOM.');

  // Find all individual pages within the template
  const pages = Array.from(container.querySelectorAll('.pdf-page'));
  if (pages.length === 0) throw new Error('No .pdf-page elements found.');

  // Initialize jsPDF in A4 format (210x297mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const A4_WIDTH = 210;
  const A4_HEIGHT = 297;

  for (let i = 0; i < pages.length; i++) {
    const pageEl = pages[i];
    
    if (onProgress) {
      onProgress(`Rendering page ${i + 1} of ${pages.length}...`);
    }

    // html2canvas settings optimized for crisp text but manageable size
    const canvas = await html2canvas(pageEl, {
      scale: 2, // 2x gives retina sharpness without crashing memory
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#0a0f1e', // Dark mode background
      onclone: (clonedDoc) => {
        // Prevent any scrollbar artifacts on the clone
        const el = clonedDoc.getElementById(pageEl.id || '');
        if (el) el.style.transform = 'none';
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG compression 85% is ideal for PDFs

    if (i > 0) {
      doc.addPage();
    }

    // We draw exactly to A4 boundaries. 
    // The CSS of .pdf-page MUST be exactly A4 proportions (e.g. 794x1123 px).
    doc.addImage(imgData, 'JPEG', 0, 0, A4_WIDTH, A4_HEIGHT);

    // Immediate cleanup to avoid OOM crash on 10-page itineraries
    canvas.width = 0;
    canvas.height = 0;
  }

  if (onProgress) {
    onProgress('Finalizing PDF...');
  }

  const safeDest = (destination || 'Itinerary').toLowerCase().replace(/\s+/g, '-');
  doc.save(`routewise-${safeDest}-${Date.now()}.pdf`);
}
