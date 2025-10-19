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
import { geminiService } from './services/geminiService';
import AIChartSummary from './components/AIChartSummary';

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
    const generateSummary = async () => {
      if (processedChartData.length < 50) return;

      setIsAiSummaryLoading(true);

      const latestPoint = processedChartData[processedChartData.length - 1];
      const activeIndicators: string[] = [];
      if (indicators.sma && latestPoint.sma50) activeIndicators.push(`Price is ${latestPoint.close > latestPoint.sma50 ? 'above' : 'below'} the 50-period SMA.`);
      if (indicators.rsi && latestPoint.rsi) activeIndicators.push(`RSI(14) is at ${latestPoint.rsi.toFixed(1)}.`);
      if (indicators.macd && latestPoint.macd && latestPoint.macdSignal) activeIndicators.push(`MACD is ${latestPoint.macd > latestPoint.macdSignal ? 'bullishly' : 'bearishly'} crossed.`);
      if (indicators.bb && latestPoint.bbUpper && latestPoint.bbLower) {
          const bandwidth = (latestPoint.bbUpper - latestPoint.bbLower) / latestPoint.bbMiddle!;
          if(bandwidth < 0.1) activeIndicators.push('Bollinger Bands are squeezing.'); // Example threshold
      }

      const opportunityTitles = opportunities.length > 0 ? `Key recent events include: ${opportunities.slice(0, 2).map(o => o.title).join(', ')}.` : 'No major patterns detected recently.';
      
      const prompt = `
        You are an expert technical analyst providing commentary for a charting platform. 
        The user is viewing ${selectedPair.name} (${selectedPair.id}) on the ${selectedInterval.id} timeframe.

        Current technical context:
        - ${activeIndicators.join(' ')}
        - ${opportunityTitles}

        Based ONLY on this context, provide a concise, neutral, and insightful summary (max 40 words) of the current market structure.
        Focus on the story the chart is telling. Do not give financial advice, predict the future, or use sensational language.
      `;

      try {
        const summary = await geminiService.generateChartSummary(prompt);
        setAiChartSummary(summary);
      } catch (err) {
        console.error("Failed to generate AI chart summary:", err);
        setAiChartSummary("Could not analyze chart at this time.");
      } finally {
        setIsAiSummaryLoading(false);
      }
    };
    
    const timeoutId = setTimeout(generateSummary, 1000); // Debounce to avoid rapid firing
    return () => clearTimeout(timeoutId);

  }, [processedChartData, opportunities, indicators, selectedPair, selectedInterval]);


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
      <main className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="flex flex-col space-y-4">
          <MarketDataPanel latestData={latestData} liveTrade={liveTrade} pair={selectedPair} />
          <div className="relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex-grow">
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
              <CustomFinancialChart 
                data={processedChartData} 
                indicators={indicators}
                theme={theme}
              />
            )}
          </div>
        </div>
        <div className="lg:col-span-1">
          <OpportunityFeed opportunities={opportunities} />
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