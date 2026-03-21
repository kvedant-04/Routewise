import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import {
  MapPin, DollarSign, Calendar, Sparkles,
  AlertCircle, Brain, BarChart3, Compass,
  Zap, Globe, TrendingUp, Clock, Users,
  Sunrise, Sun, Moon, Navigation
} from 'lucide-react';
import MapIntelligence from './components/MapIntelligence';
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

function RotatingNotes() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState('active');
  const messages = [
    "Analyzing your trip...",
    "Optimizing routes...",
    "Finalizing plan...",
    "Curating experiences..."
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
          {msg}
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
function ControlPanel({ destination, setDestination, budget, setBudget, days, setDays, currency, setCurrency, loading, onSubmit, error }) {

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
                  {["Thinking...", "Mapping...", "Polishing..."][loadingStage] || "Planning..."}
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
   HYBRID PARSING ENGINE
   ============================================================ */
function parseItinerary(markdown) {
  if (!markdown || typeof markdown !== 'string') return null;

  try {
    // 1. Try to see if it's already JSON (some LLMs might ignore instructions)
    if (markdown.trim().startsWith('{')) {
      return JSON.parse(markdown);
    }

    const days = [];
    // Split by day headers
    const sections = markdown.split(/(?=## Day |### Day |Day \d+:)/i);
    
    // Skip index 0 if it's just intro text
    const daySections = sections.filter(s => /Day \d+/i.test(s));

    daySections.forEach((section, idx) => {
      const dayMatch = section.match(/Day (\d+):?\s*(.*)/i);
      const dayNum = dayMatch ? parseInt(dayMatch[1], 10) : idx + 1;
      const dayLabel = dayMatch ? dayMatch[2].split('\n')[0].trim() : `Day ${dayNum}`;

      const activities = [];
      const slots = ['Morning', 'Afternoon', 'Evening'];

      slots.forEach(slot => {
        // Look for slot block: **Morning**: ... up to next slot or end
        const slotRegex = new RegExp(`\\*\\*${slot}\\*\\*:(.*?)(?=\\*\\*|###|##|$)`, 'is');
        const slotMatch = section.match(slotRegex);

        if (slotMatch) {
          const content = slotMatch[1].trim();
          const lines = content.split('\n');
          const descMatch = lines[0]; // First line is usually desc
          
          // Secondary extraction for location/cost/tags
          const locMatch = content.match(/Location:\s*(.*)/i);
          const costMatch = content.match(/Cost:\s*.*?(\d+)/i);
          const tagsMatch = content.match(/Tags:\s*(.*)/i);

          activities.push({
            time: slot,
            description: descMatch.replace(/^[*-]\s*/, '').trim(),
            location: locMatch ? locMatch[1].trim() : "",
            cost: costMatch ? parseFloat(costMatch[1]) : 0,
            tags: tagsMatch ? tagsMatch[1].split(',').map(t => t.trim()).filter(Boolean) : []
          });
        }
      });

      if (activities.length > 0) {
        days.push({
          day: dayNum,
          label: dayLabel,
          activities
        });
      }
    });

    // Extract budget summary if present
    const budgetMatch = markdown.match(/Total Estimated Cost:\s*.*?(\d+)/i);
    const currencyMatch = markdown.match(/Currency:\s*(\w+)/i);

    return {
      itinerary: days,
      budget_summary: days.length > 0 ? {
        total_estimated: budgetMatch ? parseFloat(budgetMatch[1]) : 0,
        currency: currencyMatch ? currencyMatch[1] : "USD"
      } : null
    };
  } catch (e) {
    console.warn("PARSER ERROR:", e);
    return null;
  }
}

/* ============================================================
   COMPONENT: ItineraryCanvas (Right panel itinerary renderer)
   ============================================================ */
function ItineraryCanvas({ itinerary, loading, destination, days, budget, currency, progress, loadingStage, isFallback, onMarkerClick, activeId, onActivityHover }) {

  const renderItinerary = (rawMarkdown) => {
    if (!rawMarkdown) return null;
    
    // PHASE 6 — ERROR BOUNDARY
    try {
      // PHASE 3 — ADD MARKDOWN PARSER
      const parsedData = parseItinerary(rawMarkdown);

      // PHASE 9 — CONFIDENCE CHECK
      if (!parsedData || !parsedData.itinerary || parsedData.itinerary.length === 0) {
        return (
          <div className="premium-markdown-container fade-in">
            <ReactMarkdown>{rawMarkdown}</ReactMarkdown>
          </div>
        );
      }

      // PHASE 4 — HYBRID RENDERING (Premium UI)
      return (
        <div className="itinerary-grid fade-in">
          {parsedData.itinerary.map((day, idx) => {
            // Grouping is now done during parsing, but we can filter here for safety
            const grouped = {
              Morning: day.activities.filter(a => a.time === 'Morning'),
              Afternoon: day.activities.filter(a => a.time === 'Afternoon'),
              Evening: day.activities.filter(a => a.time === 'Evening')
            };

            return (
              <div key={idx} className="day-card-premium glass">
                <div className="day-header">
                  <div className="day-badge">Day {day.day}</div>
                  <h3 className="day-title-text">{day.label}</h3>
                </div>
                
                <div className="day-sections">
                  {Object.keys(grouped).map(slot => {
                    const acts = grouped[slot];
                    if (acts.length === 0) return null;

                    const icons = {
                      Morning: { Icon: Sunrise, color: 'text-cyan-400' },
                      Afternoon: { Icon: Sun, color: 'text-amber-400' },
                      Evening: { Icon: Moon, color: 'text-violet-400' }
                    };
                    const { Icon, color } = icons[slot];

                    return (
                      <div key={slot} className="section-block">
                        <div className="section-label">
                          <Icon size={14} className={color} /> {slot}
                        </div>
                        <div className="section-list">
                          {acts.map((act, i) => (
                            <div 
                              key={i} 
                              className={`activity-item ${activeId === act.description ? 'active-ref' : ''}`}
                              onMouseEnter={() => onActivityHover?.(act.description)}
                              onMouseLeave={() => onActivityHover?.(null)}
                              id={`activity-${act.description.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <p className="activity-desc">{act.description}</p>
                              {act.location && (
                                <div className="activity-location">
                                  <MapPin size={10} /> {act.location}
                                </div>
                              )}
                              {act.tags && act.tags.length > 0 && (
                                <div className="activity-tags">
                                  {act.tags.map((tag, ti) => (
                                    <span key={ti} className="tag-chip">{tag}</span>
                                  ))}
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
          
          {parsedData.budget_summary && parsedData.budget_summary.total_estimated > 0 && (
            <div className="total-cost-banner glass">
              <span>Total Budget Analysis</span>
              <span className="total-val">
                {parsedData.budget_summary.currency} {parsedData.budget_summary.total_estimated}
              </span>
            </div>
          )}
        </div>
      );
    } catch (e) {
      console.error("HYBRID RENDER CRASH:", e);
      return (
        <div className="premium-markdown-container">
          <ReactMarkdown>{rawMarkdown}</ReactMarkdown>
        </div>
      );
    }
  };

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
      {loading ? (
        <div className="itinerary-loading-experience">
          <div className="loading-center-stack">
            <ProgressRing progress={progress} />
            <RotatingNotes />
          </div>
        </div>
      ) : itinerary ? (
        <div className="itinerary-content">
          <MapIntelligence 
            itinerary={itinerary} 
            destination={destination}
            activeId={activeId}
            onMarkerClick={onMarkerClick}
          />
          {renderItinerary(itinerary)}
        </div>
      ) : (
        <div className="itinerary-empty">
          <div className="empty-orb">
            <div className="empty-orb-inner" />
            <div className="empty-orb-ring" />
          </div>
          <p className="empty-title">Your journey unfolds here</p>
          <p className="empty-desc">
            Fill in your destination, budget, and trip length in the control
            panel, then hit <strong style={{ color: 'var(--cyan)' }}>Plan My Journey</strong> to
            generate a personalized AI itinerary.
          </p>
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
}

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
  const [loadingStage, setLoadingStage] = useState(0);
  const [isFallback, setIsFallback]   = useState(false);
  const [activeActivityName, setActiveActivityName] = useState(null);

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

    // 2-SECOND MINIMUM LOAD TIME (PHASE 12)
    const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

    try {
      console.log("SENDING REQUEST TO:", `${API_URL}/plan-trip`);
      
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

      if (response.data?.success) {
        setProgress(100); // JUMP TO 100% (PHASE 12)
        const resItinerary = response.data?.data?.itinerary || "";
        setItinerary(resItinerary);
        
        // SHOW FALLBACK NOTE IF ACTIVE
        if (response.data?.fallback) {
          setIsFallback(true);
        } else {
          setIsFallback(false);
        }
      } else {
        setError(response.data?.data?.itinerary || 'Failed to generate itinerary. Please try again.');
      }
    } catch (err) {
      console.error('API error:', err);
      setError(
        err.response?.data?.data?.itinerary || 
        err.response?.data?.message ||
        `Could not connect to backend at ${API_URL}. Please ensure the server is running.`
      );
    } finally {
      // SLIGHT DELAY BEFORE HIDING LOADER FOR SMOOTHNESS
      setTimeout(() => setLoading(false), 300);
      setActiveActivityName(null);
    }
  };

  const handleMarkerClick = (name) => {
    setActiveActivityName(name);
    const element = document.getElementById(`activity-${name.toLowerCase().replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <>
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
          onSubmit={handlePlanTrip}
          error={error}
        />

        {/* RIGHT: Experience Canvas */}
        <main className="experience-canvas">

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
            activeId={activeActivityName}
            onMarkerClick={handleMarkerClick}
            onActivityHover={setActiveActivityName}
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
