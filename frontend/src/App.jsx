import React, { useState } from 'react';
import axios from 'axios';
import { MapPin, DollarSign, Calendar, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [destination, setDestination] = useState('');
  const [budget, setBudget] = useState('');
  const [days, setDays] = useState('');
  const [itinerary, setItinerary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlanTrip = async (e) => {
    e.preventDefault();
    if (!destination || !budget || !days) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setItinerary('');

    try {
      const response = await axios.post(`${API_URL}/plan-trip`, {
        destination,
        budget: parseFloat(budget),
        days: parseInt(days)
      });

      if (response.data.status === 'success') {
        setItinerary(response.data.itinerary);
      } else {
        setError(response.data.reasoning_logs || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to backend failed. Make sure the server is running at ' + API_URL);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-12">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="text-cyan-400 w-8 h-8" />
          <h1 className="m-0">Routewise</h1>
        </div>
        <p>AI-Powered Travel Planning for Your Next Adventure</p>
      </header>

      <main className="grid gap-8">
        <section className="glass card text-left">
          <form onSubmit={handlePlanTrip} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="input-group">
              <label htmlFor="destination">
                <MapPin className="inline w-4 h-4 mr-1" /> Destination
              </label>
              <input
                id="destination"
                type="text"
                placeholder="e.g. Paris"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="budget">
                <DollarSign className="inline w-4 h-4 mr-1" /> Budget ($)
              </label>
              <input
                id="budget"
                type="number"
                placeholder="Total budget"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label htmlFor="days">
                <Calendar className="inline w-4 h-4 mr-1" /> Duration (Days)
              </label>
              <input
                id="days"
                type="number"
                placeholder="Number of days"
                value={days}
                onChange={(e) => setDays(e.target.value)}
              />
            </div>

            <div className="md:col-span-3">
              <button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" />
                    Agent is planning your trip...
                  </span>
                ) : (
                  "Create Optimized Itinerary"
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {itinerary && (
          <section className="itinerary-container glass card">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="text-indigo-400" /> 
              Your Personalized Itinerary
            </h2>
            <div className="prose prose-invert max-w-none">
              {itinerary.split('\n').map((line, i) => {
                if (line.startsWith('Day ') || line.match(/^## /)) {
                  return <h3 key={i} className="text-cyan-400 mt-6 mb-2 font-bold">{line.replace('## ', '')}</h3>;
                }
                if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
                  return <li key={i} className="ml-4 text-slate-300">{line.trim().substring(1).trim()}</li>;
                }
                return <p key={i} className="text-slate-300 mb-2">{line}</p>;
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-16 py-8 text-slate-500 text-sm border-top border-slate-800">
        <p>© 2026 Routewise - Powered by CrewAI & OpenRouter</p>
      </footer>
    </div>
  );
}

export default App;
