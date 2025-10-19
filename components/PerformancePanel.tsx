import React from 'react';
import type { OhlcvData } from '../types';

interface PerformancePanelProps {
  data: OhlcvData[];
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">{title}</h3>
    {children}
  </div>
);

const PerformanceBar: React.FC<{ value: number | null }> = ({ value }) => {
  if (value === null) {
    return <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"></div>;
  }

  const isPositive = value >= 0;
  // Scale the bar width. Cap at 50% return for 100% bar width for visual balance.
  const barWidth = Math.min(100, Math.abs(value) * 2); 

  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div
        className={`${isPositive ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`}
        style={{ width: `${barWidth}%` }}
      ></div>
    </div>
  );
};


const PerformancePanel: React.FC<PerformancePanelProps> = ({ data }) => {
  if (data.length < 2) {
    return <Card title="Performance"><p className="text-sm text-gray-500">Not enough data to calculate performance.</p></Card>;
  }

  const calculateReturn = (periods: number) => {
    if (data.length <= periods) return null;
    const currentPrice = data[data.length - 1].close;
    const pastPrice = data[data.length - 1 - periods].close;
    if (pastPrice === 0) return null;
    const pctChange = ((currentPrice - pastPrice) / pastPrice) * 100;
    return pctChange;
  };

  const timeHorizons = [
    { label: '1D', periods: 1 },
    { label: '5D', periods: 5 },
    { label: '1M', periods: 30 },
    { label: '3M', periods: 90 },
    { label: '6M', periods: 180 },
    { label: '1Y', periods: 365 },
  ];

  return (
    <Card title="Performance">
      <div className="space-y-4">
        {timeHorizons.map(({ label, periods }) => {
          const returnValue = calculateReturn(periods);
          const isPositive = returnValue !== null && returnValue >= 0;
          
          return (
            <div key={label} className="grid grid-cols-5 items-center gap-3 text-sm">
              <span className="col-span-1 text-gray-600 dark:text-gray-400 font-semibold">{label}</span>
              <div className="col-span-3">
                <PerformanceBar value={returnValue} />
              </div>
              {returnValue !== null ? (
                <span className={`col-span-1 font-semibold text-right ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {isPositive ? '+' : ''}{returnValue.toFixed(2)}%
                </span>
              ) : (
                <span className="col-span-1 text-gray-500 text-right">N/A</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default PerformancePanel;