import React, { useState, useEffect } from 'react';
import type { OhlcvData, Interval } from '../types';
import { getTechnicalAnalysis, AnalysisResult } from '../lib/technicalAnalysis';
import { INTERVALS } from '../constants';
import PulseBar from './PulseBar';

interface MarketPulseProps {
  data: OhlcvData[];
  selectedInterval: Interval;
  setSelectedInterval: (interval: Interval) => void;
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">{title}</h3>
    {children}
  </div>
);

const MarketPulse: React.FC<MarketPulseProps> = ({ data, selectedInterval, setSelectedInterval }) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  
  const summaryIntervals = INTERVALS.filter(i => i.id !== '1m');

  useEffect(() => {
    if (data.length > 50) {
      const result = getTechnicalAnalysis(data);
      setAnalysis(result);
    } else {
      setAnalysis(null);
    }
  }, [data]);

  const getSignalColor = (signal: AnalysisResult['signal']) => {
    if (signal.includes('Buy')) return 'text-green-400';
    if (signal.includes('Sell')) return 'text-red-400';
    return 'text-gray-400';
  };

  if (!analysis) {
    return (
      <Card title="AI Market Pulse">
        <p className="text-sm text-gray-500">Awaiting sufficient data for analysis...</p>
      </Card>
    );
  }

  return (
    <Card title="AI Market Pulse">
      <div className="space-y-4">
        {/* Timeframe Toggles */}
        <div role="group" aria-label="Summary Timeframes" className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
          {summaryIntervals.map((interval) => (
            <button
              key={interval.id}
              onClick={() => setSelectedInterval(interval)}
              aria-pressed={selectedInterval.id === interval.id}
              className={`flex-1 px-2 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 ${
                selectedInterval.id === interval.id
                  ? 'bg-white dark:bg-gray-900 text-indigo-400 shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {interval.id}
            </button>
          ))}
        </div>

        {/* Main Readout */}
        <div className="text-center py-2">
            <h4 className={`text-2xl font-bold ${getSignalColor(analysis.signal)}`}>{analysis.signal}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {analysis.buyCount} of {analysis.totalSignals} indicators suggest a Buy signal.
            </p>
        </div>

        {/* Pulse Bar */}
        <PulseBar signals={analysis.indicatorSignals} gaugeValue={analysis.gaugeValue} />

        {/* AI Summary */}
        <div>
          <h4 className="font-semibold text-sm mb-1 text-gray-700 dark:text-gray-300">AI Insight</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {analysis.aiSummary}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default MarketPulse;