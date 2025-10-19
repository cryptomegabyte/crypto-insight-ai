import type { ChartDataPoint } from '../types';

export interface ScoredOpportunity {
  id: string;
  type: 'Pattern' | 'Indicator' | 'Volatility' | 'News';
  title: string;
  description: string;
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  suggestedAction: 'watch' | 'consider' | 'strong_signal';
  rationale: string;
  dataPointIndex?: number;
}

/**
 * Calculate confidence score based on supporting indicators
 * Higher score = more reliable signal
 */
const calculateConfidenceScore = (
  data: ChartDataPoint[],
  dataPointIndex: number,
  patternType: string
): number => {
  const point = data[dataPointIndex];
  let confidenceScore = 50; // Base score

  // Support from trend strength
  if (data.length >= 50) {
    const recentClose = data.slice(-20).map((d) => d.close);
    const isUptrend = recentClose[recentClose.length - 1] > recentClose[0];
    const isDowntrend = recentClose[recentClose.length - 1] < recentClose[0];

    // Adjust confidence based on trend alignment
    if (
      (patternType.includes('Bullish') && isUptrend) ||
      (patternType.includes('Bearish') && isDowntrend)
    ) {
      confidenceScore += 15;
    }
  }

  // Support from RSI
  if (point.rsi !== null && point.rsi !== undefined) {
    if (patternType.includes('Bullish') && point.rsi < 70 && point.rsi > 40) {
      confidenceScore += 10; // Room to run up
    } else if (patternType.includes('Bearish') && point.rsi > 30 && point.rsi < 60) {
      confidenceScore += 10; // Room to run down
    }
  }

  // Support from MACD
  if (
    patternType.includes('Bullish') &&
    point.macd &&
    point.macdSignal &&
    point.macd > point.macdSignal
  ) {
    confidenceScore += 10;
  } else if (
    patternType.includes('Bearish') &&
    point.macd &&
    point.macdSignal &&
    point.macd < point.macdSignal
  ) {
    confidenceScore += 10;
  }

  // Support from volume (if available in future)
  // TODO: Add volume analysis when volume data is available

  return Math.min(100, confidenceScore);
};

/**
 * Determine risk level based on volatility and position size
 */
const calculateRiskLevel = (data: ChartDataPoint[], dataPointIndex: number): 'low' | 'medium' | 'high' => {
  const point = data[dataPointIndex];

  // Check Bollinger Band width as volatility proxy
  if (
    point.bbUpper &&
    point.bbLower &&
    point.bbMiddle &&
    data.length >= 20
  ) {
    const bbBandwidth = (point.bbUpper - point.bbLower) / point.bbMiddle;

    // Calculate average bandwidth
    const recentBandwidths = data
      .slice(-20)
      .map((p) => {
        if (p.bbUpper && p.bbLower && p.bbMiddle) {
          return (p.bbUpper - p.bbLower) / p.bbMiddle;
        }
        return 0;
      })
      .filter((b) => b > 0);

    const avgBandwidth = recentBandwidths.reduce((a, b) => a + b, 0) / recentBandwidths.length;

    if (bbBandwidth > avgBandwidth * 1.5) {
      return 'high';
    } else if (bbBandwidth < avgBandwidth * 0.7) {
      return 'low';
    }
  }

  return 'medium';
};

/**
 * Determine suggested action based on confidence and setup quality
 */
const determineSuggestedAction = (confidence: number): 'watch' | 'consider' | 'strong_signal' => {
  if (confidence >= 75) return 'strong_signal';
  if (confidence >= 60) return 'consider';
  return 'watch';
};

/**
 * Generate detailed rationale explaining why this setup matters
 */
const generateRationale = (data: ChartDataPoint[], patternType: string): string => {
  const point = data[data.length - 1];
  const rationales: string[] = [];

  // Pattern type explanation
  if (patternType.includes('Bullish Engulfing')) {
    rationales.push('Previous support held and current candle fully engulfed prior bearish candle');
  } else if (patternType.includes('Bearish Engulfing')) {
    rationales.push('Previous resistance failed and current candle fully engulfed prior bullish candle');
  } else if (patternType.includes('RSI Oversold')) {
    rationales.push('RSI crossed into oversold territory - potential for mean reversion');
  } else if (patternType.includes('RSI Overbought')) {
    rationales.push('RSI crossed into overbought territory - potential pullback warning');
  } else if (patternType.includes('BB Squeeze')) {
    rationales.push('Bollinger Bands at lowest width - historically precedes volatility expansion');
  } else if (patternType.includes('MACD Bullish')) {
    rationales.push('MACD crossed above signal line - momentum turning positive');
  } else if (patternType.includes('MACD Bearish')) {
    rationales.push('MACD crossed below signal line - momentum turning negative');
  }

  // Add indicator confirmation
  if (point.rsi && point.rsi > 60) {
    rationales.push('RSI confirms strong momentum');
  } else if (point.rsi && point.rsi < 40) {
    rationales.push('RSI shows weakness');
  }

  return rationales.join('. ');
};

/**
 * Score and enhance an opportunity with confidence metrics
 */
export const scoreOpportunity = (
  data: ChartDataPoint[],
  id: string,
  type: 'Pattern' | 'Indicator' | 'Volatility',
  title: string,
  description: string,
  dataPointIndex: number
): ScoredOpportunity => {
  const confidence = calculateConfidenceScore(data, dataPointIndex, title);
  const riskLevel = calculateRiskLevel(data, dataPointIndex);
  const suggestedAction = determineSuggestedAction(confidence);
  const rationale = generateRationale(data, title);

  return {
    id,
    type,
    title,
    description,
    confidence,
    riskLevel,
    suggestedAction,
    rationale,
    dataPointIndex,
  };
};

/**
 * Filter opportunities by confidence threshold
 * Higher threshold = fewer but higher quality signals
 */
export const filterByConfidence = (
  opportunities: ScoredOpportunity[],
  minConfidence: number = 50
): ScoredOpportunity[] => {
  return opportunities.filter((opp) => opp.confidence >= minConfidence);
};

/**
 * Sort opportunities by confidence (highest first)
 */
export const sortByConfidence = (opportunities: ScoredOpportunity[]): ScoredOpportunity[] => {
  return [...opportunities].sort((a, b) => b.confidence - a.confidence);
};

/**
 * Get opportunities of specific quality level
 */
export const getHighQualitySetups = (opportunities: ScoredOpportunity[]): ScoredOpportunity[] => {
  return opportunities.filter(
    (opp) => opp.suggestedAction === 'strong_signal' || opp.suggestedAction === 'consider'
  );
};

/**
 * Get historical win rate for a pattern type (mock data for now)
 * In production, this would be calculated from backtesting
 */
export const getPatternWinRate = (patternType: string): number => {
  const winRates: Record<string, number> = {
    'Bullish Engulfing': 0.62,
    'Bearish Engulfing': 0.58,
    'RSI Oversold': 0.55,
    'RSI Overbought': 0.52,
    'BB Squeeze': 0.61,
    'MACD Bullish Crossover': 0.59,
    'MACD Bearish Crossover': 0.56,
  };

  return winRates[patternType] || 0.5;
};

/**
 * Calculate risk/reward ratio based on support/resistance levels
 * For now, returns a default estimate
 */
export const calculateRiskRewardRatio = (
  entryPrice: number,
  stopPrice: number,
  targetPrice: number
): number => {
  const risk = Math.abs(entryPrice - stopPrice);
  const reward = Math.abs(targetPrice - entryPrice);

  if (risk === 0) return 0;
  return reward / risk;
};
