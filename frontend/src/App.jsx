import React, { useState } from 'react';
import axios from 'axios';
import ControlPanel from './components/ControlPanel';
import ItineraryCanvas from './components/ItineraryCanvas';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [destination, setDestination] = useState('');

  const handlePlanTrip = async ({ destination: dest, budget, days, currency }) => {
    if (!dest || !budget || !days) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setItinerary('');
    setDestination(dest);

    try {
      const response = await axios.post(`${API_URL}/plan-trip`, {
        destination: dest,
        budget: parseFloat(budget),
        days: parseInt(days),
      });

      if (response.data.status === 'success') {
        setItinerary(response.data.itinerary);
      } else {
        setError(response.data.reasoning_logs || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error(err);
      setError(
        `Connection to backend failed. Make sure the server is running at ${API_URL}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rw-app">
      {/* Layered background */}
      <div className="rw-bg" aria-hidden="true">
        <div className="rw-bg-gradient-1" />
        <div className="rw-bg-gradient-2" />
        <div className="rw-bg-noise" />
      </div>

      {/* Two-panel layout */}
      <div className="rw-layout">
        <ControlPanel
          onSubmit={handlePlanTrip}
          loading={loading}
          error={error}
        />
        <ItineraryCanvas
          itinerary={itinerary}
          loading={loading}
          destination={destination}
        />
      </div>
    </div>
  );
}

export default App;
