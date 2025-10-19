import { OhlcvData } from '../types';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateStochastic } from './technicalIndicators';

type Signal = 'Buy' | 'Sell' | 'Neutral';

// Fix: Export IndicatorSignal type for use in PulseBar component.
export interface IndicatorSignal {
  name: string;
  type: 'Moving Average' | 'Oscillator';
  signal: Signal;
}

// Fix: Export AnalysisResult type for use in MarketPulse component.
export interface AnalysisResult {
  signal: 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';
  gaugeValue: number; // -100 to 100
  buyCount: number;
  sellCount: number;
  neutralCount: number;
  totalSignals: number;
  indicatorSignals: IndicatorSignal[];
  aiSummary: string;
}


// Fix: Add getTechnicalAnalysis function to provide a more detailed analysis.
export const getTechnicalAnalysis = (data: OhlcvData[]): AnalysisResult | null => {
  if (data.length < 50) {
    return null;
  }
  
  const closes = data.map(d => d.close);
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const lastClose = closes[closes.length - 1];

  const indicatorSignals: IndicatorSignal[] = [];

  // --- Moving Averages ---
  const sma10 = calculateSMA(closes, 10).pop()!;
  indicatorSignals.push({ name: 'SMA(10)', type: 'Moving Average', signal: lastClose > sma10! ? 'Buy' : 'Sell' });

  const ema10 = calculateEMA(closes, 10).pop()!;
  indicatorSignals.push({ name: 'EMA(10)', type: 'Moving Average', signal: lastClose > ema10! ? 'Buy' : 'Sell' });
  
  const sma50 = calculateSMA(closes, 50).pop()!;
  indicatorSignals.push({ name: 'SMA(50)', type: 'Moving Average', signal: lastClose > sma50! ? 'Buy' : 'Sell' });

  // --- Oscillators ---
  const rsi = calculateRSI(closes, 14).pop()!;
  let rsiSignal: Signal = 'Neutral';
  if (rsi < 30) rsiSignal = 'Buy';
  else if (rsi > 70) rsiSignal = 'Sell';
  indicatorSignals.push({ name: 'RSI(14)', type: 'Oscillator', signal: rsiSignal });
  
  const macd = calculateMACD(closes);
  const lastMacd = macd.macd.pop()!;
  const lastSignal = macd.signal.pop()!;
  let macdSignal: Signal = 'Neutral';
  if (lastMacd! > lastSignal!) macdSignal = 'Buy';
  else if (lastMacd! < lastSignal!) macdSignal = 'Sell';
  indicatorSignals.push({ name: 'MACD', type: 'Oscillator', signal: macdSignal });

  const stoch = calculateStochastic(highs, lows, closes);
  const lastK = stoch.k.pop()!;
  let stochSignal: Signal = 'Neutral';
  if (lastK! < 20) stochSignal = 'Buy';
  else if (lastK! > 80) stochSignal = 'Sell';
  indicatorSignals.push({ name: 'Stochastic', type: 'Oscillator', signal: stochSignal });
  
  // --- Aggregation ---
  const totalSignals = indicatorSignals.length;
  const buyCount = indicatorSignals.filter(s => s.signal === 'Buy').length;
  const sellCount = indicatorSignals.filter(s => s.signal === 'Sell').length;
  const neutralCount = totalSignals - buyCount - sellCount;

  const gaugeValue = (buyCount + sellCount) > 0 ? Math.round(((buyCount - sellCount) / (buyCount + sellCount)) * 100) : 0;
  
  let signal: AnalysisResult['signal'];
  if (gaugeValue > 75) signal = 'Strong Buy';
  else if (gaugeValue > 25) signal = 'Buy';
  else if (gaugeValue < -75) signal = 'Strong Sell';
  else if (gaugeValue < -25) signal = 'Sell';
  else signal = 'Neutral';

  // AI Summary generation
  let aiSummary = `The market sentiment is currently ${signal.toLowerCase()}. `;
    if (signal.includes('Buy')) {
        aiSummary += `This is supported by strength in ${buyCount} of ${totalSignals} key indicators, showing bullish momentum.`;
    } else if (signal.includes('Sell')) {
        aiSummary += `This is driven by weakness in ${sellCount} of ${totalSignals} key indicators, suggesting bearish pressure.`;
    } else {
        aiSummary += 'Indicators are mixed, providing no clear directional signal. The market appears to be in a state of indecision.';
    }

  return {
    signal,
    gaugeValue,
    buyCount,
    sellCount,
    neutralCount,
    totalSignals,
    indicatorSignals,
    aiSummary,
  };
};