import React from 'react';
import { MapPin, GripHorizontal, Maximize2 } from 'lucide-react';

const TimelineView = React.memo(({ data, activeId, onActivityHover }) => {
  if (!data || data.length === 0) {
    return <div className="no-events-fallback glass">No events available</div>;
  }

  const days = [...new Set(data.map(e => e.day))];

  return (
    <div className="temporal-engine fade-in">
      {days.map(dayNum => {
        const dayEvents = data.filter(e => e.day === dayNum);
        return (
          <div key={dayNum} className="timeline-day-segment">
            <h3 className="timeline-day-title">Day {dayNum}</h3>
            
            <div className="timeline-track-container">
              <div className="timeline-axis"></div>
              
              {dayEvents.map((evt) => {
                let glowClass = "glow-amber";
                if (evt.time === "Afternoon") glowClass = "glow-blue";
                if (evt.time === "Evening" || evt.time === "Night") glowClass = "glow-purple";

                const heightPx = Math.max(100, evt.duration || 120);

                return (
                  <div 
                    key={evt.id}
                    className={`timeline-block-wrapper ${activeId === evt.id ? 'active-block' : ''}`}
                    onMouseEnter={() => onActivityHover?.(evt.id)}
                    onMouseLeave={() => onActivityHover?.(null)}
                    id={`activity-${evt.id}`}
                  >
                    <div className="timeline-time-label">
                      {evt.exactTime}
                      <span className="block-duration">{evt.duration}m</span>
                    </div>

                    <div className="timeline-node"></div>

                    <div className={`timeline-glass-card ${glowClass}`} style={{ minHeight: `${heightPx}px` }}>
                      <div className="card-drag-handle">
                        <GripHorizontal size={14} className="text-slate-500" />
                      </div>
                      <div className="card-temporal-content">
                        <h4 className="temporal-title">{evt.activity}</h4>
                        <div className="temporal-meta">
                          <MapPin size={12}/> <span>{evt.place}</span>
                        </div>
                        {evt.notes && <p className="temporal-notes text-xs text-slate-300 mt-1 opacity-80">{evt.notes}</p>}
                        {evt.cost > 0 && <div className="temporal-cost-badge inline-block mt-1 bg-white/10 px-2 py-0.5 rounded text-xs text-emerald-300 border border-white/5">${evt.cost}</div>}
                        <div className="temporal-resize-handle">
                          <Maximize2 size={10} className="text-slate-500" />
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
  );
});

export default TimelineView;
