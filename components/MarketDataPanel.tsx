
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
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md">
      <div className="flex flex-col space-y-3">
        {/* Price and Change */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h2 className={`text-2xl sm:text-3xl font-bold transition-colors duration-200 ${liveColorClass}`}>
            {livePrice.toLocaleString('en-US', { style: 'currency', currency: pair.quote })}
          </h2>
          <div className={`px-2 sm:px-3 py-1 rounded-md text-white text-sm sm:text-lg font-semibold ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}>
            {isPositive ? '▲' : '▼'} {change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </div>
        </div>
        
        {/* OHLC and Volume */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          <div><span className="font-semibold">O:</span> {latestData.open.toFixed(2)}</div>
          <div><span className="font-semibold">H:</span> {latestData.high.toFixed(2)}</div>
          <div><span className="font-semibold">L:</span> {latestData.low.toFixed(2)}</div>
          <div><span className="font-semibold">C:</span> {latestData.close.toFixed(2)}</div>
          <div className="col-span-3 sm:col-span-1"><span className="font-semibold">Vol:</span> {latestData.volume.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPanel;
