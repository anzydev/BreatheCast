'use client';

const legendItems = [
  { color: '#00e400', label: 'Good', range: '0-40' },
  { color: '#ffff00', label: 'Moderate', range: '40-80' },
  { color: '#ff7e00', label: 'Unhealthy for Sensitive', range: '80-120' },
  { color: '#ff0000', label: 'Unhealthy', range: '120-160' },
  { color: '#8f3f97', label: 'Very Unhealthy', range: '160-200' },
  { color: '#7e0023', label: 'Hazardous', range: '200+' },
];

export default function Legend() {
  return (
    <div className="absolute bottom-24 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
      <h3 className="font-semibold text-sm text-gray-800 mb-2">Air Quality Index</h3>
      <div className="space-y-1">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center text-xs">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700 flex-1">{item.label}</span>
            <span className="text-gray-500">{item.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
