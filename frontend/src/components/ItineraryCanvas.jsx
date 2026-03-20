import React from 'react';
import {
  Route, TrendingUp, Clock, MapPin, Sparkles,
  Calendar, DollarSign, Star, Compass
} from 'lucide-react';

// ────────────────────────────────────────────
// Feature Highlight Cards
// ────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, colorClass }) => (
  <div className={`rw-feature-card ${colorClass}`}>
    <div className="rw-feature-icon">
      <Icon size={20} />
    </div>
    <div className="rw-feature-text">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

// ────────────────────────────────────────────
// Day Card
// ────────────────────────────────────────────
const DayCard = ({ day, title, activities, budget }) => (
  <div className="rw-day-card">
    <div className="rw-day-header">
      <div className="rw-day-badge">
        <Calendar size={12} />
        <span>Day {day}</span>
      </div>
      <div className="rw-day-budget">
        <DollarSign size={12} />
        <span>{budget}</span>
      </div>
    </div>
    <h4 className="rw-day-title">{title}</h4>
    <ul className="rw-activity-list">
      {activities.map((a, i) => (
        <li key={i} className="rw-activity-item">
          <div className="rw-timeline-dot" />
          <span>{a}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ────────────────────────────────────────────
// Metric Card
// ────────────────────────────────────────────
const MetricCard = ({ icon: Icon, value, label, accent }) => (
  <div className="rw-metric-card">
    <div className={`rw-metric-icon ${accent}`}>
      <Icon size={18} />
    </div>
    <div className="rw-metric-value">{value}</div>
    <div className="rw-metric-label">{label}</div>
  </div>
);

// ────────────────────────────────────────────
// Itinerary Renderer (from API response)
// ────────────────────────────────────────────
const ItineraryRenderer = ({ text }) => {
  const lines = text.split('\n');
  let dayCards = [];
  let currentDay = null;
  let currentActivities = [];
  let budgetMatch = null;
  let misc = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const dayMatch = trimmed.match(/^(Day\s+\d+[:\s-]*(.*))/i);
    const h2Match = trimmed.match(/^##\s+(Day\s+\d+[:\s-]*(.*))/i);

    if (dayMatch || h2Match) {
      if (currentDay !== null) {
        dayCards.push({ day: currentDay, title: currentTitle, activities: currentActivities, budget: budgetMatch || 'Incl.' });
        currentActivities = [];
        budgetMatch = null;
      }
      const raw = dayMatch ? dayMatch[1] : h2Match[1];
      const num = raw.match(/\d+/)?.[0] || dayCards.length + 1;
      currentDay = parseInt(num);
      currentTitle = trimmed.replace(/^(##\s+)?(Day\s+\d+[:\s-]*)/, '').trim() || 'Explore & Discover';
    } else if (currentDay !== null) {
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || trimmed.startsWith('•')) {
        currentActivities.push(trimmed.replace(/^[-*•]\s*/, ''));
      } else if (trimmed.match(/budget|cost|\$|₹|€|£/i)) {
        budgetMatch = trimmed.replace(/[*_]/g, '');
      } else {
        misc.push(trimmed);
      }
    }
  });

  if (currentDay !== null) {
    dayCards.push({ day: currentDay, title: currentTitle, activities: currentActivities, budget: budgetMatch || 'Incl.' });
  }

  // if no structured days detected, display raw text elegantly
  if (dayCards.length === 0) {
    return (
      <div className="rw-raw-itinerary">
        {lines.map((line, i) => {
          const t = line.trim();
          if (!t) return <div key={i} style={{ height: '0.5rem' }} />;
          if (t.match(/^## /)) return <h3 key={i} className="rw-raw-h2">{t.replace('## ', '')}</h3>;
          if (t.match(/^# /)) return <h2 key={i} className="rw-raw-h1">{t.replace('# ', '')}</h2>;
          if (t.startsWith('-') || t.startsWith('*')) return <li key={i} className="rw-raw-li">{t.replace(/^[-*]\s*/, '')}</li>;
          return <p key={i} className="rw-raw-p">{t}</p>;
        })}
      </div>
    );
  }

  return (
    <div className="rw-day-cards">
      {dayCards.map((dc, i) => (
        <DayCard key={i} {...dc} />
      ))}
    </div>
  );
};

let currentTitle = '';

// ────────────────────────────────────────────
// Main Canvas
// ────────────────────────────────────────────
const ItineraryCanvas = ({ itinerary, loading, destination }) => {
  const hasItinerary = itinerary && itinerary.trim().length > 0;

  return (
    <main className="rw-canvas">
      {/* Ambient glow orbs */}
      <div className="rw-orb rw-orb-1" />
      <div className="rw-orb rw-orb-2" />

      {/* Hero Section */}
      {!hasItinerary && !loading && (
        <>
          <section className="rw-hero">
            <div className="rw-hero-eyebrow">
              <Sparkles size={14} />
              <span>Powered by CrewAI + OpenRouter</span>
            </div>
            <h1 className="rw-hero-title">
              Where do you<br />
              <span className="rw-gradient-text">want to go?</span>
            </h1>
            <p className="rw-hero-sub">
              Unleash AI to craft the perfect journey — analyzing millions of data points
              to deliver a travel experience that's uniquely yours.
            </p>
          </section>

          {/* Feature Cards */}
          <section className="rw-features">
            <FeatureCard
              icon={Route}
              title="AI Optimized Routes"
              description="Proprietary algorithms find the most efficient paths between your favorite spots."
              colorClass="rw-feat-cyan"
            />
            <FeatureCard
              icon={TrendingUp}
              title="Real-time Budgeting"
              description="Live updates on costs, currency fluctuations, and smart savings suggestions."
              colorClass="rw-feat-violet"
            />
            <FeatureCard
              icon={Clock}
              title="Smart Scheduling"
              description="Sync activities based on opening hours, crowds, and your travel pace."
              colorClass="rw-feat-indigo"
            />
          </section>

          {/* Map Placeholder */}
          <section className="rw-map-card">
            <div className="rw-map-grid" />
            <div className="rw-map-content">
              <div className="rw-map-icon"><MapPin size={24} /></div>
              <h3>Interactive Map View</h3>
              <p>Your custom route will appear here in 3D after generating your itinerary</p>
            </div>
          </section>

          {/* Analytics Row */}
          <section className="rw-metrics">
            <MetricCard icon={DollarSign} value="——" label="Est. Cost" accent="accent-cyan" />
            <MetricCard icon={Compass} value="——" label="Activities" accent="accent-violet" />
            <MetricCard icon={Star} value="——" label="Best Month" accent="accent-indigo" />
          </section>
        </>
      )}

      {/* Loading State */}
      {loading && (
        <section className="rw-loading-state">
          <div className="rw-loading-orb">
            <Sparkles size={32} className="rw-pulse-icon" />
          </div>
          <h2>Crafting your perfect journey…</h2>
          <p>Our AI is analyzing {destination || 'your destination'} and optimizing every detail</p>
          <div className="rw-loading-bars">
            {['Analyzing destination', 'Optimizing budget', 'Building schedule', 'Finalizing route'].map((step, i) => (
              <div key={i} className="rw-loading-bar-row">
                <span>{step}</span>
                <div className="rw-loading-bar">
                  <div className="rw-loading-fill" style={{ animationDelay: `${i * 0.2}s` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Itinerary Result */}
      {hasItinerary && !loading && (
        <section className="rw-itinerary-section">
          <div className="rw-itinerary-header">
            <div className="rw-itinerary-title-row">
              <Sparkles size={20} className="text-cyan" />
              <h2>
                {destination
                  ? <>Your <span className="rw-gradient-text">{destination}</span> Itinerary</>
                  : <>Your Personalized <span className="rw-gradient-text">Itinerary</span></>
                }
              </h2>
            </div>
            <p className="rw-itinerary-subtitle">Crafted by AI · Optimized for your budget and schedule</p>
          </div>

          <ItineraryRenderer text={itinerary} />

          {/* Map after itinerary */}
          <div className="rw-map-card rw-map-bottom">
            <div className="rw-map-grid" />
            <div className="rw-map-content">
              <div className="rw-map-icon"><MapPin size={24} /></div>
              <h3>Interactive Map View</h3>
              <p>Visualize your custom route in 3D</p>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="rw-footer">
        <span>© 2026 Routewise</span>
        <span className="rw-footer-dot">·</span>
        <span>Powered by CrewAI & OpenRouter</span>
        <span className="rw-footer-dot">·</span>
        <span>AI Travel Intelligence Platform</span>
      </footer>
    </main>
  );
};

export default ItineraryCanvas;
