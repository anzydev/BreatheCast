'use client';

import { format } from 'date-fns';

interface TimelineSliderProps {
  timestamps: string[];
  currentIndex: number;
  onChange: (index: number) => void;
}

export default function TimelineSlider({
  timestamps,
  currentIndex,
  onChange,
}: TimelineSliderProps) {
  const getTimeLabel = (index: number) => {
    const now = new Date();
    const timestamp = new Date(timestamps[index]);
    
    if (timestamp < now) return 'Past';
    if (index === Math.floor(timestamps.length / 2)) return 'Current';
    return 'Predicted';
  };

  return (
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 z-[1000] w-11/12 max-w-4xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-600">
          {getTimeLabel(currentIndex)}
        </span>
        <span className="text-sm text-gray-500">
          {format(new Date(timestamps[currentIndex]), 'MMM dd, HH:mm')}
        </span>
      </div>
      <input
        type="range"
        min="0"
        max={timestamps.length - 1}
        value={currentIndex}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
            (currentIndex / (timestamps.length - 1)) * 100
          }%, #e5e7eb ${(currentIndex / (timestamps.length - 1)) * 100}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between mt-2 text-xs text-gray-400">
        <span>Past</span>
        <span>Current</span>
        <span>Predicted</span>
      </div>
    </div>
  );
}
