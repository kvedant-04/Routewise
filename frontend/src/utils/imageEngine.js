import html2canvas from 'html2canvas';
import { getSafeFileName, downloadBlob } from './exportEngine';

/**
 * imageEngine.js
 * 
 * Professional image generator that takes a hidden `.social-share-card` element
 * and renders a perfectly crisp PNG export.
 */

export async function generateSocialImage(containerId, destination, onProgress) {
  const container = document.getElementById(containerId);
  if (!container) throw new Error('Social share container not found in DOM.');

  if (onProgress) {
    onProgress('Rendering high-res image...');
  }

  // Optimize for crisp 2x scaling to look great on social media
  const canvas = await html2canvas(container, {
    scale: 2, 
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff' // Light mode premium card background
  });

  if (onProgress) {
    onProgress('Finalizing image...');
  }

  canvas.toBlob((blob) => {
    if (!blob) throw new Error('Failed to create image blob.');
    
    const filename = getSafeFileName(destination, 'image', 'png');
    downloadBlob(blob, filename);
    
    // Cleanup canvas memory
    canvas.width = 0;
    canvas.height = 0;
  }, 'image/png');
}
