import React, { useState } from 'react';
import { MapPin, DollarSign, Calendar, Globe, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const FloatingInput = ({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, min }) => {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value;

  return (
    <div className={`rw-input-group ${isActive ? 'rw-input-active' : ''} ${focused ? 'rw-input-focused' : ''}`}>
      <div className="rw-input-icon">
        <Icon size={16} />
      </div>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={isActive ? placeholder : ''}
        min={min}
        className="rw-input"
        autoComplete="off"
      />
      <label htmlFor={id} className="rw-label">
        {label}
      </label>
      <div className="rw-input-glow" />
    </div>
  );
};

const ControlPanel = ({ onSubmit, loading, error }) => {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const selectedCurrency = currencies.find(c => c.code === currency);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ destination, budget, days, currency });
  };

  return (
    <aside className="rw-control-panel">
      {/* Panel glow orb */}
      <div className="rw-panel-glow" />

      {/* Logo Section */}
      <div className="rw-panel-logo">
        <div className="rw-monogram">
          <Sparkles size={14} />
          <span>RW</span>
        </div>
        <div>
          <div className="rw-panel-brand">Routewise</div>
          <div className="rw-panel-tagline">AI Travel Intelligence</div>
        </div>
      </div>

      {/* Divider */}
      <div className="rw-section-label">
        <span>PLAN YOUR JOURNEY</span>
        <div className="rw-section-line" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rw-form">
        <FloatingInput
          id="destination"
          label="Destination"
          icon={MapPin}
          placeholder="Paris, Tokyo, Bali…"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />

        <FloatingInput
          id="budget"
          label={`Total Budget (${selectedCurrency.symbol})`}
          icon={DollarSign}
          type="number"
          placeholder="e.g. 2500"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          min="1"
        />

        <FloatingInput
          id="days"
          label="Duration (Days)"
          icon={Calendar}
          type="number"
          placeholder="e.g. 7"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min="1"
        />

        {/* Currency Selector */}
        <div className="rw-select-group">
          <div className="rw-input-icon">
            <Globe size={16} />
          </div>
          <label className="rw-select-label">Currency</label>
          <div className="rw-select-wrapper" onClick={() => setCurrencyOpen(!currencyOpen)}>
            <span>{selectedCurrency.code} — {selectedCurrency.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: currencyOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {currencyOpen && (
            <div className="rw-dropdown">
              {currencies.map(c => (
                <div
                  key={c.code}
                  className={`rw-dropdown-item ${currency === c.code ? 'rw-dropdown-selected' : ''}`}
                  onClick={() => { setCurrency(c.code); setCurrencyOpen(false); }}
                >
                  <span className="rw-dropdown-symbol">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="rw-dropdown-name">{c.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rw-error">
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        {/* CTA Button */}
        <button type="submit" className="rw-cta-btn" disabled={loading}>
          <span className="rw-btn-shimmer" />
          {loading ? (
            <span className="rw-btn-content">
              <Loader2 size={18} className="rw-spin" />
              <span>Crafting your journey…</span>
            </span>
          ) : (
            <span className="rw-btn-content">
              <Sparkles size={18} />
              <span>Generate Itinerary</span>
            </span>
          )}
        </button>
      </form>

      {/* Bottom Stats */}
      <div className="rw-panel-stats">
        <div className="rw-stat">
          <span className="rw-stat-value">150K+</span>
          <span className="rw-stat-label">Trips Planned</span>
        </div>
        <div className="rw-stat-divider" />
        <div className="rw-stat">
          <span className="rw-stat-value">4.9★</span>
          <span className="rw-stat-label">User Rating</span>
        </div>
        <div className="rw-stat-divider" />
        <div className="rw-stat">
          <span className="rw-stat-value">98%</span>
          <span className="rw-stat-label">Satisfaction</span>
        </div>
      </div>
    </aside>
  );
};

export default ControlPanel;
