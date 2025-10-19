import React, { useState } from 'react';
import type { Pair, Interval } from '../types';
import { PAIRS, INTERVALS } from '../constants';
import { CryptoIcon } from './shared/CryptoIcon';
import { IndicatorIcon, SunIcon, MoonIcon } from './shared/Icons';

interface HeaderProps {
  selectedPair: Pair;
  setSelectedPair: (pair: Pair) => void;
  selectedInterval: Interval;
  setSelectedInterval: (interval: Interval) => void;
  onIndicatorsClick: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  selectedPair, setSelectedPair, 
  selectedInterval, setSelectedInterval, 
  onIndicatorsClick,
  theme, onToggleTheme,
}) => {
  const [isPairOpen, setIsPairOpen] = useState(false);

  const handlePairSelect = (pair: Pair) => {
    setSelectedPair(pair);
    setIsPairOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 p-4 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Crypto Insight AI</h1>
      </div>
      <div className="flex items-center space-x-2">
        {/* Pair Selector */}
        <div className="relative">
          <button onClick={() => setIsPairOpen(!isPairOpen)} className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <CryptoIcon symbol={selectedPair.base} />
            <span>{selectedPair.id}</span>
            <svg className={`w-4 h-4 transition-transform ${isPairOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          {isPairOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
              {PAIRS.map((pair) => (
                <a key={pair.id} href="#" onClick={(e) => { e.preventDefault(); handlePairSelect(pair); }} className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <CryptoIcon symbol={pair.base} />
                  <span>{pair.name} ({pair.id})</span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Interval Selector */}
        <div role="group" aria-label="Chart Intervals" className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            {INTERVALS.map((interval) => (
                <button
                key={interval.id}
                onClick={() => setSelectedInterval(interval)}
                aria-pressed={selectedInterval.id === interval.id}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-700 focus:ring-indigo-500 ${
                    selectedInterval.id === interval.id
                    ? 'bg-white dark:bg-gray-800 text-indigo-500 shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                >
                {interval.id}
                </button>
            ))}
        </div>
        
        {/* Indicators Button */}
        <button 
            onClick={onIndicatorsClick}
            className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
            <IndicatorIcon className="w-4 h-4"/>
            <span>Indicators</span>
        </button>
        
        {/* Theme Toggle Button */}
        <button 
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
            {theme === 'light' ? <MoonIcon className="w-4 h-4"/> : <SunIcon className="w-4 h-4"/>}
        </button>
      </div>
    </header>
  );
};

export default Header;