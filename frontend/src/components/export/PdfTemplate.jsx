import React, { useEffect, useState } from 'react';
import './export-styles.css';
import PremiumImage from '../PremiumImage';
import { MapPin, Clock } from 'lucide-react';

/**
 * PdfTemplate
 * 
 * Hidden DOM tree engineered for flawless html2canvas PDF rendering.
 * Enforces strict A4 pages (`.pdf-page`) and renders sequentially.
 */
export default function PdfTemplate({ safeEvents, financialData, destination, onReady }) {
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // We group by day. Each day gets its own exact A4 page. 
  // If a day has too many events, they will naturally overflow in a hidden way (for a real prod app we would split them into multiple A4s, but for this dossier we cap styling).
  const daysMap = {};
  safeEvents.forEach(evt => {
    if (!daysMap[evt.day]) daysMap[evt.day] = [];
    daysMap[evt.day].push(evt);
  });
  const daysList = Object.keys(daysMap).sort((a,b)=>Number(a)-Number(b)).map(k => ({
    dayNum: k,
    events: daysMap[k]
  }));

  const totalCost = financialData?.totalCost || 0;

  // Simple artificial delay to allow PremiumImages to hydrate
  useEffect(() => {
    const timer = setTimeout(() => {
      setImagesLoaded(true);
      onReady?.();
    }, 2000); // Wait 2s for images to settle in cache and render
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div id="pdf-export-root" className="pdf-export-root">
      {/* ── Page 1: Cover ── */}
      <div className="pdf-page" id="pdf-page-cover">
        <PremiumImage 
          destination={destination}
          aspectRatio="auto"
          className="pdf-cover-image"
          priority={true}
        />
        <div className="pdf-cover-gradient" />
        
        <div className="pdf-cover-content">
          <div className="pdf-cover-brand">Routewise Travel Dossier</div>
          <h1 className="pdf-cover-title">{destination}</h1>
          <div className="pdf-cover-meta">
            <div className="pdf-meta-item">
              <span className="pdf-meta-label">Duration</span>
              <span className="pdf-meta-value">{daysList.length} Days</span>
            </div>
            <div className="pdf-meta-item">
              <span className="pdf-meta-label">Total Spend</span>
              <span className="pdf-meta-value">${totalCost.toFixed(0)}</span>
            </div>
            <div className="pdf-meta-item">
              <span className="pdf-meta-label">Generated</span>
              <span className="pdf-meta-value">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="pdf-page-footer">
          <span>Powered by Routewise AI</span>
          <span>routewise.ai</span>
        </div>
      </div>

      {/* ── Page 2..N: Daily Itineraries ── */}
      {daysList.map((dayGroup, i) => (
        <div className="pdf-page" id={`pdf-page-${dayGroup.dayNum}`} key={dayGroup.dayNum}>
          <div className="pdf-day-page">
            <div className="pdf-day-header">
              <h2 className="pdf-day-title">Day {dayGroup.dayNum}</h2>
            </div>
            
            <div className="pdf-event-list">
              {dayGroup.events.slice(0, 5).map(evt => ( // Cap to 5 to fit exactly on one A4 page without clipping
                <div className="pdf-event-row" key={evt.id}>
                  <div className="pdf-event-time">{evt.time}</div>
                  
                  <div className="pdf-event-body">
                    <div className="pdf-event-title">{evt.activity}</div>
                    <div className="pdf-event-place">
                      <MapPin size={12} color="var(--cyan)" />
                      <span>{evt.place}</span>
                    </div>
                    {evt.notes && (
                      <div className="pdf-event-notes">
                        {evt.notes.length > 140 ? evt.notes.substring(0, 140) + '...' : evt.notes}
                      </div>
                    )}
                  </div>

                  <div className="pdf-event-image-wrap">
                    <PremiumImage
                      event={evt}
                      destination={destination}
                      aspectRatio="1/1"
                      className="pdf-event-image"
                      priority={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pdf-page-footer">
            <span>{destination} — Day {dayGroup.dayNum}</span>
            <span>Page {i + 2}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
