import React from 'react';
import { MapPin, Clock, DollarSign, Info } from 'lucide-react';

const TimelineView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return (
      <div className="tv-empty">
        <span>No timeline events to display.</span>
      </div>
    );
  }

  const days = [...new Set(data.map(e => e.day))].sort((a, b) => a - b);

  return (
    <div className="tv-root">
      {days.map(dayNum => {
        const dayEvents = data.filter(e => e.day === dayNum);
        return (
          <div key={dayNum} className="tv-day-segment">
            <h3 className="tv-day-title">Day {dayNum}</h3>

            <div className="tv-track">
              <div className="tv-axis" />

              {dayEvents.map((evt) => (
                <div
                  key={evt.id}
                  id={`activity-${evt.id}`}
                  className={`tv-block ${activeId === evt.id ? 'tv-block--active' : ''}`}
                  onMouseEnter={() => onActivityHover?.(evt.id)}
                  onMouseLeave={() => onActivityHover?.(null)}
                >
                  {/* Left: time label */}
                  <div className="tv-time-col">
                    <span className="tv-time">{evt.time}</span>
                    <span className="tv-dur">{evt.duration}</span>
                  </div>

                  {/* Node dot */}
                  <div className="tv-dot" />

                  {/* Card */}
                  <div className="tv-card">
                    <div className="tv-card-top">
                      <h4 className="tv-activity">{evt.activity}</h4>
                      <div className="tv-card-badges">
                        {evt.costLabel && (
                          <span className="tv-badge tv-badge--cost">
                            <DollarSign size={10} />
                            {evt.costLabel.replace('$', '')}
                          </span>
                        )}
                        <span className="tv-badge tv-badge--dur">
                          <Clock size={10} />
                          {evt.duration}
                        </span>
                      </div>
                    </div>

                    <div className="tv-place">
                      <MapPin size={12} />
                      <span>{evt.place}</span>
                    </div>

                    <div className="tv-notes">
                      <Info size={11} />
                      <p>{evt.notes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default TimelineView;
