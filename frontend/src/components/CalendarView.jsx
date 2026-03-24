import React from 'react';

const CalendarView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return <div className="no-events-fallback glass">No events available</div>;
  }
  
  const days = [...new Set(data.map(e => e.day))];

  return (
    <div className="calendar-grid-view fade-in">
      <div className="calendar-horizontal-scroll">
        {days.map(dayNum => {
          const dayEvents = data.filter(e => e.day === dayNum);
          return (
            <div key={dayNum} className="calendar-col">
              <div className="cal-col-header">Day {dayNum}</div>
              <div className="cal-col-body">
                {dayEvents.map((evt) => {
                  let glowClass = "cal-glow-amber";
                  if (evt.time === "Afternoon") glowClass = "cal-glow-blue";
                  if (evt.time === "Evening" || evt.time === "Night") glowClass = "cal-glow-purple";

                  return (
                    <div 
                      key={evt.id} 
                      className={`cal-event-card ${glowClass} ${activeId === evt.id ? 'active-cal' : ''}`}
                      onMouseEnter={() => onActivityHover?.(evt.id)}
                      onMouseLeave={() => onActivityHover?.(null)}
                      id={`activity-${evt.id}`}
                    >
                      <div className="cal-time">{evt.exactTime}</div>
                      <div className="cal-desc">{evt.activity}</div>
                      <div className="cal-place text-xs text-cyan-300 mt-1 flex items-center gap-1 opacity-80">
                        <span style={{ fontSize: '10px' }}>📍</span> {evt.place}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CalendarView;
