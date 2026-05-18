import React, { useEffect } from 'react';
import './export-styles.css';
import PremiumImage from '../PremiumImage';
import { MapPin, Calendar, DollarSign } from 'lucide-react';

/**
 * SocialShareCard
 * 
 * Hidden DOM tree engineered for a perfect 4:5 (1080x1350) social media export.
 * Clean, editorial, and highly visual.
 */
export default function SocialShareCard({ safeEvents, financialData, destination, onReady }) {
  const days = [...new Set(safeEvents.map(e => e.day))].length;
  const totalCost = financialData?.totalCost || 0;

  // Let images load
  useEffect(() => {
    const timer = setTimeout(() => {
      onReady?.();
    }, 1500);
    return () => clearTimeout(timer);
  }, [onReady]);

  return (
    <div id="social-export-root" className="social-export-root">
      <div className="social-card">
        {/* We use the first event as the background if possible, or fallback to destination */}
        <PremiumImage
          event={safeEvents[0]}
          destination={destination}
          aspectRatio="auto"
          className="social-card-bg"
          priority={true}
        />
        
        <div className="social-card-overlay" />

        <div className="social-card-content">
          <div className="social-card-brand">Routewise Travel Dossier</div>
          <h1 className="social-card-title">{destination}</h1>
          
          <div className="social-card-meta">
            <div className="social-meta-item">
              <Calendar size={32} className="social-meta-icon" />
              <span>{days} Days</span>
            </div>
            <div className="social-meta-item">
              <DollarSign size={32} className="social-meta-icon" />
              <span>${totalCost.toFixed(0)}</span>
            </div>
            <div className="social-meta-item">
              <MapPin size={32} className="social-meta-icon" />
              <span>Verified Plan</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
