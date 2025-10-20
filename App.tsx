import React, { useState, useEffect, useMemo, useCallback } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './grid-layout.css';
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
import AIChatAssistant from './components/AIChatAssistant';
import AITradingFeed from './components/AITradingFeed';
import LayoutControlPanel from './components/LayoutControlPanel';
import { aiTradingFeed } from './lib/aiTradingFeed';
import type { AIFeedItem } from './lib/aiTradingFeed';
import { 
  loadLayout, 
  saveLayout, 
  loadPanelVisibility, 
  savePanelVisibility,
  getPresetById,
  type PanelId,
  type LayoutPreset,
  DEFAULT_PANELS
} from './lib/layoutConfig';

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
  
  // Layout State
  const savedLayoutData = loadLayout();
  const savedPanelVis = loadPanelVisibility();
  const [currentLayout, setCurrentLayout] = useState<Layout[]>(savedLayoutData.layout);
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>(savedLayoutData.presetId);
  const [panelVisibility, setPanelVisibility] = useState<Record<PanelId, boolean>>(
    savedPanelVis || Object.fromEntries(
      Object.entries(DEFAULT_PANELS).map(([id, panel]) => [id, panel.visible])
    ) as Record<PanelId, boolean>
  );
  
  // AI Feed State
  const [feedItems, setFeedItems] = useState<AIFeedItem[]>([]);

  // Grid Layout State
  const [gridWidth, setGridWidth] = useState(typeof window !== 'undefined' ? window.innerWidth - 32 : 1200);

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

  // Handle window resize for responsive grid
  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth - 32);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


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

  // Generate AI Feed Items
  useEffect(() => {
    if (processedChartData.length >= 20) {
      const newItems = aiTradingFeed.generateFeedItems(
        processedChartData,
        selectedPair,
        selectedInterval
      );
      if (newItems.length > 0) {
        setFeedItems(prev => [...newItems, ...prev].slice(0, 50));
      }
    }
  }, [processedChartData, selectedPair, selectedInterval]);

  const latestData = processedChartData.length > 0 ? processedChartData[processedChartData.length - 1] : null;

  // Layout Handlers
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setCurrentLayout(newLayout);
    saveLayout(newLayout, currentPresetId);
  }, [currentPresetId]);

  const handlePresetChange = useCallback((preset: LayoutPreset) => {
    setCurrentLayout(preset.layout);
    setPanelVisibility(preset.panelVisibility);
    setCurrentPresetId(preset.id);
    saveLayout(preset.layout, preset.id);
    savePanelVisibility(preset.panelVisibility);
  }, []);

  const handlePanelVisibilityChange = useCallback((panelId: PanelId, visible: boolean) => {
    const newVisibility = { ...panelVisibility, [panelId]: visible };
    setPanelVisibility(newVisibility);
    savePanelVisibility(newVisibility);
  }, [panelVisibility]);

  const handleResetLayout = useCallback(() => {
    const balancedPreset = getPresetById('balanced')!;
    handlePresetChange(balancedPreset);
  }, [handlePresetChange]);

  // AI Feed Actions
  const handleFeedActionClick = useCallback((action: string, item: AIFeedItem) => {
    // Map actions to questions for AI chat
    const actionToQuestion: Record<string, string> = {
      'analyze_pattern': 'Find patterns',
      'view_chart': `Analyze ${item.pair}`,
      'ask_exit': 'Should I sell?',
      'explain_rsi': 'Explain RSI',
      'ask_buy': 'Should I buy?',
      'ask_strategy': 'What strategy should I use?',
      'ask_trend': "What's the trend?",
      'ask_risk': "What's the risk?",
      'explain_volatility': 'Explain volatility',
      'ask_levels': 'Show support and resistance',
      'set_alert': `Set alert for ${item.pair}`,
      'ask_volume': 'Analyze volume',
      'explain_volume': 'Explain volume',
      'explain_macd': 'Explain MACD'
    };

    const question = actionToQuestion[action];
    if (question) {
      // TODO: Send question to AI chat - for now just log
      console.log('AI Chat Question:', question);
    }
  }, []);

  const handleClearFeed = useCallback(() => {
    setFeedItems([]);
    aiTradingFeed.clearHistory();
  }, []);

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
  
  // Render panel content based on panel ID
  const renderPanelContent = (panelId: PanelId) => {
    switch (panelId) {
      case 'chart':
        return (
          <div className="w-full h-full flex flex-col bg-gray-800 rounded-lg overflow-hidden">
            {loading ? (
              <div className="flex-1 flex justify-center items-center p-4">
                <p>Loading Chart Data...</p>
              </div>
            ) : error ? (
              <div className="flex-1 flex justify-center items-center p-4">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 p-2">
                <CustomFinancialChart 
                  data={processedChartData} 
                  indicators={indicators}
                  theme={theme}
                />
              </div>
            )}
          </div>
        );
      case 'ai-chat':
        return (
          <div className="w-full h-full">
            <AIChatAssistant
              chartData={processedChartData}
              pair={selectedPair}
              interval={selectedInterval}
              latestPrice={latestData?.close || 0}
            />
          </div>
        );
      case 'ai-feed':
        return (
          <AITradingFeed
            feedItems={feedItems}
            onActionClick={handleFeedActionClick}
            onClearFeed={handleClearFeed}
          />
        );
      case 'market-data':
        return (
          <MarketDataPanel 
            latestData={latestData} 
            liveTrade={liveTrade} 
            pair={selectedPair} 
          />
        );
      case 'opportunities':
        return <OpportunityFeed opportunities={opportunities} />;
      case 'performance':
        return (
          <div className="w-full h-full bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-bold mb-2">Performance</h3>
            <p className="text-gray-400 text-sm">Coming soon...</p>
          </div>
        );
      default:
        return <div>Panel not found</div>;
    }
  };

  // Get visible panels for grid layout
  const visiblePanels = currentLayout.filter(item => 
    panelVisibility[item.i as PanelId]
  );

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
      >
        {/* Layout Control in Header */}
        <LayoutControlPanel
          currentPresetId={currentPresetId}
          onPresetChange={handlePresetChange}
          panelVisibility={panelVisibility}
          onPanelVisibilityChange={handlePanelVisibilityChange}
          onResetLayout={handleResetLayout}
        />
      </Header>

      {/* Customizable Grid Layout */}
      <main className="p-2 sm:p-4">
        <GridLayout
          className="layout"
          layout={visiblePanels}
          cols={12}
          rowHeight={80}
          width={gridWidth}
          onLayoutChange={handleLayoutChange}
          isDraggable={true}
          isResizable={true}
          compactType="vertical"
          preventCollision={false}
          margin={[8, 8]}
          containerPadding={[0, 0]}
        >
          {visiblePanels.map((item) => (
            <div 
              key={item.i}
              className="bg-gray-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-3 py-2 bg-gray-800/80 border-b border-gray-700">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>{DEFAULT_PANELS[item.i as PanelId].icon}</span>
                  {DEFAULT_PANELS[item.i as PanelId].title}
                </span>
                <button
                  onClick={() => handlePanelVisibilityChange(item.i as PanelId, false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Hide panel"
                >
                  ✕
                </button>
              </div>
              
              {/* Panel Content */}
              <div className="w-full h-[calc(100%-40px)] overflow-hidden">
                {renderPanelContent(item.i as PanelId)}
              </div>
            </div>
          ))}
        </GridLayout>
      </main>

      <footer className="text-center p-4 text-xs text-gray-500">
        <p>Data sourced from Kraken Exchange (mocked). This is not financial advice.</p>
        <p>Crypto Insight AI &copy; 2024 • Fully customizable layout • Drag panels to rearrange</p>
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