import React, { useState } from 'react';
import { MapPin, Clock, FileText } from 'lucide-react';
import MediaModal from './MediaModal';

/**
 * ListView v3 — Media-integrated activity cards.
 * Each card: image top → activity → place → time/cost → notes
 * Props: data (safeEvents), activeId, onActivityHover, mediaMap
 */
const ListView = React.memo(({ data, activeId, onActivityHover, mediaMap }) => {
  const [modalEvent, setModalEvent] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  if (!data || data.length === 0) {
    return (
      <div className="lv-empty">
        <span>No itinerary events to display.</span>
      </div>
    );
  }

  const days = [...new Set(data.map(e => e.day))].sort((a, b) => a - b);

  const handleImgError = (id, idx) => {
    setImgErrors(prev => ({ ...prev, [id]: `https://picsum.photos/seed/lverr${idx}/900/520` }));
  };

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
                  const imgSrc = imgErrors[act.id]
                    || mediaMap?.[act.id]
                    || `https://picsum.photos/seed/${act.id || idx}/900/520`;

                  return (
                    <div
                      key={act.id}
                      id={`activity-${act.id}`}
                      className={`lv-card lv-card--media ${activeId === act.id ? 'lv-card--active' : ''}`}
                      onMouseEnter={() => onActivityHover?.(act.id)}
                      onMouseLeave={() => onActivityHover?.(null)}
                    >
                      {/* ── Row 1: Image ── */}
                      <div
                        className="lv-img-wrap"
                        onClick={() => setModalEvent(act)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && setModalEvent(act)}
                        aria-label={`View ${act.activity}`}
                      >
                        <img
                          src={imgSrc}
                          alt={act.place || act.activity}
                          className="lv-img"
                          loading="lazy"
                          onError={() => handleImgError(act.id, idx)}
                        />
                        <div className="lv-img-overlay">
                          <span className="lv-img-hint">Click to expand</span>
                        </div>
                        <span className="lv-time-chip">
                          <Clock size={10} /> {act.time}
                        </span>
                      </div>

                      {/* ── Row 2: Content ── */}
                      <div className="lv-card-body">
                        {/* Title + badges */}
                        <div className="lv-card-top">
                          <h4 className="lv-title">{act.activity}</h4>
                          <div className="lv-badges">
                            <span className="lv-badge lv-badge--dur">{act.duration}</span>
                            {act.costLabel && (
                              <span className="lv-badge lv-badge--cost">{act.costLabel}</span>
                            )}
                          </div>
                        </div>

                        {/* Place */}
                        <div className="lv-place">
                          <MapPin size={12} />
                          <span>{act.place}</span>
                        </div>

                        {/* Notes */}
                        <div className="lv-notes">
                          <FileText size={11} />
                          <p>{act.notes}</p>
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
          imageUrl={imgErrors[modalEvent.id] || mediaMap?.[modalEvent.id] || `https://picsum.photos/seed/modal/900/520`}
          onClose={() => setModalEvent(null)}
        />
      )}
    </>
  );
});

export default ListView;
