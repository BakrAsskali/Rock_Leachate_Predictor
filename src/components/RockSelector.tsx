import { useEffect, useState } from 'react';
import { supabase, Rock } from '../lib/supabase';
import { ChevronDown, Plus, FlaskConical } from 'lucide-react';

interface RockSelectorProps {
  onRockSelect: (rock: Partial<Rock>) => void;
  selectedRock: Partial<Rock> | null;
}

export function RockSelector({ onRockSelect, selectedRock }: RockSelectorProps) {
  const [rocks, setRocks] = useState<Rock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customRock, setCustomRock] = useState<Partial<Rock>>({
    rock_number: '',
    name: '',
    ec_rock: 0,
    ph_rock: 7,
    corg_rock: 0,
    ca_rock: 0,
    k_rock: 0,
    mg_rock: 0,
    na_rock: 0,
    sar_rock: 0,
    sio2_rock: 0,
    al2o3_rock: 0,
    fe2o3_rock: 0,
    tio2_rock: 0,
    mno_rock: 0,
    cao_rock: 0,
    mgo_rock: 0,
    na2o_rock: 0,
    k2o_rock: 0,
    so3_rock: 0,
    p2o5_rock: 0,
  });

  useEffect(() => {
    loadRocks();
  }, []);

  async function loadRocks() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('rocks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRocks(data);
    }
    setIsLoading(false);
  }

  const handleRockChange = (field: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setCustomRock(prev => ({
      ...prev,
      [field]: field === 'rock_number' || field === 'name' ? value : numValue
    }));
  };

  const handleSelectRock = (rock: Rock) => {
    onRockSelect(rock);
    setShowCustomForm(false);
  };

  const handleSubmitCustomRock = () => {
    if (customRock.rock_number && customRock.name) {
      onRockSelect(customRock);
    }
  };

  const rockFields = [
    { key: 'ec_rock', label: 'EC Rock', unit: 'dS/m' },
    { key: 'ph_rock', label: 'pH Rock', unit: '' },
    { key: 'corg_rock', label: 'C-org Rock', unit: '%' },
    { key: 'ca_rock', label: 'Ca Rock', unit: 'mg/kg' },
    { key: 'k_rock', label: 'K Rock', unit: 'mg/kg' },
    { key: 'mg_rock', label: 'Mg Rock', unit: 'mg/kg' },
    { key: 'na_rock', label: 'Na Rock', unit: 'mg/kg' },
    { key: 'sar_rock', label: 'SAR Rock', unit: '' },
    { key: 'sio2_rock', label: 'SiO₂ Rock', unit: '%' },
    { key: 'al2o3_rock', label: 'Al₂O₃ Rock', unit: '%' },
    { key: 'fe2o3_rock', label: 'Fe₂O₃ Rock', unit: '%' },
    { key: 'tio2_rock', label: 'TiO₂ Rock', unit: '%' },
    { key: 'mno_rock', label: 'MnO Rock', unit: '%' },
    { key: 'cao_rock', label: 'CaO Rock', unit: '%' },
    { key: 'mgo_rock', label: 'MgO Rock', unit: '%' },
    { key: 'na2o_rock', label: 'Na₂O Rock', unit: '%' },
    { key: 'k2o_rock', label: 'K₂O Rock', unit: '%' },
    { key: 'so3_rock', label: 'SO₃ Rock', unit: '%' },
    { key: 'p2o5_rock', label: 'P₂O₅ Rock', unit: '%' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <FlaskConical className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Rock Characteristics</h2>
          <p className="text-sm text-gray-500">Select an existing rock or input custom values</p>
        </div>
      </div>

      {!showCustomForm ? (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading rocks...</div>
          ) : (
            <>
              <div className="grid gap-3">
                {rocks.map((rock) => (
                  <button
                    key={rock.id}
                    onClick={() => handleSelectRock(rock)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedRock?.id === rock.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{rock.name}</div>
                        <div className="text-sm text-gray-500">
                          {rock.rock_number} • pH {rock.ph_rock} • EC {rock.ec_rock} dS/m
                        </div>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${
                        selectedRock?.id === rock.id ? 'rotate-180' : ''
                      }`} />
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowCustomForm(true)}
                className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Input Custom Rock Characteristics
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rock Number *
              </label>
              <input
                type="text"
                value={customRock.rock_number}
                onChange={(e) => handleRockChange('rock_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., R004"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rock Name *
              </label>
              <input
                type="text"
                value={customRock.name}
                onChange={(e) => handleRockChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., My Sample"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-1">
            {rockFields.map(({ key, label, unit }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {label} {unit && <span className="text-gray-500">({unit})</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customRock[key as keyof Rock] || 0}
                  onChange={(e) => handleRockChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleSubmitCustomRock}
              disabled={!customRock.rock_number || !customRock.name}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Use Custom Rock
            </button>
            <button
              onClick={() => setShowCustomForm(false)}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
