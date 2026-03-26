import React from 'react';
import { MapPin, Clock, DollarSign, FileText } from 'lucide-react';

const ListView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return (
      <div className="lv-empty">
        <span>No itinerary events to display.</span>
      </div>
    );
  }

  const days = [...new Set(data.map(e => e.day))].sort((a, b) => a - b);

  return (
    <div className="lv-root">
      {days.map((dayNum) => {
        const dayEvents = data.filter(e => e.day === dayNum);
        return (
          <div key={dayNum} className="lv-day-group">
            <div className="lv-day-header">
              <span className="lv-day-pill">Day {dayNum}</span>
            </div>

            <div className="lv-cards">
              {dayEvents.map((act) => (
                <div
                  key={act.id}
                  id={`activity-${act.id}`}
                  className={`lv-card ${activeId === act.id ? 'lv-card--active' : ''}`}
                  onMouseEnter={() => onActivityHover?.(act.id)}
                  onMouseLeave={() => onActivityHover?.(null)}
                >
                  {/* Row 1: Time + badges */}
                  <div className="lv-card-top">
                    <div className="lv-time">
                      <Clock size={12} />
                      <span>{act.time}</span>
                    </div>
                    <div className="lv-badges">
                      <span className="lv-badge lv-badge--dur">{act.duration}</span>
                      {act.costLabel && (
                        <span className="lv-badge lv-badge--cost">
                          <DollarSign size={10} />
                          {act.costLabel.replace('$', '')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Activity title */}
                  <h4 className="lv-title">{act.activity}</h4>

                  {/* Row 3: Place */}
                  <div className="lv-place">
                    <MapPin size={12} />
                    <span>{act.place}</span>
                  </div>

                  {/* Row 4: Notes */}
                  <div className="lv-notes">
                    <FileText size={11} />
                    <p>{act.notes}</p>
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

export default ListView;
