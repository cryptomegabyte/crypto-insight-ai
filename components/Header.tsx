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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePairSelect = (pair: Pair) => {
    setSelectedPair(pair);
    setIsPairOpen(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 p-3 sm:p-4 shadow-md">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
          <h1 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white">Crypto Insight AI</h1>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Desktop Controls */}
        <div className="hidden lg:flex items-center space-x-2">
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
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-3">
          {/* Pair Selector Mobile */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Trading Pair</label>
            <div className="relative">
              <button onClick={() => setIsPairOpen(!isPairOpen)} className="w-full flex items-center justify-between space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <div className="flex items-center space-x-2">
                  <CryptoIcon symbol={selectedPair.base} />
                  <span className="text-sm">{selectedPair.id}</span>
                </div>
                <svg className={`w-4 h-4 transition-transform ${isPairOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </button>
              {isPairOpen && (
                <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-gray-700 rounded-md shadow-lg z-20">
                  {PAIRS.map((pair) => (
                    <a key={pair.id} href="#" onClick={(e) => { e.preventDefault(); handlePairSelect(pair); }} className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">
                      <CryptoIcon symbol={pair.base} />
                      <span>{pair.name} ({pair.id})</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Interval Selector Mobile */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Timeframe</label>
            <div className="grid grid-cols-5 gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {INTERVALS.map((interval) => (
                <button
                  key={interval.id}
                  onClick={() => setSelectedInterval(interval)}
                  className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    selectedInterval.id === interval.id
                      ? 'bg-white dark:bg-gray-800 text-indigo-500 shadow'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {interval.id}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Mobile */}
          <div className="flex space-x-2">
            <button 
              onClick={() => { onIndicatorsClick(); setIsMobileMenuOpen(false); }}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <IndicatorIcon className="w-4 h-4"/>
              <span>Indicators</span>
            </button>
            <button 
              onClick={onToggleTheme}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;