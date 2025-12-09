import { useState } from 'react';
import { RockSelector } from './components/RockSelector';
import { EventSequenceInput } from './components/EventSequenceInput';
import { PredictionResults } from './components/PredictionResults';
import { Rock, Event, LeachatePrediction } from './lib/supabase';
import { Beaker, Play, Loader2 } from 'lucide-react';

function App() {
  const [selectedRock, setSelectedRock] = useState<Partial<Rock> | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [predictions, setPredictions] = useState<LeachatePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrediction = async () => {
    if (!selectedRock || events.length === 0) {
      setError('Please select a rock and add at least one event.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const apiUrl = `${supabaseUrl}/functions/v1/predict-leachate`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rock: selectedRock,
          events: events,
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setPredictions(data.predictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <Beaker className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Rock Leachate Prediction System
              </h1>
              <p className="text-gray-600 mt-1">
                Analyze and predict leachate characteristics from rock samples
              </p>
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <RockSelector
            onRockSelect={setSelectedRock}
            selectedRock={selectedRock}
          />

          <EventSequenceInput
            events={events}
            onEventsChange={setEvents}
          />
        </div>

        <div className="mb-6">
          <button
            onClick={runPrediction}
            disabled={!selectedRock || events.length === 0 || isLoading}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-semibold text-lg flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Running Prediction...
              </>
            ) : (
              <>
                <Play className="w-6 h-6" />
                Run Prediction
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}
        </div>

        {predictions.length > 0 && (
          <PredictionResults predictions={predictions} />
        )}

        {!selectedRock && predictions.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              <Beaker className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Ready to Start?
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Select a rock sample and define your event sequence to generate predictions
              on leachate characteristics with detailed explanations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
