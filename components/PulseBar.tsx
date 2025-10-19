import React from 'react';
import type { IndicatorSignal } from '../lib/technicalAnalysis';

interface PulseBarProps {
  signals: IndicatorSignal[];
  gaugeValue: number;
}

const SignalBlock: React.FC<{ signal: IndicatorSignal }> = ({ signal }) => {
  const getColor = () => {
    switch (signal.signal) {
      case 'Buy': return 'bg-green-500';
      case 'Sell': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative group flex-1 h-2">
      <div className={`w-full h-full rounded-full transition-colors ${getColor()}`}></div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        {signal.name} is <span className="font-bold">{signal.signal}</span>
      </div>
    </div>
  );
};

const PulseBar: React.FC<PulseBarProps> = ({ signals, gaugeValue }) => {
  // Map gauge value from [-100, 100] to [2%, 98%] for positioning
  const positionPercent = (gaugeValue + 100) / 2;

  const movingAverages = signals.filter(s => s.type === 'Moving Average');
  const oscillators = signals.filter(s => s.type === 'Oscillator');

  return (
    <div className="space-y-3">
      <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
         <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full opacity-30"></div>
        {/* Pulse Indicator */}
        <div 
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white shadow-lg border-2 border-indigo-400 animate-pulse transition-all duration-500 ease-out"
            style={{ left: `${positionPercent}%`, transform: `translate(-${positionPercent}%, -50%)` }}
        ></div>
      </div>
      
      <div className="space-y-2">
        <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Moving Averages</p>
            <div className="flex gap-1">
                {movingAverages.map((s, i) => <SignalBlock key={`ma-${i}`} signal={s} />)}
            </div>
        </div>
         <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Oscillators</p>
            <div className="flex gap-1">
                {oscillators.map((s, i) => <SignalBlock key={`osc-${i}`} signal={s} />)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PulseBar;