import React, { useState, useMemo } from 'react';
import { SearchIcon, CloseIcon } from '../shared/Icons';

type IndicatorKey = 'sma' | 'ema' | 'bb' | 'rsi' | 'macd' | 'stochastic' | 'volume' | 'ichimoku' | 'atr' | 'awesomeOscillator';

interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeIndicators: Record<IndicatorKey, boolean>;
  onToggleIndicator: (key: IndicatorKey) => void;
  onApplyStrategy: (strategyName: string) => void;
}

const ALL_INDICATORS: { key: IndicatorKey; name: string; description: string }[] = [
  { key: 'sma', name: 'Simple Moving Average (SMA)', description: 'SMA(50) - Average price over 50 periods.' },
  { key: 'ema', name: 'Exponential Moving Average (EMA)', description: 'EMA(20) - Weighted average, prioritizing recent prices.' },
  { key: 'bb', name: 'Bollinger Bands (BB)', description: 'BB(20, 2) - Measures volatility with upper and lower bands.' },
  { key: 'rsi', name: 'Relative Strength Index (RSI)', description: 'RSI(14) - Momentum oscillator for overbought/oversold.' },
  { key: 'macd', name: 'Moving Average Convergence Divergence', description: 'MACD(12,26,9) - Shows relationship between two EMAs.' },
  { key: 'stochastic', name: 'Stochastic Oscillator', description: 'Stoch(14,3) - Compares closing price to a range over time.' },
  { key: 'volume', name: 'Volume', description: 'The number of shares or contracts traded in a security or market.' },
  { key: 'ichimoku', name: 'Ichimoku Cloud', description: 'A collection of indicators showing support, resistance, and momentum.' },
  { key: 'atr', name: 'Average True Range (ATR)', description: 'ATR(14) - A technical analysis volatility indicator.' },
  { key: 'awesomeOscillator', name: 'Awesome Oscillator (AO)', description: 'A momentum indicator reflecting the explosive nature of the market.' },
];

const ALL_STRATEGIES: { name: string; description: string }[] = [
    { name: 'Moving Average Crossover', description: 'A basic trend-following strategy using two MAs. A "golden cross" (short-term MA crosses above long-term MA) is a bullish signal.' },
    { name: 'RSI Divergence', description: 'Identifies potential reversals. Bullish divergence occurs when price makes a lower low but RSI makes a higher low.' },
    { name: 'Bollinger Band Squeeze', description: 'A volatility breakout strategy. A "squeeze" (bands narrow) suggests a period of low volatility, often followed by a significant price move.' },
    { name: 'MACD Signal Line Crossover', description: 'A momentum strategy. A bullish crossover occurs when the MACD line crosses above the signal line.' },
    { name: 'Ichimoku Cloud Breakout', description: 'A trend confirmation strategy. A bullish signal occurs when price breaks and closes above the cloud (Kumo).' }
];

const IndicatorsModal: React.FC<IndicatorsModalProps> = ({ isOpen, onClose, activeIndicators, onToggleIndicator, onApplyStrategy }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Indicators');

  const filteredContent = useMemo(() => {
    if (activeTab === 'Indicators') {
      return ALL_INDICATORS.filter(indicator =>
        indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        indicator.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return ALL_STRATEGIES.filter(strategy =>
      strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      strategy.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, activeTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl h-[70vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Indicators & Strategies</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Search & Tabs */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 border-transparent rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-4 flex space-x-2 border-b border-gray-200 dark:border-gray-700">
             {['Indicators', 'Strategies'].map(tab => (
                 <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === tab 
                        ? 'border-b-2 border-indigo-500 text-indigo-500' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'
                    }`}
                >
                    {tab}
                 </button>
             ))}
          </div>
        </div>
        
        {/* Main Content */}
        <main className="flex-grow overflow-y-auto">
          <ul>
            {activeTab === 'Indicators' ? (
                (filteredContent as typeof ALL_INDICATORS).map(indicator => (
                    <li key={indicator.key}>
                        <button 
                            onClick={() => onToggleIndicator(indicator.key)}
                            className={`w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 ${activeIndicators[indicator.key] ? 'bg-indigo-100 dark:bg-indigo-900/50' : ''}`}
                        >
                            <p className={`font-semibold ${activeIndicators[indicator.key] ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{indicator.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{indicator.description}</p>
                        </button>
                    </li>
                ))
            ) : (
                (filteredContent as typeof ALL_STRATEGIES).map(strategy => (
                    <li key={strategy.name}>
                      <button
                        onClick={() => onApplyStrategy(strategy.name)}
                        className="w-full text-left px-4 py-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
                      >
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold">{strategy.name}</p>
                          <span className="text-xs font-bold text-indigo-500 bg-indigo-100 dark:bg-indigo-900/50 dark:text-indigo-400 px-2 py-0.5 rounded-full">AI-Enhanced</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{strategy.description}</p>
                      </button>
                    </li>
                ))
            )}
             {filteredContent.length === 0 && (
                <li className="p-4 text-center text-sm text-gray-500">No results found.</li>
             )}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default IndicatorsModal;