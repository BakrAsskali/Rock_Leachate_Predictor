import { useState } from 'react';

// --- TYPES ---
interface Rock {
  Rock_number: number;
  EC_rock: number;
  Ph_rock: number;
  Corg_rock: string; // Product name
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
  Type_event: 'rain' | 'snow';
  Acid: number; // 1 for yes, 0 for no
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

// --- MOCK DATA ---
const EXISTING_ROCKS: Rock[] = [
  {
    Rock_number: 1, EC_rock: 150, Ph_rock: 7.2, Corg_rock: "Granite A",
    Ca_rock: 12, K_rock: 4, Mg_rock: 3, Na_rock: 2, SAR_rock: 1.5,
    SiO2_rock: 72.0, Al2O3_rock: 14.4, Fe2O3_rock: 1.2, TiO2_rock: 0.3, MnO_rock: 0.05,
    CaO_rock: 1.8, MgO_rock: 0.7, Na2O_rock: 3.5, K2O_rock: 4.1, SO3_rock: 0.1, P2O5_rock: 0.1
  },
  {
    Rock_number: 2, EC_rock: 400, Ph_rock: 8.5, Corg_rock: "Limestone B",
    Ca_rock: 80, K_rock: 1, Mg_rock: 15, Na_rock: 1, SAR_rock: 0.5,
    SiO2_rock: 5.0, Al2O3_rock: 1.0, Fe2O3_rock: 0.5, TiO2_rock: 0.1, MnO_rock: 0.02,
    CaO_rock: 48.0, MgO_rock: 3.0, Na2O_rock: 0.1, K2O_rock: 0.2, SO3_rock: 0.8, P2O5_rock: 0.4
  },
  {
    Rock_number: 3, EC_rock: 90, Ph_rock: 6.5, Corg_rock: "Sandstone C",
    Ca_rock: 5, K_rock: 2, Mg_rock: 2, Na_rock: 1, SAR_rock: 2.1,
    SiO2_rock: 85.0, Al2O3_rock: 6.0, Fe2O3_rock: 2.2, TiO2_rock: 0.6, MnO_rock: 0.01,
    CaO_rock: 0.5, MgO_rock: 0.4, Na2O_rock: 0.8, K2O_rock: 1.5, SO3_rock: 0.0, P2O5_rock: 0.1
  }
];

const EMPTY_ROCK: Rock = {
  Rock_number: 99, EC_rock: 0, Ph_rock: 7.0, Corg_rock: "Custom Rock",
  Ca_rock: 0, K_rock: 0, Mg_rock: 0, Na_rock: 0, SAR_rock: 0,
  SiO2_rock: 0, Al2O3_rock: 0, Fe2O3_rock: 0, TiO2_rock: 0, MnO_rock: 0,
  CaO_rock: 0, MgO_rock: 0, Na2O_rock: 0, K2O_rock: 0, SO3_rock: 0, P2O5_rock: 0
};

// --- SIMULATION LOGIC ---
const simulateLeaching = (rock: Rock, events: InterventionEvent[]): LeachateResult[] => {
  let currentPh = rock.Ph_rock;

  return events.map((evt) => {
    const isAcid = evt.Acid === 1;
    const isHighTemp = evt.Temp > 25;
    const volume = evt.Type_event === 'rain' ? 250 : 120;

    // pH Shift Logic
    const acidImpact = isAcid ? -1.5 : -0.1;
    const bufferCapacity = rock.CaO_rock > 10 ? 1.0 : 0.2;
    currentPh = Math.max(3, Math.min(10, currentPh + acidImpact + bufferCapacity));

    // Leaching Logic
    const solubilityFactor = (isAcid ? 1.5 : 1.0) * (isHighTemp ? 1.2 : 1.0);

    // Output calculations
    const ca_conc = (rock.CaO_rock * 2.5 * solubilityFactor).toFixed(2);
    const mg_conc = (rock.MgO_rock * 1.8 * solubilityFactor).toFixed(2);
    const fe_conc = (rock.Fe2O3_rock * 100 * (isAcid ? 2 : 0.5)).toFixed(2);

    let explanation = `Timestep ${evt.Timestep}: `;
    if (isAcid) explanation += "Acidic conditions accelerated mineral dissolution. ";
    if (rock.CaO_rock > 20) explanation += "High Calcium release due to carbonate weathering. ";
    else if (rock.SiO2_rock > 60) explanation += "Silicate dominant rock shows resistance to weathering. ";

    return {
      timestep: evt.Timestep,
      Volume_leachate: volume,
      EC_leachate: parseFloat((rock.EC_rock * 0.8 * solubilityFactor).toFixed(1)),
      Ph_leachate: parseFloat(currentPh.toFixed(2)),
      Chloride_leachate: 15 + Math.random() * 5,
      Carbonate_leachate: rock.CaO_rock > 10 ? 120 : 15,
      Sulfate_leachate: rock.SO3_rock * 50 * solubilityFactor,
      Nitrate_leachate: 2.5,
      Phosphate_leachate: rock.P2O5_rock * 10,
      Ca_leachate: parseFloat(ca_conc),
      Fe_leachate: parseFloat(fe_conc),
      K_leachate: rock.K2O_rock * 5,
      Mg_leachate: parseFloat(mg_conc),
      Mn_leachate: rock.MnO_rock * 100 * (isAcid ? 1.5 : 0.1),
      Na_leachate: rock.Na2O_rock * 8,
      Explanation: explanation
    };
  });
};

function App() {
  const [inputMode, setInputMode] = useState<'existing' | 'custom'>('existing');
  const [selectedRock, setSelectedRock] = useState<Rock>(EXISTING_ROCKS[0]);
  const [customRock, setCustomRock] = useState<Rock>(EMPTY_ROCK);
  const [events, setEvents] = useState<InterventionEvent[]>([]);
  const [results, setResults] = useState<LeachateResult[] | null>(null);

  const handleCustomChange = (field: keyof Rock, value: string | number) => {
    setCustomRock(prev => ({
      ...prev,
      [field]: typeof prev[field] === 'number' ? parseFloat(value.toString()) || 0 : value
    }));
  };

  const handleAddEvent = () => {
    const nextTimestep = events.length + 1;
    setEvents([
      ...events,
      {
        id: Math.random().toString(36).substr(2, 9),
        Timestep: nextTimestep,
        Type_event: 'rain',
        Acid: 0,
        Temp: 20
      }
    ]);
  };

  const updateEvent = (id: string, field: keyof InterventionEvent, value: any) => {
    setEvents(events.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const handleRunSimulation = () => {
    const rockToSimulate = inputMode === 'existing' ? selectedRock : customRock;
    const simulationResults = simulateLeaching(rockToSimulate, events);
    setResults(simulationResults);
  };

  return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              GeoChem Leachate Predictor
            </h1>
            <p className="text-slate-600">Simulate rock weathering and leachate composition.</p>
          </header>

          <div className="grid lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-5 space-y-6">

              {/* 1. Rock Characteristics */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-semibold text-lg">1. Rock Input</h2>
                  <div className="flex bg-white rounded-lg p-1 border border-slate-300">
                    <button
                        onClick={() => setInputMode('existing')}
                        className={`px-3 py-1 text-xs font-medium rounded ${inputMode === 'existing' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                    >
                      Pre-loaded
                    </button>
                    <button
                        onClick={() => setInputMode('custom')}
                        className={`px-3 py-1 text-xs font-medium rounded ${inputMode === 'custom' ? 'bg-slate-800 text-white' : 'text-slate-600'}`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {inputMode === 'existing' ? (
                      // Existing Selection Mode
                      <>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Rock Sample</label>
                        <select
                            className="w-full p-2 border border-slate-300 rounded-md mb-4 bg-white"
                            onChange={(e) => {
                              const rock = EXISTING_ROCKS.find(r => r.Rock_number === parseInt(e.target.value));
                              if(rock) setSelectedRock(rock);
                            }}
                            value={selectedRock.Rock_number}
                        >
                          {EXISTING_ROCKS.map(r => (
                              <option key={r.Rock_number} value={r.Rock_number}>
                                {r.Corg_rock} (ID: {r.Rock_number})
                              </option>
                          ))}
                        </select>
                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded border border-slate-200">
                          SiO2: {selectedRock.SiO2_rock}% | CaO: {selectedRock.CaO_rock}% | pH: {selectedRock.Ph_rock}
                        </div>
                      </>
                  ) : (
                      // Custom Input Mode
                      <div className="space-y-4 h-96 overflow-y-auto pr-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700">Product Name</label>
                          <input
                              type="text"
                              value={customRock.Corg_rock}
                              onChange={(e) => handleCustomChange('Corg_rock', e.target.value)}
                              className="w-full border border-slate-300 rounded p-1 text-sm"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <InputNumber label="pH Value" val={customRock.Ph_rock} field="Ph_rock" onChange={handleCustomChange} />
                          <InputNumber label="EC (µS/cm)" val={customRock.EC_rock} field="EC_rock" onChange={handleCustomChange} />
                        </div>

                        <div className="border-t pt-2">
                          <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Composition (%)</h3>
                          <div className="grid grid-cols-3 gap-2">
                            <InputNumber label="SiO2" val={customRock.SiO2_rock} field="SiO2_rock" onChange={handleCustomChange} />
                            <InputNumber label="CaO" val={customRock.CaO_rock} field="CaO_rock" onChange={handleCustomChange} />
                            <InputNumber label="MgO" val={customRock.MgO_rock} field="MgO_rock" onChange={handleCustomChange} />
                            <InputNumber label="Fe2O3" val={customRock.Fe2O3_rock} field="Fe2O3_rock" onChange={handleCustomChange} />
                            <InputNumber label="Al2O3" val={customRock.Al2O3_rock} field="Al2O3_rock" onChange={handleCustomChange} />
                            <InputNumber label="Na2O" val={customRock.Na2O_rock} field="Na2O_rock" onChange={handleCustomChange} />
                            <InputNumber label="K2O" val={customRock.K2O_rock} field="K2O_rock" onChange={handleCustomChange} />
                            <InputNumber label="SO3" val={customRock.SO3_rock} field="SO3_rock" onChange={handleCustomChange} />
                            <InputNumber label="P2O5" val={customRock.P2O5_rock} field="P2O5_rock" onChange={handleCustomChange} />
                            <InputNumber label={"Ca" } val={customRock.Ca_rock} field="Ca_rock" onChange={handleCustomChange} />
                            <InputNumber label={"Mg" } val={customRock.Mg_rock} field="Mg_rock" onChange={handleCustomChange} />
                            <InputNumber label={"K" } val={customRock.K_rock} field="K_rock" onChange={handleCustomChange} />
                            <InputNumber label={"Na" } val={customRock.Na_rock} field="Na_rock" onChange={handleCustomChange} />
                            <InputNumber label={"SAR" } val={customRock.SAR_rock} field="SAR_rock" onChange={handleCustomChange} />
                            <InputNumber label={"MnO" } val={customRock.MnO_rock} field="MnO_rock" onChange={handleCustomChange} />
                          </div>
                        </div>
                      </div>
                  )}
                </div>
              </section>

              {/* 2. Event Sequence */}
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-semibold text-lg">2. Events (S)</h2>
                  <button
                      onClick={handleAddEvent}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium"
                  >
                    + Add
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  {events.length === 0 && <p className="text-center text-slate-400 italic">No events added.</p>}

                  {events.map((evt, index) => (
                      <div key={evt.id} className="relative border border-slate-200 rounded-lg p-4 bg-slate-50">
                        <div className="absolute top-2 right-2 text-xs font-mono text-slate-400">T{index + 1}</div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                            <select
                                value={evt.Type_event}
                                onChange={(e) => updateEvent(evt.id, 'Type_event', e.target.value)}
                                className="w-full text-sm border-slate-300 rounded"
                            >
                              <option value="rain">Rain</option>
                              <option value="snow">Snow</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Temp (°C)</label>
                            <input
                                type="number"
                                value={evt.Temp}
                                onChange={(e) => updateEvent(evt.id, 'Temp', parseFloat(e.target.value))}
                                className="w-full text-sm border-slate-300 rounded p-1"
                            />
                          </div>
                          <div className="col-span-2 flex items-center justify-between">
                            <label className="flex items-center gap-2 text-sm text-slate-700">
                              <input
                                  type="checkbox"
                                  checked={evt.Acid === 1}
                                  onChange={(e) => updateEvent(evt.id, 'Acid', e.target.checked ? 1 : 0)}
                                  className="rounded text-blue-600"
                              />
                              Acidic?
                            </label>
                            <button onClick={() => removeEvent(evt.id)} className="text-red-500 text-sm font-semibold">Remove</button>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                  <button
                      onClick={handleRunSimulation}
                      disabled={events.length === 0}
                      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-3 rounded-lg font-semibold"
                  >
                    Run Predictions
                  </button>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: OUTPUTS */}
            <div className="lg:col-span-7">
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 h-full min-h-[500px]">
                <div className="bg-slate-100 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-lg">Results</h2>
                </div>
                <div className="p-6">
                  {!results ? (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <p>Add events and run simulation.</p>
                      </div>
                  ) : (
                      <div className="space-y-6">
                        {results.map((res, idx) => (
                            <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between">
                                <span className="font-bold text-slate-700">Timestep {res.timestep}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">pH: {res.Ph_leachate}</span>
                              </div>
                              <div className="p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <ResultItem label="Volume" value={`${res.Volume_leachate} ml`} />
                                  <ResultItem label="EC" value={`${res.EC_leachate} µS/cm`} />
                                  <ResultItem label="Calcium" value={`${res.Ca_leachate} mg/l`} />
                                  <ResultItem label="Magnesium" value={`${res.Mg_leachate} mg/l`} />
                                  <ResultItem label="Sulfate" value={`${res.Sulfate_leachate.toFixed(1)} mg/l`} />
                                  <ResultItem label="Iron" value={`${res.Fe_leachate} µg/L`} />
                                </div>
                                <div className="bg-yellow-50 border border-yellow-100 rounded p-3 text-sm text-yellow-800">
                                  <strong>Explanation:</strong> {res.Explanation}
                                </div>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>
      </div>
  );
}

// Helper components
const InputNumber = ({ label, val, field, onChange }: { label: string, val: number, field: keyof Rock, onChange: any }) => (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
          type="number"
          value={val}
          onChange={(e) => onChange(field, e.target.value)}
          className="w-full border border-slate-300 rounded p-1 text-sm focus:border-blue-500 outline-none"
      />
    </div>
);

const ResultItem = ({ label, value }: { label: string, value: string }) => (
    <div>
      <div className="text-xs text-slate-500 uppercase tracking-wide">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
);

export default App;