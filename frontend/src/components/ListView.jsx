import React from 'react';
import { MapPin, Sunrise, Sun, Moon } from 'lucide-react';

const ListView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return <div className="no-events-fallback glass">No events available</div>;
  }

  const days = [...new Set(data.map(e => e.day))];

  return (
    <div className="itinerary-grid fade-in">
      {days.map((dayNum) => {
        const dayEvents = data.filter(e => e.day === dayNum);
        const grouped = {
          Morning: dayEvents.filter(a => a.time === 'Morning'),
          Afternoon: dayEvents.filter(a => a.time === 'Afternoon'),
          Evening: dayEvents.filter(a => a.time === 'Evening'),
          Night: dayEvents.filter(a => a.time === 'Night')
        };

        return (
          <div key={dayNum} className="day-card-premium glass">
            <div className="day-header">
              <div className="day-badge">Day {dayNum}</div>
              <h3 className="day-title-text">Day {dayNum} Schedule</h3>
            </div>
            
            <div className="day-sections">
              {Object.keys(grouped).map(slot => {
                const acts = grouped[slot];
                if (acts.length === 0) return null;

                const icons = {
                  Morning: { Icon: Sunrise, color: 'text-amber-400' },
                  Afternoon: { Icon: Sun, color: 'text-blue-400' },
                  Evening: { Icon: Moon, color: 'text-purple-400' },
                  Night: { Icon: Moon, color: 'text-indigo-400' }
                };
                const { Icon, color } = icons[slot] || { Icon: Sun, color: 'text-slate-400' };

                return (
                  <div key={slot} className="section-block">
                    <div className="section-label">
                      <Icon size={14} className={color} /> {slot}
                    </div>
                    <div className="section-list">
                      {acts.map((act) => (
                        <div 
                          key={act.id} 
                          className={`activity-block-premium ${activeId === act.id ? 'active' : ''}`}
                          onMouseEnter={() => onActivityHover?.(act.id)}
                          onMouseLeave={() => onActivityHover?.(null)}
                          id={`activity-${act.id}`}
                        >
                          <div className="activity-meta">
                             <span className="activity-time-tag">{act.exactTime}</span>
                             {act.cost > 0 && <span className="activity-cost-tag">${act.cost}</span>}
                          </div>
                          <p className="activity-desc-premium">{act.activity}</p>
                          <div className="activity-location-row">
                             <MapPin size={10} className="text-cyan-400" />
                             <span>{act.place}</span>
                          </div>
                          {act.notes && (
                            <div className="activity-notes-expert">
                               <p>{act.notes}</p>
                            </div>
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
      })}
    </div>
  );
});

export default ListView;
