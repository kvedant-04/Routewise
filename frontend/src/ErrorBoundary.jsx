import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallbackUI) {
        return this.props.fallbackUI;
      }
      return (
        <div className="error-boundary-container fade-in">
          <div className="error-boundary-card glass">
            <div className="error-icon-wrapper">
              <AlertCircle size={32} className="text-amber-400" />
            </div>
            <h2 className="error-title">Gracefully Degraded UI</h2>
            <p className="error-message">
              The premium visualization framework was bypassed due to missing structural parameters, but your itinerary map remains intact.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{ marginTop: '1.5rem', width: 'auto', padding: '0.75rem 1.5rem' }}
            >
              <RefreshCw size={16} /> Re-Initialize UI
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
