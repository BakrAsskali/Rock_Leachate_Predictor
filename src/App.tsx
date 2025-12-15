import { useState } from "react";

/* =======================
   TYPES
======================= */

interface Rock {
  Rock_number: number;
  EC_rock: number;
  Ph_rock: number;
  Corg_rock_perc: number; // Matches backend expectation
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
  Type_event: "rain" | "acid";
  Acid: number;
  Temp: number;
}

interface LeachateResult {
  timestep: number;
  Volume_leachate: number;
  EC_leachate: number;
  Ph_leachate: number;
  Chloride_leachate: number;
  Carbonate_leachate: number;
  Sulfate_leachate: number;
  Nitrate_leachate: number;
  Phosphate_leachate: number;
  Ca_leachate: number;
  Fe_leachate: number;
  K_leachate: number;
  Mg_leachate: number;
  Mn_leachate: number;
  Na_leachate: number;
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
    Corg_rock_perc: 0.5, // Changed from string "Granite A" to number
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
  Corg_rock_perc: 0,
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
   APP COMPONENT
======================= */

export default function App() {
  const [inputMode, setInputMode] = useState<"existing" | "custom">("existing");
  const [selectedRock, setSelectedRock] = useState<Rock>(EXISTING_ROCKS[0]);
  const [customRock, setCustomRock] = useState<Rock>(EMPTY_ROCK);
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [results, setResults] = useState<LeachateResult[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Use your VM IP here if accessing remotely, or localhost if testing via tunnel
  const API_URL = "http://localhost:8000/predict"; 

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

    // Payload construction
    const payload = {
      rock: rock,
      events: events.map(e => ({
        Type_event: e.Type_event,
        Acid: Number(e.Acid), // Ensure number
        Temp: Number(e.Temp), // Ensure number
        Event_quantity: 1.0   // Default volume
      }))
    };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
         const errText = await res.text();
         throw new Error(`Server Error: ${errText}`);
      }
      
      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error(err);
      alert("Failed to fetch prediction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* HEADER */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">
            GeoChem Leachate Model
          </h1>
          <p className="text-slate-600 mt-2">
            Multi-target prediction based on rock mineralogy and cumulative weathering
          </p>
        </header>

        {/* INPUT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: ROCK & EVENTS (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Rock Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">1. Rock Properties</h2>
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setInputMode("existing")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === "existing"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Preloaded
                </button>
                <button
                  onClick={() => setInputMode("custom")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    inputMode === "custom"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Custom
                </button>
              </div>

              {inputMode === "existing" ? (
                <select
                  className="w-full border border-slate-300 rounded-lg p-2.5 bg-slate-50"
                  value={selectedRock.Rock_number}
                  onChange={e =>
                    setSelectedRock(
                      EXISTING_ROCKS.find(r => r.Rock_number === Number(e.target.value))!
                    )
                  }
                >
                  {EXISTING_ROCKS.map(r => (
                    <option key={r.Rock_number} value={r.Rock_number}>
                      Rock #{r.Rock_number} (SiO₂: {r.SiO2_rock}%)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500">SiO2 (%)</label>
                        <input type="number" className="w-full border rounded p-1" 
                            value={customRock.SiO2_rock} onChange={e => setCustomRock({...customRock, SiO2_rock: +e.target.value})} />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500">CaO (%)</label>
                        <input type="number" className="w-full border rounded p-1" 
                            value={customRock.CaO_rock} onChange={e => setCustomRock({...customRock, CaO_rock: +e.target.value})} />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">Corg (%)</label>
                        <input type="number" className="w-full border rounded p-1" 
                            value={customRock.Corg_rock_perc} onChange={e => setCustomRock({...customRock, Corg_rock_perc: +e.target.value})} />
                    </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500">EC Rock</label>
                        <input type="number" className="w-full border rounded p-1" 
                            value={customRock.EC_rock} onChange={e => setCustomRock({...customRock, EC_rock: +e.target.value})} />
                    </div>
                </div>
              )}
            </div>

            {/* Events */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Weathering Events</h2>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {events.map((e, idx) => (
                  <div key={e.id} className="relative bg-slate-50 border border-slate-200 p-4 rounded-lg group">
                    <div className="absolute top-2 right-2 text-xs font-bold text-slate-400">
                        Step {idx + 1}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Type</label>
                            <select
                                className="w-full border rounded p-1.5 text-sm"
                                value={e.Type_event}
                                onChange={ev => updateEvent(e.id, "Type_event", ev.target.value)}
                            >
                                <option value="rain">Rain (Neutral)</option>
                                <option value="acid">Acid Event</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Temp (°C)</label>
                            <input
                                type="number"
                                className="w-full border rounded p-1.5 text-sm"
                                value={e.Temp}
                                onChange={ev => updateEvent(e.id, "Temp", +ev.target.value)}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-500 uppercase font-bold">Acid Load / Conc</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    min="0" max="100"
                                    className="flex-1"
                                    value={e.Acid}
                                    onChange={ev => updateEvent(e.id, "Acid", +ev.target.value)}
                                />
                                <span className="w-10 text-right text-sm font-mono">{e.Acid}</span>
                            </div>
                        </div>
                    </div>

                    <button
                      onClick={() => removeEvent(e.id)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleAddEvent}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
                >
                  + Add Step
                </button>
                <button
                  onClick={handleRunSimulation}
                  disabled={events.length === 0 || loading}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200"
                >
                  {loading ? "Calculating..." : "Run Model"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: RESULTS (7 cols) */}
          <div className="lg:col-span-7">
            {results ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-semibold text-slate-800">Prediction Analysis</h2>
                </div>
                
                <div className="divide-y divide-slate-100">
                  {results.map((r) => (
                    <div key={r.timestep} className="p-6 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide bg-slate-200 px-3 py-1 rounded-full">
                            Timestep {r.timestep}
                        </h3>
                        <span className="text-xs text-slate-500">Vol: {r.Volume_leachate.toFixed(2)} L</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
                        
                        {/* Key Indicators */}
                        <div className="col-span-2 sm:col-span-4 grid grid-cols-4 gap-4 mb-2">
                             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                                <div className="text-xs text-blue-600 font-bold uppercase">pH</div>
                                <div className="text-xl font-bold text-slate-700">{r.Ph_leachate.toFixed(2)}</div>
                             </div>
                             <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                                <div className="text-xs text-amber-600 font-bold uppercase">EC</div>
                                <div className="text-xl font-bold text-slate-700">{r.EC_leachate.toFixed(0)}</div>
                             </div>
                             <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                                <div className="text-xs text-emerald-600 font-bold uppercase">Sulfate</div>
                                <div className="text-xl font-bold text-slate-700">{r.Sulfate_leachate.toFixed(1)}</div>
                             </div>
                             <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 text-center">
                                <div className="text-xs text-slate-600 font-bold uppercase">Calcium</div>
                                <div className="text-xl font-bold text-slate-700">{r.Ca_leachate.toFixed(1)}</div>
                             </div>
                        </div>

                        {/* Metals & Ions Detail */}
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-1">Metals</p>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Mg:</span> <span className="font-mono">{r.Mg_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Fe:</span> <span className="font-mono">{r.Fe_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Na:</span> <span className="font-mono">{r.Na_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">K:</span> <span className="font-mono">{r.K_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Mn:</span> <span className="font-mono">{r.Mn_leachate.toFixed(3)}</span></div>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-1">Anions</p>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Cl⁻:</span> <span className="font-mono">{r.Chloride_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">NO₃⁻:</span> <span className="font-mono">{r.Nitrate_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">PO₄³⁻:</span> <span className="font-mono">{r.Phosphate_leachate.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">CO₃²⁻:</span> <span className="font-mono">{r.Carbonate_leachate.toFixed(2)}</span></div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 min-h-[300px]">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Configure rock and events, then run model</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
