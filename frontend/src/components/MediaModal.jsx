import React from 'react';
import { MapPin, Clock, X } from 'lucide-react';

/**
 * MediaModal — contained popup (NOT full-screen).
 * Opens centered over page content. Max-width: 740px.
 * Props: event, imageUrl, onClose
 */
const MediaModal = React.memo(function MediaModal({ event, imageUrl, onClose }) {
  if (!event) return null;

  return (
    <div className="mm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="mm-popup" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="mm-close" onClick={onClose} aria-label="Close">
          <X size={16} />
        </button>

        {/* Image */}
        <div className="mm-img-wrap">
          <img
            src={imageUrl}
            alt={event.place || event.activity}
            className="mm-img"
            onError={e => { e.target.src = 'https://picsum.photos/seed/modal/900/520'; }}
          />
          <span className="mm-day-chip">Day {event.day}</span>
        </div>

        {/* Info */}
        <div className="mm-body">
          <h3 className="mm-title">{event.activity}</h3>

          <div className="mm-place">
            <MapPin size={13} className="mm-cyan" />
            <span>{event.place}</span>
          </div>

          <div className="mm-meta">
            <span className="mm-chip mm-chip--time">
              <Clock size={10} /> {event.time}
            </span>
            <span className="mm-chip mm-chip--dur">{event.duration}</span>
            {event.costLabel && (
              <span className="mm-chip mm-chip--cost">{event.costLabel}</span>
            )}
          </div>

          {event.notes && (
            <div className="mm-notes-box">
              <p>{event.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MediaModal;
