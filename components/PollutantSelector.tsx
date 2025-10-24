'use client';

interface PollutantSelectorProps {
  selected: 'no2' | 'pm25' | 'o3';
  onChange: (type: 'no2' | 'pm25' | 'o3') => void;
}

const pollutants = [
  { id: 'no2', label: 'NO₂', name: 'Nitrogen Dioxide' },
  { id: 'pm25', label: 'PM2.5', name: 'Fine Particles' },
  { id: 'o3', label: 'O₃', name: 'Ozone' },
] as const;

export default function PollutantSelector({
  selected,
  onChange,
}: PollutantSelectorProps) {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
      <p className="text-xs text-gray-500 mb-2 font-semibold">Select Pollutant</p>
      <div className="flex space-x-2">
        {pollutants.map((pollutant) => (
          <button
            key={pollutant.id}
            onClick={() => onChange(pollutant.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              selected === pollutant.id
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={pollutant.name}
          >
            {pollutant.label}
          </button>
        ))}
      </div>
    </div>
  );
}
