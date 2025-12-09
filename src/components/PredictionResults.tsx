import { LeachatePrediction } from '../lib/supabase';
import { Droplet, Info, TrendingUp } from 'lucide-react';
import { useState } from 'react';

interface PredictionResultsProps {
  predictions: LeachatePrediction[];
}

export function PredictionResults({ predictions }: PredictionResultsProps) {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const leachateFields = [
    { key: 'volume_leachate', label: 'Volume', unit: 'mL' },
    { key: 'ec_leachate', label: 'EC', unit: 'dS/m' },
    { key: 'ph_leachate', label: 'pH', unit: '' },
    { key: 'ca_leachate', label: 'Ca', unit: 'mg/L' },
    { key: 'mg_leachate', label: 'Mg', unit: 'mg/L' },
    { key: 'na_leachate', label: 'Na', unit: 'mg/L' },
    { key: 'k_leachate', label: 'K', unit: 'mg/L' },
    { key: 'fe_leachate', label: 'Fe', unit: 'mg/L' },
    { key: 'mn_leachate', label: 'Mn', unit: 'mg/L' },
    { key: 'chloride_leachate', label: 'Cl⁻', unit: 'mg/L' },
    { key: 'carbonate_leachate', label: 'CO₃²⁻', unit: 'mg/L' },
    { key: 'sulfate_leachate', label: 'SO₄²⁻', unit: 'mg/L' },
    { key: 'nitrate_leachate', label: 'NO₃⁻', unit: 'mg/L' },
    { key: 'phosphate_leachate', label: 'PO₄³⁻', unit: 'mg/L' },
  ];

  const getValueColor = (key: string, value: number) => {
    if (key === 'ph_leachate') {
      if (value < 5.5) return 'text-red-600';
      if (value > 8.5) return 'text-orange-600';
      return 'text-green-600';
    }
    if (key === 'ec_leachate') {
      if (value > 4) return 'text-orange-600';
      return 'text-blue-600';
    }
    return 'text-gray-900';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-50 rounded-lg">
          <Droplet className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Leachate Predictions</h2>
          <p className="text-sm text-gray-500">Results for {predictions.length} event(s)</p>
        </div>
      </div>

      <div className="space-y-4">
        {predictions.map((prediction, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <button
              onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              className="w-full p-4 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {prediction.timestep}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Timestep {prediction.timestep}</div>
                  <div className="text-sm text-gray-600">
                    pH: {prediction.ph_leachate.toFixed(2)} • EC: {prediction.ec_leachate.toFixed(2)} dS/m
                  </div>
                </div>
              </div>
              <TrendingUp className={`w-5 h-5 text-purple-600 transition-transform ${
                expandedStep === index ? 'rotate-90' : ''
              }`} />
            </button>

            {expandedStep === index && (
              <div className="p-4 space-y-4">
                {prediction.explanation.length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Explanations</h4>
                        <ul className="space-y-1 text-sm text-blue-800">
                          {prediction.explanation.map((exp, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-blue-400">•</span>
                              <span>{exp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {leachateFields.map(({ key, label, unit }) => (
                    <div
                      key={key}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                    >
                      <div className="text-xs text-gray-500 mb-1">{label}</div>
                      <div className={`text-lg font-semibold ${getValueColor(key, prediction[key as keyof LeachatePrediction] as number)}`}>
                        {typeof prediction[key as keyof LeachatePrediction] === 'number'
                          ? (prediction[key as keyof LeachatePrediction] as number).toFixed(
                              key.includes('fe_') || key.includes('mn_') ? 3 : 2
                            )
                          : '—'}
                      </div>
                      {unit && <div className="text-xs text-gray-500">{unit}</div>}
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Observations</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="bg-green-50 p-2 rounded">
                      <span className="text-gray-600">pH Status: </span>
                      <span className={`font-medium ${
                        prediction.ph_leachate < 5.5 ? 'text-red-600' :
                        prediction.ph_leachate > 8.5 ? 'text-orange-600' :
                        'text-green-600'
                      }`}>
                        {prediction.ph_leachate < 5.5 ? 'Acidic' :
                         prediction.ph_leachate > 8.5 ? 'Alkaline' : 'Neutral'}
                      </span>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <span className="text-gray-600">Salinity: </span>
                      <span className={`font-medium ${
                        prediction.ec_leachate > 4 ? 'text-orange-600' : 'text-blue-600'
                      }`}>
                        {prediction.ec_leachate > 4 ? 'High' : 'Normal'}
                      </span>
                    </div>
                    <div className="bg-purple-50 p-2 rounded">
                      <span className="text-gray-600">Volume: </span>
                      <span className="font-medium text-purple-600">
                        {prediction.volume_leachate.toFixed(1)} mL
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {predictions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No predictions yet. Add events and run prediction to see results.
        </div>
      )}
    </div>
  );
}
