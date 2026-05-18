import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Film } from 'lucide-react';
import StoryViewer from './StoryViewer';
import PremiumImage from './PremiumImage';

/**
 * StoryCarousel v2 — Day cards that launch Instagram-like StoryViewer on click.
 * Props: safeEvents, destination
 */
const StoryCarousel = React.memo(function StoryCarousel({ safeEvents, destination }) {
  const [storyDay, setStoryDay] = useState(null); // dayNum when story is open
  const scrollRef = React.useRef(null);

  if (!safeEvents || safeEvents.length === 0) return null;

  const days = [...new Set(safeEvents.map(e => e.day))].sort((a, b) => a - b);

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });
  };

  // Events for the open story day
  const storyEvents = storyDay
    ? safeEvents.filter(e => e.day === storyDay)
    : [];

  return (
    <>
      <div className="sc-root">
        <div className="sc-header">
          <div className="sc-header-left">
            <Film size={16} className="sc-icon-accent" />
            <h4 className="sc-title">Day Stories</h4>
            <span className="sc-hint">Click a day to watch</span>
          </div>
          <div className="sc-scroll-controls">
            <button className="sc-arrow" onClick={() => scroll(-1)}>
              <ChevronLeft size={16} />
            </button>
            <button className="sc-arrow" onClick={() => scroll(1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="sc-scroll-track" ref={scrollRef}>
          {days.map((dayNum) => {
            const dayEvents = safeEvents.filter(e => e.day === dayNum);
            const heroEvt = dayEvents[0];
            return (
              <div
                key={dayNum}
                className="sc-day-card"
                onClick={() => setStoryDay(dayNum)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setStoryDay(dayNum)}
                aria-label={`Watch Day ${dayNum} story`}
              >
                <div className="sc-card-image-wrap">
                  <PremiumImage
                    event={heroEvt}
                    destination={destination}
                    aspectRatio="4/5"
                    className="sc-card-image-wrapper"
                  />
                  <div className="sc-image-gradient" />
                  <span className="sc-day-pill">Day {dayNum}</span>
                  <div className="sc-play-btn">
                    <Play size={18} fill="white" />
                  </div>
                </div>
                <div className="sc-card-body">
                  <span className="sc-day-dest">{destination}</span>
                  <span className="sc-event-count">{dayEvents.length} activities</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Viewer portal-style overlay */}
      {storyDay !== null && storyEvents.length > 0 && (
        <StoryViewer
          events={storyEvents}
          destination={destination}
          onClose={() => setStoryDay(null)}
        />
      )}
    </>
  );
});

export default StoryCarousel;
