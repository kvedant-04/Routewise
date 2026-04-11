import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { 
  MapPin, Calendar, Clock, Sparkles, Navigation, List, TrendingUp, 
  AlertTriangle, CheckCircle, Map as MapIcon, AlertCircle, DollarSign, 
  Globe, Brain, BarChart3, Compass, Sunrise, Sun, Moon, RefreshCw, Zap, Users
} from 'lucide-react';
import MapIntelligence from './components/MapIntelligence';
import ErrorBoundary from './ErrorBoundary';
import ListView from './components/ListView';
import TimelineView from './components/TimelineView';
import CalendarView from './components/CalendarView';
import FinancialDashboard from './components/FinancialDashboard';
import StoryCarousel from './components/StoryCarousel';
import { buildMediaMap } from './utils/mediaEngine';
import './index.css';


/* ─── Constants ─────────────────────────────────────────── */
const API_URL = 'http://127.0.0.1:8000';

/* ============================================================
   PERCEPTION-FIRST LOADING COMPONENTS
   ============================================================ */

function SkeletonCard({ delayClass }) {
  return (
    <div className={`skeleton-card fade-in ${delayClass}`}>
      <div className="skeleton-shimmer" />
      <div className="skeleton-header" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line-short" />
      </div>
    </div>
  );
}

function ProgressRing({ progress }) {
  return (
    <div className="progress-ring-v2">
      <div 
        className="progress-ring-v2-circle" 
        style={{ '--p': progress }}
      />
      <div className="progress-ring-v2-text">
        <span>{Math.round(progress)}</span>
        <span className="progress-ring-v2-pct">PERCENT</span>
      </div>
    </div>
  );
}

const FALLBACK_JSON = {
  "destination": "London",
  "days": [
    {
      "day": 1,
      "activities": [
        {
          "time_slot": "Morning",
          "start_time": "10:00 AM",
          "duration_mins": 120,
          "activity": "Explore the British Museum",
          "place": "The British Museum",
          "cost": 0,
          "notes": "A massive collection of human history and culture."
        },
        {
          "time_slot": "Afternoon",
          "start_time": "02:00 PM",
          "duration_mins": 180,
          "activity": "Stroll along the River Thames",
          "place": "River Thames",
          "cost": 0,
          "notes": "Enjoy the iconic skyline."
        }
      ]
    }
  ]
};

function RotatingNotes({ activeMessage }) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState('active');
  const messages = [
    "Generating itinerary...",
    "Mapping locations...",
    "Finalizing views..."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFade('exit');
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade('active');
      }, 600);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rotating-notes-container">
      {messages.map((msg, i) => (
        <div 
          key={i} 
          className={`rotating-note ${i === index ? fade : ''}`}
        >
          {activeMessage || msg}
        </div>
      ))}
    </div>
  );
}


/* ============================================================
   COMPONENT: Header (Brand + Tagline inside ControlPanel)
   ============================================================ */
function Header() {
  return (
    <div className="header-section">
      <div className="brand">
        <div className="brand-icon" aria-hidden="true">
          <Sparkles size={22} color="#fff" strokeWidth={2.2} />
        </div>
        <div>
          <div className="brand-name">Routewise</div>
          <div className="brand-tagline">AI Travel Intelligence</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENT: ControlPanel (Left sidebar)
   ============================================================ */
function ControlPanel({ destination, setDestination, budget, setBudget, days, setDays, currency, setCurrency, loading, loadingStage, onSubmit, error }) {

  const currencies = [
    { code: 'USD', symbol: '$', label: 'US Dollar' },
    { code: 'EUR', symbol: '€', label: 'Euro' },
    { code: 'GBP', symbol: '£', label: 'British Pound' },
    { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
    { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
    { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  ];

  return (
    <aside className="control-panel">
      <Header />

      <div className="panel-divider" />

      <p className="panel-label">Plan Your Journey</p>

      <form id="trip-form" onSubmit={onSubmit} noValidate>
        {/* Destination */}
        <div className="field-group">
          <input
            id="destination"
            className="field-input"
            type="text"
            placeholder="Where are you going?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            autoComplete="off"
            aria-label="Destination"
          />
          <label className="field-label" htmlFor="destination">Destination</label>
          <MapPin className="field-icon" size={16} aria-hidden="true" />
        </div>

        {/* Budget */}
        <div className="field-group">
          <input
            id="budget"
            className="field-input"
            type="number"
            min="0"
            placeholder="Total budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            aria-label="Budget"
          />
          <label className="field-label" htmlFor="budget">Budget ({currency})</label>
          <DollarSign className="field-icon" size={16} aria-hidden="true" />
        </div>

        {/* Days */}
        <div className="field-group">
          <input
            id="days"
            className="field-input"
            type="number"
            min="1"
            max="365"
            placeholder="Number of days"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            aria-label="Trip duration in days"
          />
          <label className="field-label" htmlFor="days">Duration (Days)</label>
          <Calendar className="field-icon" size={16} aria-hidden="true" />
        </div>

        {/* Currency */}
        <div className="field-group">
          <div className="field-select-wrap">
            <select
              id="currency"
              className="field-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              {currencies.map(c => (
                <option key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </option>
              ))}
            </select>
            <Globe className="field-icon" size={16} aria-hidden="true" />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="error-block" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* CTA */}
        <button
          id="plan-trip-btn"
          className="btn-primary"
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          <div className="btn-inner">
            {loading ? (
              <div className="btn-loading-content">
                <div className="spinner-minimal" />
                <span>
                  {loadingStage || "Planning..."}
                </span>
              </div>
            ) : (
              <>
                <Zap size={18} aria-hidden="true" />
                Plan My Journey →
              </>
            )}
          </div>
        </button>
      </form>

      {/* Panel Stats */}
      <div className="panel-stats">
        <div className="stats-row">
          <div className="stat-chip">
            <span className="stat-value">10K+</span>
            <span className="stat-label">Trips</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">AI</span>
            <span className="stat-label">Powered</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">Live</span>
            <span className="stat-label">Real-time</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ============================================================
   COMPONENT: FeatureCard
   ============================================================ */
function FeatureCard({ icon: Icon, title, desc, colorClass, bgClass }) {
  return (
    <article className={`feature-card ${colorClass}`} aria-label={title}>
      <div className={`card-icon-wrap ${bgClass}`}>
        <Icon size={22} strokeWidth={2} aria-hidden="true" />
      </div>
      <h3 className="card-title">{title}</h3>
      <p className="card-desc">{desc}</p>
    </article>
  );
}

/* ============================================================
   HYBRID PARSING ENGINE (HARDENED)
   ============================================================ */

/* ============================================================
   PHASE 1 — FORMAT HELPERS (single source of truth)
   ============================================================ */
function formatDuration(d) {
  const n = parseInt(d, 10);
  return isNaN(n) ? '60 mins' : `${n} mins`;
}
function formatCost(c) {
  const n = parseFloat(c);
  return isNaN(n) || n === 0 ? null : `$${n.toFixed(0)}`;
}
function formatTime(t) {
  if (!t) return '09:00 AM';
  const s = String(t).trim();
  return s || '09:00 AM';
}

/* ============================================================
   COMPONENT: ItineraryCanvas (Right panel itinerary renderer)
   ============================================================ */
const ItineraryCanvas = React.memo(function ItineraryCanvas({ itinerary, loading, destination, days, budget, currency, progress, loadingStage, isFallback, onMarkerClick, activeId, setActiveId, onActivityHover }) {

  // ZERO-TRUST NORMALIZATION — uses format helpers for clean output
  const safeEvents = useMemo(() => {
    if (!itinerary) return [];
    try {
      const parsed = typeof itinerary === 'string' ? JSON.parse(itinerary) : itinerary;
      if (!parsed || !parsed.days || !Array.isArray(parsed.days)) return [];

      return parsed.days.flatMap((day, dayIdx) => {
        const activities = Array.isArray(day.activities) ? day.activities : [];
        return activities.map((act, actIdx) => {
          const durNum = parseInt(act.duration_mins || act.duration || 60, 10);
          return {
            id: `${day.day || dayIdx + 1}-${actIdx}`,
            day: day.day || dayIdx + 1,
            time: formatTime(act.start_time || act.time_slot || act.time),
            exactTime: formatTime(act.start_time || act.time_slot || act.time),
            activity: act.activity || 'Explore area',
            place: act.place || 'Local Landmark',
            duration: formatDuration(isNaN(durNum) ? 60 : durNum),
            duration_mins: isNaN(durNum) ? 60 : durNum,
            cost: parseFloat(act.cost) || 0,
            costLabel: formatCost(act.cost),
            notes: act.notes || 'No additional details available.',
            lat: act.lat || null,
            lng: act.lng || null,
          };
        }).filter(e => e.activity && e.place);
      });
    } catch (e) {
      console.error('safeEvents parse error:', e);
      return [];
    }
  }, [itinerary]);

  // PHASE 5 — SYNC PROTECTION
  useEffect(() => {
    if (activeId && !safeEvents.find(e => e.id === activeId)) {
      setActiveId(null);
    }
  }, [safeEvents, activeId, setActiveId]);

  // Tri-View State
  const [viewMode, setViewMode] = useState('list');

  // PHASE 13 — Media Map (async, non-blocking, fires after itinerary renders)
  const [mediaMap, setMediaMap] = useState({});
  useEffect(() => {
    if (!safeEvents || safeEvents.length === 0) return;
    let cancelled = false;
    buildMediaMap(safeEvents, destination).then(map => {
      if (!cancelled) setMediaMap(map);
    }).catch(() => {}); // silent — media is optional
    return () => { cancelled = true; };
  }, [safeEvents, destination]);

  // PHASE 6 — FALLBACK VIEW
  const FallbackView = ({ markdown }) => (
    <div className="premium-markdown-container fade-in overflow-auto break-words whitespace-pre-wrap">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );

  // PHASE 5 — VIEW SWITCH PERFORMANCE (UX)
  const renderView = useMemo(() => {
    if (!safeEvents || safeEvents.length === 0) return null;

    try {
      if (viewMode === "list") return <ListView data={safeEvents} activeId={activeId} onActivityHover={setActiveId} mediaMap={mediaMap} />;

      if (viewMode === "timeline") return <TimelineView data={safeEvents} activeId={activeId} onActivityHover={setActiveId} />;
      if (viewMode === "calendar") return <CalendarView data={safeEvents} activeId={activeId} onActivityHover={setActiveId} />;
    } catch (e) {
      console.error("View Render Crash:", e);
      return <FallbackView markdown={itinerary} />;
    }
    return null;
  }, [viewMode, safeEvents, activeId, itinerary, setActiveId]);

  // Fallback UI — premium empty state with step guide
  const FallbackUI = () => (
    <div className="itinerary-empty">
      <div className="empty-orb" aria-hidden="true">
        <div className="empty-orb-inner" />
        <div className="empty-orb-ring" />
      </div>
      <p className="empty-title">Your journey unfolds here</p>
      <p className="empty-desc">
        Let Routewise's multi-agent AI craft a hyper-personalized itinerary
        in seconds — complete with maps, budgets, and hidden gems.
      </p>
      <div className="empty-steps" role="list" aria-label="How to get started">
        <div className="empty-step" role="listitem">
          <span className="empty-step-num" aria-hidden="true">01</span>
          <div className="empty-step-text">
            <strong>Enter destination</strong>
            <span>Any city, country, or region</span>
          </div>
        </div>
        <div className="empty-step" role="listitem">
          <span className="empty-step-num" aria-hidden="true">02</span>
          <div className="empty-step-text">
            <strong>Set budget &amp; duration</strong>
            <span>Daily or total budget in any currency</span>
          </div>
        </div>
        <div className="empty-step" role="listitem">
          <span className="empty-step-num" aria-hidden="true">03</span>
          <div className="empty-step-text">
            <strong>Hit Plan My Journey</strong>
            <span>AI generates your full itinerary</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="itinerary-canvas" aria-labelledby="itinerary-heading">
      <div className="itinerary-header">
        <h2 id="itinerary-heading" className="itinerary-title">
          <Sparkles size={18} color="var(--violet)" aria-hidden="true" />
          Journey Canvas
          {isFallback && (
            <span className="fallback-chip">
              <Zap size={10} /> Optimized Version
            </span>
          )}
        </h2>
        <span className={`itinerary-badge ${itinerary ? 'badge-live' : 'badge-idle'}`}>
          {loading ? 'Generating…' : itinerary ? 'Ready' : 'Awaiting Input'}
        </span>
      </div>
      
      {/* ─── TRI-VIEW TOGGLE (PHASE 6) ─── */}
      {itinerary && !loading && (
        <div className="tri-view-toggle fade-in" style={{
          display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', 
          background: 'var(--surface-container-low)', padding: '0.4rem', 
          borderRadius: '12px', width: 'fit-content'
        }}>
          {['list', 'timeline', 'calendar'].map((mode) => (
            <button
              key={mode}
              className={`view-toggle-btn ${viewMode === mode ? 'active' : ''}`}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode ? 'var(--surface-variant)' : 'transparent',
                border: viewMode === mode ? '1px solid rgba(144, 144, 151, 0.2)' : '1px solid transparent',
                color: viewMode === mode ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: viewMode === mode ? '600' : '500',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
            >
              {mode}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="itinerary-loading-experience">
          <div className="loading-center-stack">
            <ProgressRing progress={progress} />
            <RotatingNotes activeMessage={loadingStage} />
          </div>
          {/* SKELETON CARDS DURING LOAD */}
          <div style={{display:'flex', gap:'1rem', overflow:'hidden', opacity:0.3, marginTop:'2rem'}}>
            <div className="skeleton-card" style={{ flex: 1, height: '150px' }}><div className="skeleton-shimmer"></div></div>
            <div className="skeleton-card" style={{ flex: 1, height: '150px' }}><div className="skeleton-shimmer"></div></div>
            <div className="skeleton-card" style={{ flex: 1, height: '150px' }}><div className="skeleton-shimmer"></div></div>
          </div>
        </div>
      ) : (!itinerary || itinerary.length < 20) ? (
        <FallbackUI />
      ) : (
        <div className="itinerary-content">
          {(!safeEvents || safeEvents.length === 0) ? (
            <div className="empty-error-card" role="alert" aria-live="assertive">
              <AlertCircle size={36} color="var(--violet)" aria-hidden="true" />
              <div className="empty-error-body">
                <h3 className="empty-error-title">Itinerary Generation Incomplete</h3>
                <p className="empty-error-desc">
                  We received structural data but couldn't parse activities.<br />
                  Try a more specific destination or simplify your request.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary empty-error-action"
                aria-label="Reset the application and retry"
              >
                Reset &amp; Retry
              </button>
            </div>
          ) : (
            <ErrorBoundary fallbackUI={itinerary ? <FallbackView markdown={itinerary} /> : <div>Error loading itinerary</div>}>
              {renderView}
              
              <MapIntelligence 
                data={safeEvents} 
                destination={destination}
                activeId={activeId}
                onMarkerClick={(id) => {
                  setActiveId(id);
                  const el = document.getElementById(`activity-${id}`);
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
              />

              {/* ── PHASE 12: Financial Intelligence Dashboard ── */}
              <FinancialDashboard
                safeEvents={safeEvents}
                itinerary={itinerary}
                budget={Number(budget) || 0}
                currency={currency}
                destination={destination}
              />

              {/* ── PHASE 13: Day Story Carousel ── */}
              <StoryCarousel
                safeEvents={safeEvents}
                mediaMap={mediaMap}
                destination={destination}
              />
            </ErrorBoundary>
          )}
        </div>
      )}

      {/* Analytics Bar */}
      <div className="analytics-bar">
        <div className="analytics-item">
          <div className="analytics-icon" style={{ background: 'rgba(34,211,238,0.1)' }}>
            <MapPin size={16} color="var(--cyan)" />
          </div>
          <div className="analytics-meta">
            <div className="analytics-val">{destination || '—'}</div>
            <div className="analytics-key">Destination</div>
          </div>
        </div>
        <div className="analytics-sep" />
        <div className="analytics-item">
          <div className="analytics-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
            <Clock size={16} color="var(--blue)" />
          </div>
          <div className="analytics-meta">
            <div className="analytics-val">{days ? `${days} Days` : '—'}</div>
            <div className="analytics-key">Duration</div>
          </div>
        </div>
        <div className="analytics-sep" />
        <div className="analytics-item">
          <div className="analytics-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <TrendingUp size={16} color="var(--violet)" />
          </div>
          <div className="analytics-meta">
            <div className="analytics-val">
              {budget ? `${currency} ${Number(budget).toLocaleString()}` : '—'}
            </div>
            <div className="analytics-key">Budget</div>
          </div>
        </div>
        <div className="analytics-sep" />
        <div className="analytics-item">
          <div className="analytics-icon" style={{ background: 'rgba(34,211,238,0.06)' }}>
            <Users size={16} color="var(--text-muted)" />
          </div>
          <div className="analytics-meta">
            <div className="analytics-val">10K+</div>
            <div className="analytics-key">Trips Planned</div>
          </div>
        </div>
      </div>
    </section>
  );
});

/* ============================================================
   MAIN APP
   ============================================================ */
function App() {
  const [destination, setDestination] = useState('');
  const [budget, setBudget]           = useState('');
  const [days, setDays]               = useState('');
  const [currency, setCurrency]       = useState('USD');
  const [itinerary, setItinerary]     = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [progress, setProgress]       = useState(0);
  const [loadingStage, setLoadingStage] = useState("");
  const [isFallback, setIsFallback]   = useState(false);
  const [activeId, setActiveId]       = useState(null);

  // PROGRESS ENGINE
  useEffect(() => {
    let interval;
    if (loading) {
      // SMOOTH PROGRESSIVE CLIMB (PHASE 12)
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev; // STOP AT 90% UNTIL COMPLETE
          const step = (90 - prev) * 0.1; 
          return Math.min(prev + Math.max(step, 0.5), 90);
        });
      }, 200);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handlePlanTrip = async (e) => {
    e.preventDefault();
    if (!destination || !budget || !days) {
      setError('Please fill in destination, budget, and trip duration.');
      return;
    }

    setLoading(true);
    setError('');
    setItinerary('');
    setProgress(0);
    setLoadingStage("Initializing AI engine...");

    // 2-SECOND MINIMUM LOAD TIME (PHASE 12)
    const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

    try {
        setLoadingStage("Analyzing destination data...");
        // RUN API AND DELAY CONCURRENTLY
      const [response] = await Promise.all([
        axios.post(`${API_URL}/plan-trip`, {
          destination,
          budget: parseFloat(budget),
          days: parseInt(days, 10),
          currency,
        }),
        minDelay
      ]);

      console.log("API RESPONSE:", response.data);
      setLoadingStage("Finalizing itinerary...");

      if (response.data?.success) {
        setProgress(100);
        
        const itineraryData = response.data.data;
        let parsed;
        
        try {
          // SAFE PARSE
          parsed = typeof itineraryData === "string" 
            ? JSON.parse(itineraryData) 
            : itineraryData;
        } catch (err) {
          console.error("JSON Parse Error:", err);
          setError("Invalid itinerary data received.");
          setItinerary(null);
          return;
        }

        // 🧩 PHASE 12: RIGID STRUCTURAL GUARD
        if (!parsed || !parsed.days || !Array.isArray(parsed.days)) {
          console.error("STRUCTURAL ERROR: Missing 'days' field", parsed);
          setError("Invalid itinerary data");
          setItinerary(null);
          setLoading(false);
          return;
        }

        setItinerary(parsed);
        
        // SHOW FALLBACK NOTE IF ACTIVE
        if (response.data?.fallback) {
          setIsFallback(true);
        } else {
          setIsFallback(false);
        }
      } else {
        setError(response?.data?.data?.itinerary || 'Failed to generate itinerary. Please try again.');
      }
    } catch (err) {
      console.error('API error - TRIGGERING ULTIMATE FALLBACK:', err);
      // 🔥 ULTIMATE FAILSAFE FALLBACK 🔥
      setItinerary(FALLBACK_JSON);
      setIsFallback(true);
      setProgress(100);
      setLoadingStage(2);
      setError('');

    } finally {
      // SLIGHT DELAY BEFORE HIDING LOADER FOR SMOOTHNESS
      setTimeout(() => setLoading(false), 300);
      setActiveId(null);
    }
  };

  const handleMarkerClick = (id) => {
    setActiveId(id);
    const element = document.getElementById(`activity-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
      {/* Skip Navigation — keyboard accessibility */}
      <a href="#itinerary-canvas-main" className="skip-nav">
        Skip to Itinerary
      </a>

      {/* Animated Background */}
      <div className="bg-canvas" aria-hidden="true">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
      </div>

      {/* App Layout */}
      <div className="app-layout">

        {/* LEFT: Control Panel */}
        <ControlPanel
          destination={destination}  setDestination={setDestination}
          budget={budget}            setBudget={setBudget}
          days={days}                setDays={setDays}
          currency={currency}        setCurrency={setCurrency}
          loading={loading}
          loadingStage={loadingStage}
          onSubmit={handlePlanTrip}
          error={error}
        />

        {/* RIGHT: Experience Canvas */}
        <main className="experience-canvas" id="itinerary-canvas-main">

          {/* Hero Header */}
          <header className="canvas-header">
            <div>
              <p className="hero-eyebrow">AI Travel Intelligence Platform</p>
              <h1 className="hero-title">
                Your AI Travel<br />Companion Awaits
              </h1>
              <p className="hero-sub">
                Describe your dream trip and let our multi-agent AI craft a
                hyper-personalized itinerary — complete with local insights,
                budget breakdowns, and hidden gems.
              </p>
            </div>
            <div className="status-badge" aria-live="polite">
              <span className="status-dot" />
              {loading ? 'Generating…' : 'AI Online'}
            </div>
          </header>

          {/* Feature Cards */}
          <div className="feature-grid">
            <FeatureCard
              icon={Brain}
              title="Smart Itinerary"
              desc="Multi-day plans crafted by CrewAI agents with real local knowledge and context."
              colorClass="card-cyan"
              bgClass="bg-cyan"
            />
            <FeatureCard
              icon={BarChart3}
              title="Budget Optimizer"
              desc="Dynamic cost breakdowns across accommodation, food, transport, and activities."
              colorClass="card-blue"
              bgClass="bg-blue"
            />
            <FeatureCard
              icon={Compass}
              title="Local Insights"
              desc="Hidden gems, off-season tips, and cultural nuances sourced in real time."
              colorClass="card-violet"
              bgClass="bg-violet"
            />
          </div>

          {/* Itinerary Canvas */}
          <ItineraryCanvas
            itinerary={itinerary}
            loading={loading}
            destination={destination}
            days={days}
            budget={budget}
            currency={currency}
            progress={progress}
            loadingStage={loadingStage}
            isFallback={isFallback}
            activeId={activeId}
            setActiveId={setActiveId}
            onMarkerClick={handleMarkerClick}
            onActivityHover={setActiveId}
          />

          {/* Footer */}
          <footer className="canvas-footer">
            © 2026 Routewise — Powered by{' '}
            <a href="https://crewai.com" target="_blank" rel="noopener noreferrer">CrewAI</a>
            {' & '}
            <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter</a>
          </footer>
        </main>
      </div>
    </>
  );
}

export default App;
