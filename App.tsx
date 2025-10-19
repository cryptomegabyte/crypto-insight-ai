import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CustomFinancialChart from './components/CustomFinancialChart';
import MarketDataPanel from './components/MarketDataPanel';
import { mockKrakenService } from './services/krakenService';
import { calculateSMA, calculateBollingerBands, calculateRSI, calculateEMA, calculateMACD, calculateStochastic, calculateIchimoku } from './lib/technicalIndicators';
import type { OhlcvData, Trade, Pair, Interval, ChartDataPoint, Opportunity } from './types';
import { PAIRS, INTERVALS } from './constants';
import IndicatorsModal from './components/indicators/IndicatorsModal';
import LandingPage from './components/LandingPage';
import OpportunityFeed from './components/OpportunityFeed';
import { analyzeOpportunities } from './lib/opportunityAnalyzer';
import { generateChartSummary } from './lib/chartSummaryEngine';
import AIChartSummary from './components/AIChartSummary';
import AIChatAssistant from './components/AIChatAssistant';

type IndicatorsState = {
  sma: boolean;
  ema: boolean;
  bb: boolean;
  rsi: boolean;
  macd: boolean;
  stochastic: boolean;
  volume: boolean;
  ichimoku: boolean;
  atr: boolean;
  awesomeOscillator: boolean;
};

const MainApplication: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<Pair>(PAIRS[0]);
  const [selectedInterval, setSelectedInterval] = useState<Interval>(INTERVALS[2]);
  const [historicalData, setHistoricalData] = useState<OhlcvData[]>([]);
  const [liveTrade, setLiveTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [aiChartSummary, setAiChartSummary] = useState('');
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);

  // Indicators State
  const [isIndicatorsModalOpen, setIsIndicatorsModalOpen] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorsState>({
    sma: true,
    ema: false,
    bb: false,
    rsi: true,
    macd: false,
    stochastic: false,
    volume: true,
    ichimoku: false,
    atr: false,
    awesomeOscillator: false,
  });
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
  }, [theme]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mockKrakenService.fetchOhlcv(selectedPair.id, selectedInterval.minutes);
        setHistoricalData(data);
      } catch (err) {
        setError('Failed to fetch historical data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const unsubscribe = mockKrakenService.subscribeToTrades(selectedPair.id, (trade) => {
      setLiveTrade(trade);
      setHistoricalData(prevData => {
        if (prevData.length === 0) return [];
        const lastCandle = prevData[prevData.length - 1];
        const updatedCandle = { ...lastCandle, close: trade.price, high: Math.max(lastCandle.high, trade.price), low: Math.min(lastCandle.low, trade.price) };
        return [...prevData.slice(0, -1), updatedCandle];
      });
    });

    return () => unsubscribe();
  }, [selectedPair, selectedInterval]);
  
  // Centralized data processing
  const processedChartData = useMemo<ChartDataPoint[]>(() => {
    if (historicalData.length === 0) return [];
    
    const closingPrices = historicalData.map(d => d.close);
    const highs = historicalData.map(d => d.high);
    const lows = historicalData.map(d => d.low);

    // Calculate all indicators
    const sma50 = calculateSMA(closingPrices, 50);
    const ema20 = calculateEMA(closingPrices, 20);
    const bb20 = calculateBollingerBands(closingPrices, 20, 2);
    const rsi14 = calculateRSI(closingPrices, 14);
    const macd = calculateMACD(closingPrices);
    const stochastic = calculateStochastic(highs, lows, closingPrices);
    const ichimoku = calculateIchimoku(highs, lows, closingPrices);
    
    // Merge data, indicators, and AI signals
    return historicalData.map((d, i) => {
      const point: ChartDataPoint = {
        ...d,
        sma50: sma50[i],
        ema20: ema20[i],
        bbUpper: bb20.upper[i],
        bbMiddle: bb20.middle[i],
        bbLower: bb20.lower[i],
        rsi: rsi14[i],
        macd: macd.macd[i],
        macdSignal: macd.signal[i],
        macdHist: macd.histogram[i],
        stochK: stochastic.k[i],
        stochD: stochastic.d[i],
        ichimokuTenkan: ichimoku.tenkan[i],
        ichimokuKijun: ichimoku.kijun[i],
        ichimokuSenkouA: ichimoku.senkouA[i],
        ichimokuSenkouB: ichimoku.senkouB[i],
        ichimokuChikou: ichimoku.chikou[i],
      };
      return point;
    });
  }, [historicalData]);

  useEffect(() => {
    if (processedChartData.length > 0) {
      const newOpportunities = analyzeOpportunities(processedChartData);
      setOpportunities(newOpportunities);
    }
  }, [processedChartData]);

  useEffect(() => {
    const generateSummary = () => {
      if (processedChartData.length < 50) {
        setAiChartSummary('🔄 Waiting for data...');
        return;
      }

      setIsAiSummaryLoading(true);

      // Generate summary locally without API calls
      const summary = generateChartSummary(processedChartData, selectedPair, selectedInterval);
      setAiChartSummary(summary);
      setIsAiSummaryLoading(false);
    };
    
    // Generate summary immediately (no debounce needed since it's local)
    generateSummary();

  }, [processedChartData, selectedPair, selectedInterval]);


  const latestData = processedChartData.length > 0 ? processedChartData[processedChartData.length - 1] : null;

  const handleApplyStrategy = (strategyName: string) => {
    // Reset indicators to focus on the strategy, but keep volume preference
    const newIndicatorsState: IndicatorsState = {
      sma: false,
      ema: false,
      bb: false,
      rsi: false,
      macd: false,
      stochastic: false,
      volume: indicators.volume, 
      ichimoku: false,
      atr: false,
      awesomeOscillator: false,
    };

    switch (strategyName) {
      case 'Moving Average Crossover':
        newIndicatorsState.sma = true;
        newIndicatorsState.ema = true;
        break;
      case 'RSI Divergence':
        newIndicatorsState.rsi = true;
        break;
      case 'Bollinger Band Squeeze':
        newIndicatorsState.bb = true;
        break;
      case 'MACD Signal Line Crossover':
        newIndicatorsState.macd = true;
        break;
      case 'Ichimoku Cloud Breakout':
        newIndicatorsState.ichimoku = true;
        break;
      default:
        return;
    }

    setIndicators(newIndicatorsState);
    setIsIndicatorsModalOpen(false); // Close modal after selection
  };
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header
        selectedPair={selectedPair}
        setSelectedPair={setSelectedPair}
        selectedInterval={selectedInterval}
        setSelectedInterval={setSelectedInterval}
        onIndicatorsClick={() => setIsIndicatorsModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="p-2 sm:p-4 grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-2 sm:gap-4">
        <div className="flex flex-col space-y-2 sm:space-y-4 min-w-0">
          <MarketDataPanel latestData={latestData} liveTrade={liveTrade} pair={selectedPair} />
          <div className="relative bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg shadow-md flex-grow min-h-[400px] sm:min-h-[500px] overflow-hidden">
             <AIChartSummary 
                summary={aiChartSummary}
                isLoading={isAiSummaryLoading}
                theme={theme}
              />
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <p>Loading Chart Data...</p>
              </div>
            ) : error ? (
              <div className="flex justify-center items-center h-full">
                 <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="w-full h-full">
                <CustomFinancialChart 
                  data={processedChartData} 
                  indicators={indicators}
                  theme={theme}
                />
              </div>
            )}
          </div>
        </div>
        <div className="xl:col-span-1 space-y-2 sm:space-y-4">
          {/* AI Chat Toggle Button */}
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg shadow-md transition-all duration-300 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>{showAIChat ? 'Hide' : 'Show'} AI Assistant</span>
          </button>

          {/* AI Chat Panel */}
          {showAIChat && (
            <div className="h-[600px]">
              <AIChatAssistant
                chartData={processedChartData}
                pair={selectedPair}
                interval={selectedInterval}
                latestPrice={latestData?.close || 0}
              />
            </div>
          )}

          {/* Opportunity Feed */}
          {!showAIChat && <OpportunityFeed opportunities={opportunities} />}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-gray-500">
        <p>Data sourced from Kraken Exchange (mocked). This is not financial advice.</p>
        <p>Crypto Insight AI &copy; 2024</p>
      </footer>
       <IndicatorsModal
        isOpen={isIndicatorsModalOpen}
        onClose={() => setIsIndicatorsModalOpen(false)}
        activeIndicators={indicators}
        onToggleIndicator={(key) => setIndicators(prev => ({ ...prev, [key]: !prev[key] }))}
        onApplyStrategy={handleApplyStrategy}
       />
    </div>
  );
}


const App: React.FC = () => {
  const [isAppLaunched, setIsAppLaunched] = useState(false);

  if (!isAppLaunched) {
    return <LandingPage onLaunch={() => setIsAppLaunched(true)} />;
  }

  return <MainApplication />;
};


export default App;