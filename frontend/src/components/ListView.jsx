import React, { useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import MediaModal from './MediaModal';
import PremiumImage from './PremiumImage';

/**
 * ListView v3 — Media-integrated activity cards.
 * Each card: image top → activity → place → time/cost → notes
 * Props: data (safeEvents), destination, activeId, onActivityHover
 */
const ListView = React.memo(({ data, destination, activeId, onActivityHover }) => {
  const [modalEvent, setModalEvent] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div className="lv-empty">
        <span>No itinerary events to display.</span>
      </div>
    );
  }

  const days = [...new Set(data.map(e => e.day))].sort((a, b) => a - b);

  return (
    <>
      <div className="lv-root">
        {days.map((dayNum) => {
          const dayEvents = data.filter(e => e.day === dayNum);
          return (
            <div key={dayNum} className="lv-day-group">
              <div className="lv-day-header">
                <span className="lv-day-pill">Day {dayNum}</span>
              </div>

              <div className="lv-cards">
                {dayEvents.map((act, idx) => {
                  return (
                    <div
                      key={act.id}
                      id={`activity-${act.id}`}
                      className={`lv-card ${activeId === act.id ? 'lv-card--active' : ''}`}
                      onMouseEnter={() => onActivityHover?.(act.id)}
                      onMouseLeave={() => onActivityHover?.(null)}
                    >
                      {/* ── Cinematic Image Header ── */}
                      <div
                        className="lv-card-hero"
                        onClick={() => setModalEvent(act)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setModalEvent(act)}
                        aria-label={`View full image for ${act.place}`}
                        style={{ display: 'block', width: '100%' }}
                      >
                        <PremiumImage
                          event={act}
                          destination={destination}
                          priority={dayNum === 1 && idx < 2} // Tier 1 above-the-fold
                          aspectRatio="16/9"
                          className="lv-hero-img-wrapper"
                        />
                        <div className="lv-hero-overlay">
                          <span className="lv-hero-action">Expand Image</span>
                        </div>
                      </div>

                      {/* ── Strict Content Hierarchy ── */}
                      <div className="lv-card-content">
                        {/* 1. TIME */}
                        <div className="lv-time-marker">
                          <Clock size={14} />
                          <span>{act.time}</span>
                        </div>

                        {/* 2. TITLE */}
                        <h3 className="lv-title">{act.activity}</h3>

                        {/* 3. LOCATION */}
                        <div className="lv-location">
                          <MapPin size={14} />
                          <span>{act.place}</span>
                        </div>

                        {/* 4. INSIGHT */}
                        {act.notes && (
                          <div className="lv-insight">
                            <p>{act.notes}</p>
                          </div>
                        )}

                        {/* 5. META */}
                        <div className="lv-meta-footer">
                          <div className="lv-badges">
                            <span className="lv-badge lv-badge--dur">{act.duration}</span>
                            {act.costLabel && (
                              <span className="lv-badge lv-badge--cost">{act.costLabel}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contained modal popup */}
      {modalEvent && (
        <MediaModal
          event={modalEvent}
          destination={destination}
          onClose={() => setModalEvent(null)}
        />
      )}
    </>
  );
});

export default ListView;
