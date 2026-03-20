import React from 'react';
import { Sparkles, Globe, Zap } from 'lucide-react';

const Header = () => {
  return (
    <header className="rw-header">
      <div className="rw-header-inner">
        {/* Logo */}
        <div className="rw-logo">
          <div className="rw-logo-mark">
            <Sparkles size={16} />
            <span>RW</span>
          </div>
          <div className="rw-logo-text">
            <span className="rw-logo-name">Routewise</span>
            <span className="rw-logo-tagline">AI Travel Intelligence</span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="rw-header-status">
          <div className="rw-status-badge">
            <Globe size={12} />
            <span>150K+ trips planned</span>
          </div>
          <div className="rw-status-badge rw-status-active">
            <Zap size={12} />
            <span>AI Online</span>
          </div>
          <div className="rw-status-badge">
            <span>4.9★ rated</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
