
import React from 'react';
import type { OhlcvData, Trade, Pair } from '../types';

interface MarketDataPanelProps {
  latestData: OhlcvData | null;
  liveTrade: Trade | null;
  pair: Pair;
}

const MarketDataPanel: React.FC<MarketDataPanelProps> = ({ latestData, liveTrade, pair }) => {
  if (!latestData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md animate-pulse">
        <p>Loading market data...</p>
      </div>
    );
  }

  const change = latestData.close - latestData.open;
  const changePercent = (change / latestData.open) * 100;
  const isPositive = change >= 0;

  const livePrice = liveTrade?.price ?? latestData.close;
  const liveColorClass = liveTrade?.side === 'buy' ? 'text-green-500' : 'text-red-500';
  
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <h2 className={`text-3xl font-bold transition-colors duration-200 ${liveColorClass}`}>{livePrice.toLocaleString('en-US', { style: 'currency', currency: pair.quote })}</h2>
          <div className={`px-3 py-1 rounded-md text-white text-lg font-semibold ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
            {isPositive ? '▲' : '▼'} {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div><span className="font-semibold">O:</span> {latestData.open.toFixed(2)}</div>
          <div><span className="font-semibold">H:</span> {latestData.high.toFixed(2)}</div>
          <div><span className="font-semibold">L:</span> {latestData.low.toFixed(2)}</div>
          <div><span className="font-semibold">C:</span> {latestData.close.toFixed(2)}</div>
          <div className="col-span-2"><span className="font-semibold">Vol ({pair.base}):</span> {latestData.volume.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPanel;
