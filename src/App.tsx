import { useState } from "react";

/* =======================
   TYPES
======================= */

interface Rock {
  Rock_number: number;
  EC_rock: number;
  Ph_rock: number;
  Corg_rock: string;
  Ca_rock: number;
  K_rock: number;
  Mg_rock: number;
  Na_rock: number;
  SAR_rock: number;
  SiO2_rock: number;
  Al2O3_rock: number;
  Fe2O3_rock: number;
  TiO2_rock: number;
  MnO_rock: number;
  CaO_rock: number;
  MgO_rock: number;
  Na2O_rock: number;
  K2O_rock: number;
  SO3_rock: number;
  P2O5_rock: number;
}

interface InterventionEvent {
  id: string;
  Timestep: number;
  Type_event: "rain" | "snow";
  Acid: number;
  Temp: number;
}

interface LeachateResult {
  timestep: number;
  Ca_leachate: number;
  Mg_leachate: number;
  Na_leachate: number;
  K_leachate: number;
  Fe_leachate: number;
  Sulfate_leachate: number;
  EC_leachate: number;
  Ph_leachate: number;
  Explanation: string;
}

/* =======================
   DATA
======================= */

const EXISTING_ROCKS: Rock[] = [
  {
    Rock_number: 1,
    EC_rock: 150,
    Ph_rock: 7.2,
    Corg_rock: "Granite A",
    Ca_rock: 12,
    K_rock: 4,
    Mg_rock: 3,
    Na_rock: 2,
    SAR_rock: 1.5,
    SiO2_rock: 72,
    Al2O3_rock: 14.4,
    Fe2O3_rock: 1.2,
    TiO2_rock: 0.3,
    MnO_rock: 0.05,
    CaO_rock: 1.8,
    MgO_rock: 0.7,
    Na2O_rock: 3.5,
    K2O_rock: 4.1,
    SO3_rock: 0.1,
    P2O5_rock: 0.1
  }
];

const EMPTY_ROCK: Rock = {
  Rock_number: 99,
  EC_rock: 0,
  Ph_rock: 7,
  Corg_rock: "Custom Rock",
  Ca_rock: 0,
  K_rock: 0,
  Mg_rock: 0,
  Na_rock: 0,
  SAR_rock: 0,
  SiO2_rock: 0,
  Al2O3_rock: 0,
  Fe2O3_rock: 0,
  TiO2_rock: 0,
  MnO_rock: 0,
  CaO_rock: 0,
  MgO_rock: 0,
  Na2O_rock: 0,
  K2O_rock: 0,
  SO3_rock: 0,
  P2O5_rock: 0
};

/* =======================
   APP
======================= */

export default function App() {
  const [inputMode, setInputMode] = useState<"existing" | "custom">("existing");
  const [selectedRock, setSelectedRock] = useState<Rock>(EXISTING_ROCKS[0]);
  const [customRock, setCustomRock] = useState<Rock>(EMPTY_ROCK);
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [results, setResults] = useState<LeachateResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddEvent = () => {
    setEvents(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        Timestep: prev.length + 1,
        Type_event: "rain",
        Acid: 0,
        Temp: 20
      }
    ]);
  };

  const updateEvent = (id: string, field: keyof InterventionEvent, value: any) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setResults(null);

    const rock = inputMode === "existing" ? selectedRock : customRock;

    const payload = {
      rock,
      events: events.map(e => ({
        Type_event: e.Type_event,
        Acid: e.Acid,
        Temp: e.Temp,
        Event_quantity: 1
      }))
    };

    const res = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* HEADER */}
          <header className="text-center">
            <h1 className="text-4xl font-bold text-slate-800">
              GeoChem Leachate Predictor
            </h1>
            <p className="text-slate-600 mt-2">
              Predict leachate composition from rock properties and environmental sequences
            </p>
          </header>

          {/* INPUTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ROCK CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Rock Selection</h2>

              <div className="flex gap-2 mb-4">
                <button
                    onClick={() => setInputMode("existing")}
                    className={`px-4 py-1 rounded-full text-sm ${
                        inputMode === "existing"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600"
                    }`}
                >
                  Preloaded
                </button>
                <button
                    onClick={() => setInputMode("custom")}
                    className={`px-4 py-1 rounded-full text-sm ${
                        inputMode === "custom"
                            ? "bg-slate-800 text-white"
                            : "bg-slate-100 text-slate-600"
                    }`}
                >
                  Custom
                </button>
              </div>

              <select
                  className="w-full border border-slate-300 rounded-lg p-2"
                  value={selectedRock.Rock_number}
                  onChange={e =>
                      setSelectedRock(
                          EXISTING_ROCKS.find(
                              r => r.Rock_number === Number(e.target.value)
                          )!
                      )
                  }
              >
                {EXISTING_ROCKS.map(r => (
                    <option key={r.Rock_number} value={r.Rock_number}>
                      {r.Corg_rock}
                    </option>
                ))}
              </select>

              <div className="mt-4 text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
                <strong>SiO₂:</strong> {selectedRock.SiO2_rock}% &nbsp;|&nbsp;
                <strong>CaO:</strong> {selectedRock.CaO_rock}% &nbsp;|&nbsp;
                <strong>pH:</strong> {selectedRock.Ph_rock}
              </div>
            </div>

            {/* EVENTS CARD */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Environmental Events</h2>

              {events.map(e => (
                  <div
                      key={e.id}
                      className="grid grid-cols-4 gap-3 items-center mb-3 bg-slate-50 p-3 rounded-lg"
                  >
                    <select
                        className="border rounded p-1"
                        value={e.Type_event}
                        onChange={ev => updateEvent(e.id, "Type_event", ev.target.value)}
                    >
                      <option value="rain">Rain</option>
                      <option value="snow">Snow</option>
                    </select>

                    <input
                        type="number"
                        className="border rounded p-1"
                        value={e.Temp}
                        onChange={ev => updateEvent(e.id, "Temp", +ev.target.value)}
                    />

                    <label className="flex items-center gap-1 text-sm">
                      <input
                          type="checkbox"
                          checked={e.Acid === 1}
                          onChange={ev =>
                              updateEvent(e.id, "Acid", ev.target.checked ? 1 : 0)
                          }
                      />
                      Acid
                    </label>

                    <button
                        onClick={() => removeEvent(e.id)}
                        className="text-red-500 font-semibold"
                    >
                      ✕
                    </button>
                  </div>
              ))}

              <div className="flex gap-3 mt-4">
                <button
                    onClick={handleAddEvent}
                    className="px-4 py-2 bg-slate-200 rounded-lg text-sm"
                >
                  + Add Event
                </button>
                <button
                    onClick={handleRunSimulation}
                    disabled={events.length === 0 || loading}
                    className="px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold disabled:bg-slate-300"
                >
                  {loading ? "Running..." : "Run Prediction"}
                </button>
              </div>
            </div>
          </div>

          {/* RESULTS */}
          {results && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold mb-4">Predicted Results</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map(r => (
                      <div key={r.timestep} className="border rounded-lg p-4">
                        <h3 className="font-bold mb-2">Timestep {r.timestep}</h3>
                        <div className="text-sm space-y-1">
                          <div>pH: {r.Ph_leachate}</div>
                          <div>Ca: {r.Ca_leachate} mg/L</div>
                          <div>Mg: {r.Mg_leachate} mg/L</div>
                          <div>Fe: {r.Fe_leachate} µg/L</div>
                        </div>
                        <p className="mt-2 text-xs italic text-slate-600">
                          {r.Explanation}
                        </p>
                      </div>
                  ))}
                </div>
              </div>
          )}
        </div>
      </div>
  );
}
