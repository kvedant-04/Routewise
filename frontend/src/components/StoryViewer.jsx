import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDE_DURATION = 4500; // ms per slide

/**
 * StoryViewer — Instagram-like story experience for a single day's activities.
 * Props:
 *   events      — array of safeEvent objects for one day
 *   mediaMap    — { [eventId]: imageUrl }
 *   destination — string
 *   onClose     — function
 */
const StoryViewer = React.memo(function StoryViewer({ events, mediaMap, destination, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const current = events?.[currentIdx];
  const total = events?.length || 0;

  const goNext = useCallback(() => {
    if (currentIdx < total - 1) {
      setCurrentIdx(i => i + 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    } else {
      onClose?.();
    }
  }, [currentIdx, total, onClose]);

  const goPrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      setProgress(0);
      startTimeRef.current = Date.now();
    }
  }, [currentIdx]);

  // Progress animation loop
  useEffect(() => {
    if (paused) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    startTimeRef.current = Date.now() - progress * SLIDE_DURATION / 100;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / SLIDE_DURATION) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        goNext();
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [currentIdx, paused, goNext]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!current) return null;

  const imgSrc = mediaMap?.[current.id] || `https://picsum.photos/seed/story${currentIdx}/900/520`;

  return (
    <div className="sv-backdrop" onClick={onClose}>
      {/* Story Card */}
      <div className="sv-card" onClick={e => e.stopPropagation()}>

        {/* Progress Bar */}
        <div className="sv-progress-row">
          {events.map((_, i) => (
            <div key={i} className="sv-progress-segment">
              <div
                className="sv-progress-fill"
                style={{
                  width: i < currentIdx ? '100%' : i === currentIdx ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header row */}
        <div className="sv-header">
          <span className="sv-brand">✦ Routewise</span>
          <div className="sv-header-right">
            <span className="sv-day-badge">Day {current.day}</span>
            <button className="sv-close-btn" onClick={onClose} aria-label="Close story">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Background image */}
        <img
          key={current.id}
          src={imgSrc}
          alt={current.place}
          className="sv-bg-image"
          loading="eager"
          onError={e => { e.target.src = `https://picsum.photos/seed/fallback${currentIdx}/900/520`; }}
        />
        <div className="sv-gradient-overlay" />

        {/* Tap zones */}
        <div
          className="sv-tap-zone sv-tap-left"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => { setPaused(false); goPrev(); }}
          onClick={goPrev}
        >
          {currentIdx > 0 && <ChevronLeft size={32} className="sv-tap-chevron" />}
        </div>
        <div
          className="sv-tap-zone sv-tap-right"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => { setPaused(false); goNext(); }}
          onClick={goNext}
        >
          <ChevronRight size={32} className="sv-tap-chevron" />
        </div>

        {/* Content overlay */}
        <div className="sv-content">
          <h2 className="sv-activity">{current.activity}</h2>
          <div className="sv-place">
            <MapPin size={14} />
            <span>{current.place}</span>
          </div>
          <div className="sv-badges">
            <span className="sv-badge">
              <Clock size={11} /> {current.time}
            </span>
            <span className="sv-badge sv-badge--dur">{current.duration}</span>
            {current.costLabel && (
              <span className="sv-badge sv-badge--cost">{current.costLabel}</span>
            )}
          </div>
          {current.notes && (
            <p className="sv-notes">
              {current.notes.length > 80 ? current.notes.slice(0, 80) + '…' : current.notes}
            </p>
          )}
        </div>

        {/* Slide counter */}
        <div className="sv-counter">{currentIdx + 1} / {total}</div>
      </div>
    </div>
  );
});

export default StoryViewer;
