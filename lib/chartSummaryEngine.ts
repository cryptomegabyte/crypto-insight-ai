import type { ChartDataPoint, Pair, Interval } from '../types';

export interface TrendAnalysis {
  primary: 'strong_uptrend' | 'uptrend' | 'consolidation' | 'downtrend' | 'strong_downtrend';
  strength: number; // 0-100
  direction: number; // -100 (down) to 100 (up)
}

export interface MomentumAnalysis {
  momentum: 'very_strong' | 'strong' | 'neutral' | 'weak' | 'very_weak';
  signals: string[];
  score: number; // -100 to 100
}

export interface VolatilityAnalysis {
  regime: 'high' | 'normal' | 'low';
  bbBandwidth?: number;
  description: string;
}

/**
 * Analyze market structure from chart data
 * Generates actionable, educational market commentary
 */
export const analyzeTrendStructure = (data: ChartDataPoint[]): TrendAnalysis => {
  if (data.length < 50) {
    return { primary: 'consolidation', strength: 0, direction: 0 };
  }

  const lastPoint = data[data.length - 1];
  const sma20 = data.slice(-20).reduce((sum, d) => sum + d.close, 0) / 20;
  const sma50 = lastPoint.sma50 || 0;
  const sma200 = data.slice(-200).reduce((sum, d) => sum + d.close, 0) / 200;

  const priceAbove20 = lastPoint.close > sma20;
  const priceAbove50 = lastPoint.close > sma50;
  const priceAbove200 = lastPoint.close > sma200;
  const sma20Above50 = sma20 > sma50;
  const sma50Above200 = sma50 > sma200;

  // Trend determination
  let primary: TrendAnalysis['primary'] = 'consolidation';
  let strength = 0;
  let direction = 0;

  if (priceAbove20 && priceAbove50 && priceAbove200 && sma20Above50 && sma50Above200) {
    primary = 'strong_uptrend';
    strength = 90;
    direction = 100;
  } else if (priceAbove20 && priceAbove50 && sma20Above50) {
    primary = 'uptrend';
    strength = 70;
    direction = 75;
  } else if (priceAbove20 || priceAbove50) {
    primary = 'uptrend';
    strength = 50;
    direction = 50;
  } else if (!priceAbove20 && !priceAbove50 && !priceAbove200 && !sma20Above50 && !sma50Above200) {
    primary = 'strong_downtrend';
    strength = 90;
    direction = -100;
  } else if (!priceAbove20 && !priceAbove50 && !sma20Above50) {
    primary = 'downtrend';
    strength = 70;
    direction = -75;
  } else if (!priceAbove20 || !priceAbove50) {
    primary = 'downtrend';
    strength = 50;
    direction = -50;
  } else {
    primary = 'consolidation';
    strength = 40;
    direction = 0;
  }

  return { primary, strength, direction };
};

/**
 * Analyze momentum from multiple oscillators
 */
export const analyzeMomentum = (data: ChartDataPoint[]): MomentumAnalysis => {
  if (data.length < 14) {
    return { momentum: 'neutral', signals: [], score: 0 };
  }

  const lastPoint = data[data.length - 1];
  const signals: string[] = [];
  let scoreSum = 0;
  let scoreCount = 0;

  // RSI Analysis
  if (lastPoint.rsi !== null && lastPoint.rsi !== undefined) {
    if (lastPoint.rsi > 70) {
      signals.push('RSI overbought (>70)');
      scoreSum += -20;
    } else if (lastPoint.rsi > 60) {
      signals.push('RSI strong (>60)');
      scoreSum += 30;
    } else if (lastPoint.rsi > 50) {
      signals.push('RSI bullish (>50)');
      scoreSum += 15;
    } else if (lastPoint.rsi > 40) {
      signals.push('RSI neutral (40-50)');
      scoreSum += 0;
    } else if (lastPoint.rsi > 30) {
      signals.push('RSI weak (<40)');
      scoreSum += -15;
    } else {
      signals.push('RSI oversold (<30)');
      scoreSum += -30;
    }
    scoreCount++;
  }

  // MACD Analysis
  if (
    lastPoint.macd !== null &&
    lastPoint.macdSignal !== null &&
    lastPoint.macd !== undefined &&
    lastPoint.macdSignal !== undefined
  ) {
    const macdAboveSignal = lastPoint.macd > lastPoint.macdSignal;
    if (macdAboveSignal) {
      signals.push('MACD bullish');
      scoreSum += 25;
    } else {
      signals.push('MACD bearish');
      scoreSum += -25;
    }
    scoreCount++;
  }

  // Stochastic Analysis
  if (
    lastPoint.stochK !== null &&
    lastPoint.stochD !== null &&
    lastPoint.stochK !== undefined &&
    lastPoint.stochD !== undefined
  ) {
    if (lastPoint.stochK > 80) {
      signals.push('Stochastic overbought');
      scoreSum += -15;
    } else if (lastPoint.stochK > 50) {
      signals.push('Stochastic bullish');
      scoreSum += 15;
    } else if (lastPoint.stochK < 20) {
      signals.push('Stochastic oversold');
      scoreSum += -20;
    } else {
      signals.push('Stochastic neutral');
      scoreSum += 0;
    }
    scoreCount++;
  }

  const score = scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

  let momentum: MomentumAnalysis['momentum'];
  if (score > 40) momentum = 'very_strong';
  else if (score > 20) momentum = 'strong';
  else if (score > -20) momentum = 'neutral';
  else if (score > -40) momentum = 'weak';
  else momentum = 'very_weak';

  return { momentum, signals, score };
};

/**
 * Analyze volatility regime from Bollinger Bands
 */
export const analyzeVolatility = (data: ChartDataPoint[]): VolatilityAnalysis => {
  if (
    data.length < 20 ||
    !data[data.length - 1].bbUpper ||
    !data[data.length - 1].bbLower ||
    !data[data.length - 1].bbMiddle
  ) {
    return { regime: 'normal', description: 'Volatility data unavailable' };
  }

  const lastPoint = data[data.length - 1];
  const bbBandwidth = (lastPoint.bbUpper! - lastPoint.bbLower!) / lastPoint.bbMiddle!;

  // Calculate 20-period average bandwidth
  const bandwidths = data.slice(-20).map((p) => {
    if (p.bbUpper && p.bbLower && p.bbMiddle) {
      return (p.bbUpper - p.bbLower) / p.bbMiddle;
    }
    return 0;
  });

  const avgBandwidth = bandwidths.reduce((a, b) => a + b, 0) / bandwidths.length;

  let regime: VolatilityAnalysis['regime'];
  let description: string;

  if (bbBandwidth < avgBandwidth * 0.8) {
    regime = 'low';
    description = 'Bollinger Bands squeezed - volatility near lows (potential breakout ahead)';
  } else if (bbBandwidth > avgBandwidth * 1.3) {
    regime = 'high';
    description = 'Bollinger Bands expanded - high volatility environment';
  } else {
    regime = 'normal';
    description = 'Normal volatility regime';
  }

  return { regime, bbBandwidth, description };
};

/**
 * Generate contextual market summary from technical analysis
 * No API calls, pure local analysis
 */
export const generateChartSummary = (
  data: ChartDataPoint[],
  pair: Pair,
  interval: Interval
): string => {
  if (data.length < 50) {
    return '🔄 Waiting for more data to analyze...';
  }

  const lastPoint = data[data.length - 1];
  const trend = analyzeTrendStructure(data);
  const momentum = analyzeMomentum(data);
  const volatility = analyzeVolatility(data);

  const summaries: string[] = [];

  // Trend narrative
  const trendMap = {
    strong_uptrend: '📈 Strong uptrend',
    uptrend: '↗️ Uptrend',
    consolidation: '↔️ Consolidating',
    downtrend: '↘️ Downtrend',
    strong_downtrend: '📉 Strong downtrend',
  };

  summaries.push(trendMap[trend.primary]);

  // Price relative to moving averages
  if (lastPoint.sma50) {
    const distanceFromSMA = ((lastPoint.close - lastPoint.sma50) / lastPoint.sma50) * 100;
    if (Math.abs(distanceFromSMA) > 3) {
      summaries.push(
        distanceFromSMA > 0
          ? `Price ${Math.abs(distanceFromSMA).toFixed(1)}% above 50-SMA`
          : `Price ${Math.abs(distanceFromSMA).toFixed(1)}% below 50-SMA`
      );
    }
  }

  // Momentum summary
  summaries.push(`• Momentum: ${momentum.momentum}`);

  // Key signals
  if (momentum.signals.length > 0) {
    summaries.push(`• ${momentum.signals[0]}`);
    if (momentum.signals.length > 1) {
      summaries.push(`• ${momentum.signals[1]}`);
    }
  }

  // Volatility context
  if (volatility.regime === 'low') {
    summaries.push('⚡ Low volatility - watch for breakout');
  } else if (volatility.regime === 'high') {
    summaries.push('🔥 High volatility - expect larger moves');
  }

  // Educational callout
  if (trend.primary === 'consolidation') {
    summaries.push('📚 Tip: Consolidations often precede strong moves');
  } else if (momentum.momentum === 'very_strong') {
    summaries.push('📚 Tip: Strong momentum may lead to pullbacks');
  } else if (volatility.regime === 'low') {
    summaries.push('📚 Tip: Squeezes often lead to breakouts - watch support/resistance');
  }

  return summaries.join(' | ');
};

/**
 * Generate short one-liner summary for compact display
 */
export const generateShortSummary = (
  data: ChartDataPoint[],
  pair: Pair,
  interval: Interval
): string => {
  if (data.length < 50) {
    return '⏳ Analyzing...';
  }

  const lastPoint = data[data.length - 1];
  const trend = analyzeTrendStructure(data);
  const momentum = analyzeMomentum(data);

  const trendEmoji = {
    strong_uptrend: '🚀',
    uptrend: '📈',
    consolidation: '➡️',
    downtrend: '📉',
    strong_downtrend: '🔻',
  };

  const momentumEmoji = {
    very_strong: '🔥',
    strong: '👍',
    neutral: '➖',
    weak: '👎',
    very_weak: '❌',
  };

  const price = lastPoint.close.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${trendEmoji[trend.primary]} ${pair.base} @ ${price} | ${momentumEmoji[momentum.momentum]} ${momentum.momentum}`;
};

/**
 * Generate structured analysis object for UI rendering
 */
export const generateStructuredAnalysis = (
  data: ChartDataPoint[],
  pair: Pair,
  interval: Interval
) => {
  const trend = analyzeTrendStructure(data);
  const momentum = analyzeMomentum(data);
  const volatility = analyzeVolatility(data);
  const lastPoint = data[data.length - 1];

  return {
    trend,
    momentum,
    volatility,
    price: lastPoint.close,
    timestamp: lastPoint.time,
    pair,
    interval,
  };
};
