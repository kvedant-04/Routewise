import React from 'react';
import { Clock, MapPin, DollarSign } from 'lucide-react';

const CalendarView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return (
      <div className="cv-empty">
        <span>No calendar events to display.</span>
      </div>
    );
  }

  const days = [...new Set(data.map(e => e.day))].sort((a, b) => a - b);

  return (
    <div className="cv-root">
      <div className="cv-scroll">
        {days.map(dayNum => {
          const dayEvents = data.filter(e => e.day === dayNum);
          return (
            <div key={dayNum} className="cv-col">
              <div className="cv-col-header">
                <span className="cv-day-label">Day</span>
                <span className="cv-day-num">{dayNum}</span>
              </div>
              <div className="cv-col-body">
                {dayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    id={`activity-${evt.id}`}
                    className={`cv-card ${activeId === evt.id ? 'cv-card--active' : ''}`}
                    onMouseEnter={() => onActivityHover?.(evt.id)}
                    onMouseLeave={() => onActivityHover?.(null)}
                  >
                    {/* Top: time + cost */}
                    <div className="cv-card-top">
                      <div className="cv-time">
                        <Clock size={10} />
                        <span>{evt.time}</span>
                      </div>
                      {evt.costLabel && (
                        <span className="cv-cost">{evt.costLabel}</span>
                      )}
                    </div>

                    {/* Activity name */}
                    <h5 className="cv-activity">{evt.activity}</h5>

                    {/* Place */}
                    <div className="cv-place">
                      <MapPin size={10} />
                      <span>{evt.place}</span>
                    </div>

                    {/* Notes — truncated */}
                    {evt.notes && (
                      <p className="cv-notes">
                        {evt.notes.length > 50 ? evt.notes.slice(0, 50) + '…' : evt.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CalendarView;
