import React, { useMemo, useState, lazy, Suspense } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Download, Share2, FileJson, CalendarPlus, MessageCircle, Image, FileText, TrendingUp, Zap, DollarSign } from 'lucide-react';
import { buildFinancialData, getInsights } from '../utils/financialEngine';
import { exportJSON, exportImage, exportPDF, buildGoogleCalendarUrl, buildWhatsAppText } from '../utils/exportEngine';

const CHART_COLORS = ['#22d3ee', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="fin-tooltip">
      <p className="fin-tooltip-label">{label || payload[0].name}</p>
      <p className="fin-tooltip-value">${Number(payload[0].value).toFixed(0)}</p>
    </div>
  );
};

function SummaryCard({ label, value, icon: Icon, color }) {
  return (
    <div className="fin-summary-card">
      <div className="fin-summary-icon" style={{ background: `${color}20`, border: `1px solid ${color}40` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="fin-summary-text">
        <span className="fin-summary-value">{value}</span>
        <span className="fin-summary-label">{label}</span>
      </div>
    </div>
  );
}

function InsightPanel({ insights }) {
  const colors = ['#22d3ee', '#f59e0b', '#10b981', '#8b5cf6'];
  return (
    <div className="fin-insights-panel">
      <div className="fin-section-header">
        <Zap size={16} className="fin-icon-accent" />
        <h4 className="fin-section-title">AI Insights</h4>
      </div>
      <div className="fin-insights-list">
        {insights.map((insight, i) => (
          <div key={i} className="fin-insight-item">
            <span className="fin-insight-dot" style={{ background: colors[i % colors.length] }} />
            <p className="fin-insight-text">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExportPanel({ safeEvents, financialData, itinerary, destination }) {
  const [exporting, setExporting] = useState(null);

  const handlePDF = async () => {
    setExporting('pdf');
    try { await exportPDF(safeEvents, financialData, destination); }
    finally { setExporting(null); }
  };

  const handleImage = async () => {
    setExporting('image');
    try { await exportImage('itinerary-canvas'); }
    finally { setExporting(null); }
  };

  const handleJSON = () => {
    exportJSON(itinerary);
  };

  const handleWhatsApp = () => {
    const url = buildWhatsAppText(safeEvents, financialData, destination);
    window.open(url, '_blank', 'noopener');
  };

  const handleCalendar = () => {
    if (!safeEvents.length) return;
    const url = buildGoogleCalendarUrl(safeEvents[0]);
    window.open(url, '_blank', 'noopener');
  };

  const buttons = [
    { id: 'pdf', label: 'PDF', icon: FileText, action: handlePDF, color: '#ef4444' },
    { id: 'image', label: 'Image', icon: Image, action: handleImage, color: '#6366f1' },
    { id: 'json', label: 'JSON', icon: FileJson, action: handleJSON, color: '#22d3ee' },
    { id: 'calendar', label: 'Calendar', icon: CalendarPlus, action: handleCalendar, color: '#10b981' },
    { id: 'whatsapp', label: 'Share', icon: MessageCircle, action: handleWhatsApp, color: '#22c55e' },
  ];

  return (
    <div className="fin-export-panel">
      <div className="fin-section-header">
        <Share2 size={16} className="fin-icon-accent" />
        <h4 className="fin-section-title">Export & Share</h4>
      </div>
      <div className="fin-export-buttons">
        {buttons.map(({ id, label, icon: Icon, action, color }) => (
          <button
            key={id}
            className="fin-export-btn"
            onClick={action}
            disabled={!!exporting}
            style={{ '--btn-color': color }}
            title={`Export as ${label}`}
          >
            {exporting === id
              ? <span className="fin-btn-spinner" />
              : <Icon size={16} />
            }
            <span>{exporting === id ? 'Exporting…' : label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const FinancialDashboard = React.memo(function FinancialDashboard({
  safeEvents,
  itinerary,
  budget = 0,
  currency = 'USD',
  destination = '',
}) {
  const financialData = useMemo(() => buildFinancialData(safeEvents), [safeEvents]);
  const insights = useMemo(() => getInsights(financialData, budget), [financialData, budget]);

  const { totalCost, perDayCost, categoryCost } = financialData;

  const dayCount = Object.keys(perDayCost).length;
  const dailyAvg = dayCount > 0 ? totalCost / dayCount : 0;
  const maxDayEntry = Object.entries(perDayCost).sort((a, b) => b[1] - a[1])[0];
  const highestDay = maxDayEntry ? `Day ${maxDayEntry[0]}: $${maxDayEntry[1].toFixed(0)}` : '—';

  const pieData = Object.entries(categoryCost)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const barData = Object.entries(perDayCost)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([day, value]) => ({ day: `Day ${day}`, cost: value }));

  if (!safeEvents || safeEvents.length === 0) return null;

  return (
    <div className="fin-root" id="financial-dashboard">
      {/* Header */}
      <div className="fin-header">
        <div className="fin-header-left">
          <TrendingUp size={20} className="fin-icon-accent" />
          <h3 className="fin-title">Financial Intelligence</h3>
        </div>
        <span className="fin-header-badge">AI Powered</span>
      </div>

      {/* Summary Strip */}
      <div className="fin-summary-strip">
        <SummaryCard
          label="Total Spend"
          value={`$${totalCost.toFixed(0)}`}
          icon={DollarSign}
          color="#22d3ee"
        />
        <SummaryCard
          label="Daily Average"
          value={`$${dailyAvg.toFixed(0)}`}
          icon={TrendingUp}
          color="#6366f1"
        />
        <SummaryCard
          label="Highest Day"
          value={highestDay}
          icon={Zap}
          color="#f59e0b"
        />
      </div>

      {/* Charts */}
      {(pieData.length > 0 || barData.length > 0) && (
        <div className="fin-charts-row">
          {/* Pie */}
          {pieData.length > 0 && (
            <div className="fin-chart-card">
              <p className="fin-chart-label">Spend by Category</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.72rem', color: '#9ca3af' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Bar */}
          {barData.length > 0 && (
            <div className="fin-chart-card">
              <p className="fin-chart-label">Daily Cost Breakdown</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34,211,238,0.06)' }} />
                  <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row: Insights + Export */}
      <div className="fin-bottom-row">
        <InsightPanel insights={insights} />
        <ExportPanel
          safeEvents={safeEvents}
          financialData={financialData}
          itinerary={itinerary}
          destination={destination}
        />
      </div>
    </div>
  );
});

export default FinancialDashboard;
