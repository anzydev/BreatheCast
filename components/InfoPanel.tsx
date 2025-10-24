'use client';

interface InfoPanelProps {
  riskLevel: 'low' | 'medium' | 'high';
  predictedRisk?: 'low' | 'medium' | 'high';
  predictionConfidence?: number;
  recommendations: string[];
  locationName?: string;
  pollutantValue?: number;
  pollutantType: 'no2' | 'pm25' | 'o3';
}

const riskConfig = {
  low: {
    color: 'bg-green-100 border-green-500 text-green-800',
    icon: '✓',
    title: 'Low Risk',
  },
  medium: {
    color: 'bg-yellow-100 border-yellow-500 text-yellow-800',
    icon: '⚠',
    title: 'Medium Risk',
  },
  high: {
    color: 'bg-red-100 border-red-500 text-red-800',
    icon: '⚠',
    title: 'High Risk',
  },
};

export default function InfoPanel({
  riskLevel,
  predictedRisk,
  predictionConfidence,
  recommendations,
  locationName,
  pollutantValue,
  pollutantType,
}: InfoPanelProps) {
  const config = riskConfig[riskLevel];
  const predictedConfig = predictedRisk ? riskConfig[predictedRisk] : null;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000] w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className={`${config.color} border-l-4 p-3 mb-4 rounded`}>
        <div className="flex items-center">
          <span className="text-2xl mr-2">{config.icon}</span>
          <div>
            <h3 className="font-bold">{config.title}</h3>
            {locationName && (
              <p className="text-sm opacity-80">{locationName}</p>
            )}
          </div>
        </div>
      </div>

      {pollutantValue !== undefined && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">Current Level</p>
          <p className="text-2xl font-bold text-gray-800">
            {pollutantValue}
            <span className="text-sm font-normal text-gray-500 ml-1">μg/m³</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {pollutantType === 'no2' && 'Nitrogen Dioxide'}
            {pollutantType === 'pm25' && 'Fine Particulate Matter'}
            {pollutantType === 'o3' && 'Ozone'}
          </p>
        </div>
      )}

      {predictedConfig && predictionConfidence && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-blue-800">AI Prediction</p>
            <span className="text-xs text-blue-600">
              {Math.round(predictionConfidence * 100)}% confidence
            </span>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded text-sm font-semibold ${
              predictedRisk === 'low' ? 'bg-green-200 text-green-800' :
              predictedRisk === 'medium' ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
            }`}>
              {predictedConfig.title}
            </span>
            <span className="ml-2 text-xs text-gray-600">predicted next</span>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Recommendations</h4>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start text-sm text-gray-700">
              <span className="mr-2 mt-0.5">•</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Based on your health profile and current pollution levels
        </p>
      </div>
    </div>
  );
}
