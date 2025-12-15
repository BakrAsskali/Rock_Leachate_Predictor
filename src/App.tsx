import { useState } from "react";

/* =======================
   TYPES
======================= */

interface Rock {
  Rock_number: number;
  EC_rock: number;
  Ph_rock: number;
  Corg_rock_perc: number;
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

  explanation: string;
}


/* =======================
   DATA
======================= */

const EXISTING_ROCKS: Rock[] = [
  {
    Rock_number: 1,
    EC_rock: 1351,
    Ph_rock: 8.11,
    Corg_rock_perc: 0.05,
    Ca_rock: 22.24,
    K_rock: 0.16,
    Mg_rock: 3.09,
    Na_rock: 0.15,
    SAR_rock: 0.04,
    SiO2_rock: 21.78,
    Al2O3_rock: 7.38,
    Fe2O3_rock: 3.16,
    TiO2_rock: 0.39,
    MnO_rock: 0.03,
    CaO_rock: 20.55,
    MgO_rock: 2.88,
    Na2O_rock: 0.22,
    K2O_rock: 0.36,
    SO3_rock: 24.65,
    P2O5_rock: 0.01
  },
  {
    Rock_number: 2,
    EC_rock: 136.5,
    Ph_rock: 8.5,
    Corg_rock_perc: 0.09,
    Ca_rock: 1.04,
    K_rock: 0.13,
    Mg_rock: 0.58,
    Na_rock: 0.08,
    SAR_rock: 0.09,
    SiO2_rock: 33.41,
    Al2O3_rock: 11.65,
    Fe2O3_rock: 4.37,
    TiO2_rock: 0.55,
    MnO_rock: 0.11,
    CaO_rock: 19.31,
    MgO_rock: 5.35,
    Na2O_rock: 0.11,
    K2O_rock: 2.0,
    SO3_rock: 0.11,
    P2O5_rock: 0.03
  },
  {
    Rock_number: 3,
    EC_rock: 87.59,
    Ph_rock: 9.06,
    Corg_rock_perc: 0.24,
    Ca_rock: 0.45,
    K_rock: 0.25,
    Mg_rock: 0.33,
    Na_rock: 0.04,
    SAR_rock: 0.06,
    SiO2_rock: 24.59,
    Al2O3_rock: 7.72,
    Fe2O3_rock: 2.88,
    TiO2_rock: 0.36,
    MnO_rock: 0.06,
    CaO_rock: 30.68,
    MgO_rock: 2.91,
    Na2O_rock: 0.25,
    K2O_rock: 0.04,
    SO3_rock: 0.0,
    P2O5_rock: 0.0
  },
  {
    Rock_number: 4,
    EC_rock: 66.58,
    Ph_rock: 8.93,
    Corg_rock_perc: 0.1,
    Ca_rock: 0.47,
    K_rock: 0.15,
    Mg_rock: 0.27,
    Na_rock: 0.07,
    SAR_rock: 0.12,
    SiO2_rock: 46.29,
    Al2O3_rock: 15.89,
    Fe2O3_rock: 6.14,
    TiO2_rock: 0.29,
    MnO_rock: 0.19,
    CaO_rock: 29.39,
    MgO_rock: 0.03,
    Na2O_rock: 0.10,
    K2O_rock: 0.2,
    SO3_rock: 0.0,
    P2O5_rock: 0.0
  },
  {
    Rock_number: 5,
    EC_rock: 132.28,
    Ph_rock: 8.85,
    Corg_rock_perc: 0.98,
    Ca_rock: 0.66,
    K_rock: 0.79,
    Mg_rock: 0.47,
    Na_rock: 0.13,
    SAR_rock: 0.17,
    SiO2_rock: 49.30,
    Al2O3_rock: 14.87,
    Fe2O3_rock: 5.37,
    TiO2_rock: 0.39,
    MnO_rock: 0.08,
    CaO_rock: 8.92,
    MgO_rock: 4.22,
    Na2O_rock: 0.54,
    K2O_rock: 3.30,
    SO3_rock: 0.05,
    P2O5_rock: 0.17
  },
  {
    Rock_number: 6,
    EC_rock: 126.904,
    Ph_rock: 0.56,
    Corg_rock_perc: 0.67,
    Ca_rock: 0.45,
    K_rock: 0.05,
    Mg_rock: 0.08,
    Na_rock: 0.11,
    SAR_rock: 0.43,
    SiO2_rock: 42.14,
    Al2O3_rock: 51.45,
    Fe2O3_rock: 0.36,
    TiO2_rock: 0.04,
    MnO_rock: 19.64,
    CaO_rock: 4.46,
    MgO_rock: 0.51,
    Na2O_rock: 2.65,
    K2O_rock: 0.45,
    SO3_rock: 0.11,
    P2O5_rock: 0.0
  },
  {
    Rock_number: 7,
    EC_rock: 65.897,
    Ph_rock: 0.08,
    Corg_rock_perc: 0.59,
    Ca_rock: 0.15,
    K_rock: 0.01,
    Mg_rock: 0.05,
    Na_rock: 0.09,
    SAR_rock: 52.11,
    SiO2_rock: 15.64,
    Al2O3_rock: 34.0,
    Fe2O3_rock: 0.40,
    TiO2_rock: 0.08,
    MnO_rock: 5.85,
    CaO_rock: 3.84,
    MgO_rock: 0.57,
    Na2O_rock: 0.10,
    K2O_rock: 0.14,
    SO3_rock: 0.0,
    P2O5_rock: 0.0
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
   HELPER FUNCTIONS
======================= */

// Fix: Use simple random ID generation for non-secure contexts (HTTP/IP)
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/* =======================
   APP COMPONENT
======================= */

export default function App() {
  const [inputMode, setInputMode] = useState<"existing" | "custom">("existing");
  const [selectedRock, setSelectedRock] = useState<Rock>(EXISTING_ROCKS[0]);
  const [customRock, setCustomRock] = useState<Rock>({ ...EMPTY_ROCK });
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [results, setResults] = useState<LeachateResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [mlModel, setMlModel] = useState<"xgboost" | "lightgbm">("xgboost");

  // Fix: Use the VM IP address so browser can connect from outside localhost
  const API_URL = "http://20.199.20.62:8000/predict";

  const handleAddEvent = () => {
    setEvents((prev) => [
      ...prev,
      {
        id: generateId(), // Fix: Replaced crypto.randomUUID()
        Timestep: prev.length + 1,
        Type_event: "rain",
        Acid: 0,
        Temp: 20,
      },
    ]);
  };

  const updateEvent = (id: string, field: keyof InterventionEvent, value: any) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleRunSimulation = async () => {
    setLoading(true);
    setResults(null);

    const rock = inputMode === "existing" ? selectedRock : customRock;

    const payload = {
      rock,
      events: events.map((e) => ({
        Type_event: e.Type_event,
        Acid: e.Acid,
        Temp: e.Temp,
        Event_quantity: 1,
      })),
    };

    // Construct URL with model query parameter
    const modelParam = mlModel === "xgboost" ? "multioutput" : "lightgbm";
    const fullUrl = `${API_URL}?model=${modelParam}`;

    try {
      const res = await fetch(fullUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        <header className="text-center">
          <h1 className="text-4xl font-bold text-slate-800">GeoChem Leachate Model</h1>
          <p className="text-slate-600 mt-2">
            Multi-target prediction based on rock mineralogy and cumulative weathering
          </p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: ROCK & EVENTS */}
          <div className="lg:col-span-5 space-y-6">
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase">ML Model</label>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => setMlModel("xgboost")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mlModel === "xgboost"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  XGBoost
                </button>
                <button
                  onClick={() => setMlModel("lightgbm")}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mlModel === "lightgbm"
                      ? "bg-slate-800 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  LightGBM
                </button>
              </div>
            </div>

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
                  onChange={(e) =>
                    setSelectedRock(EXISTING_ROCKS.find((r) => r.Rock_number === +e.target.value)!)
                  }
                >
                  {EXISTING_ROCKS.map((r) => (
                    <option key={r.Rock_number} value={r.Rock_number}>
                      Rock #{r.Rock_number} (SiO₂: {r.SiO2_rock}%)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(customRock).map(([key, value]) => {
                    if (key === "Rock_number") return null;
                    return (
                      <div key={key}>
                        <label className="text-xs font-bold text-slate-500">{key}</label>
                        <input
                          type="number"
                          className="w-full border rounded p-1"
                          value={value as number}
                          onChange={(e) =>
                            setCustomRock({ ...customRock, [key]: +e.target.value })
                          }
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Events */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-800">2. Weathering Events</h2>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {events.map((e, idx) => (
                  <div
                    key={e.id}
                    className="relative bg-slate-50 border border-slate-200 p-4 rounded-lg group"
                  >
                    <div className="absolute top-2 right-2 text-xs font-bold text-slate-400">
                      Step {idx + 1}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">Type</label>
                        <select
                          className="w-full border rounded p-1.5 text-sm"
                          value={e.Type_event}
                          onChange={(ev) => updateEvent(e.id, "Type_event", ev.target.value)}
                        >
                          <option value="rain">Rain</option>
                          <option value="snow">Snow</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500 uppercase font-bold">
                          Temp (°C)
                        </label>
                        <input
                          type="number"
                          className="w-full border rounded p-1.5 text-sm"
                          value={e.Temp}
                          onChange={(ev) => updateEvent(e.id, "Temp", +ev.target.value)}
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-500 uppercase font-bold">
                        Acidic
                        <input
                          type="checkbox"
                          checked={e.Acid === 1}
                          onChange={(ev) => updateEvent(e.id, "Acid", ev.target.checked ? 1 : 0)}
                        />
                      </label>

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
                  + Add Event
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

          {/* RIGHT: RESULTS */}
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
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-8">
                        {/* Key Indicators */}
                        <div className="col-span-2 sm:col-span-4 grid grid-cols-4 gap-4 mb-2">
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                            <div className="text-xs text-blue-600 font-bold uppercase">Volume</div>
                            <div className="text-xl font-bold text-slate-700">
                              {r.Volume_leachate.toFixed(2)} ml
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center">
                            <div className="text-xs text-blue-600 font-bold uppercase">pH</div>
                            <div className="text-xl font-bold text-slate-700">
                              {r.Ph_leachate.toFixed(2)}
                            </div>
                          </div>
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                            <div className="text-xs text-amber-600 font-bold uppercase">EC</div>
                            <div className="text-xl font-bold text-slate-700">
                              {r.EC_leachate.toFixed(0)} µS/cm
                            </div>
                          </div>
                          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                            <div className="text-xs text-emerald-600 font-bold uppercase">Sulfate</div>
                            <div className="text-xl font-bold text-slate-700">
                              {r.Sulfate_leachate.toFixed(1)} mg/L
                            </div>
                          </div>
                        </div>

                        {/* Metals & Ions Detail */}
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-1">
                            Metals
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Ca:</span>{" "}
                            <span className="font-mono">{r.Ca_leachate.toFixed(2)} mg/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Mg:</span>{" "}
                            <span className="font-mono">{r.Mg_leachate.toFixed(2)} mg/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Fe:</span>{" "}
                            <span className="font-mono">{r.Fe_leachate.toFixed(2)} µg/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Na:</span>{" "}
                            <span className="font-mono">{r.Na_leachate.toFixed(2)} mg/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">K:</span>{" "}
                            <span className="font-mono">{r.K_leachate.toFixed(2)} mg/L</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Mn:</span>{" "}
                            <span className="font-mono">{r.Mn_leachate.toFixed(3)} µg/L</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-1">
                            Anions
                          </p>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Cl⁻:</span>{" "}
                            <span className="font-mono">{r.Chloride_leachate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">NO₃⁻:</span>{" "}
                            <span className="font-mono">{r.Nitrate_leachate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">PO₄³⁻:</span>{" "}
                            <span className="font-mono">{r.Phosphate_leachate.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">CO₃²⁻:</span>{" "}
                            <span className="font-mono">{r.Carbonate_leachate.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 min-h-[300px]">
                <svg
                  className="w-16 h-16 mb-4 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
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
