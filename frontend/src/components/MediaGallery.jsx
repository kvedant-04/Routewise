import React, { useState } from 'react';
import { MapPin, Clock, Images, ZoomIn } from 'lucide-react';
import MediaModal from './MediaModal';

/**
 * MediaGallery — responsive photo grid of all activities.
 * Props: safeEvents, mediaMap, destination
 */
const MediaGallery = React.memo(function MediaGallery({ safeEvents, mediaMap, destination }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [imgErrors, setImgErrors] = useState({});

  if (!safeEvents || safeEvents.length === 0) return null;

  const handleImgError = (id, seed) => {
    setImgErrors(prev => ({ ...prev, [id]: `https://picsum.photos/seed/${seed}/800/500` }));
  };

  return (
    <>
      <div className="mg-root">
        <div className="mg-header">
          <div className="mg-header-left">
            <Images size={16} className="mg-icon-accent" />
            <h4 className="mg-title">Visual Journey</h4>
          </div>
          <span className="mg-count">{safeEvents.length} moments</span>
        </div>

        <div className="mg-grid">
          {safeEvents.map((evt, i) => {
            const imgSrc = imgErrors[evt.id] || mediaMap?.[evt.id] || `https://picsum.photos/seed/${i + 10}/800/500`;
            return (
              <div
                key={evt.id}
                className="mg-card"
                onClick={() => setSelectedEvent(evt)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelectedEvent(evt)}
              >
                <div className="mg-img-wrap">
                  <img
                    src={imgSrc}
                    alt={evt.place || evt.activity}
                    className="mg-img"
                    loading="lazy"
                    onError={() => handleImgError(evt.id, `err${i}`)}
                  />
                  <div className="mg-overlay">
                    <ZoomIn size={20} className="mg-zoom-icon" />
                  </div>
                </div>

                <div className="mg-card-body">
                  <span className="mg-day-tag">Day {evt.day}</span>
                  <h5 className="mg-card-title">{evt.activity}</h5>
                  <div className="mg-card-place">
                    <MapPin size={11} />
                    <span>{evt.place}</span>
                  </div>
                  <div className="mg-card-time">
                    <Clock size={11} />
                    <span>{evt.time}</span>
                    {evt.costLabel && <span className="mg-cost">{evt.costLabel}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedEvent && (
        <MediaModal
          event={selectedEvent}
          imageUrl={imgErrors[selectedEvent.id] || mediaMap?.[selectedEvent.id] || `https://picsum.photos/seed/gallery/800/500`}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </>
  );
});

export default MediaGallery;
