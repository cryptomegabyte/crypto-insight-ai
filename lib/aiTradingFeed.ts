import type { ChartDataPoint, Pair, Interval } from '../types';
import { analyzeTrendStructure, analyzeMomentum, analyzeVolatility } from './chartSummaryEngine';

export type FeedItemType = 'pattern' | 'alert' | 'education' | 'insight' | 'volume' | 'momentum';
export type FeedItemSeverity = 'high' | 'medium' | 'low';

export interface AIFeedItem {
  id: string;
  type: FeedItemType;
  severity: FeedItemSeverity;
  title: string;
  description: string;
  pair: string;
  timestamp: number;
  actionable: boolean;
  actions?: Array<{
    label: string;
    action: string;
  }>;
}

/**
 * AI Trading Feed Generator
 * Analyzes chart data and generates real-time insights, alerts, and educational content
 */
export class AITradingFeedGenerator {
  private lastAnalysis: Map<string, number> = new Map();
  private feedHistory: AIFeedItem[] = [];
  private maxHistorySize = 50;

  /**
   * Generate feed items for current chart state
   */
  generateFeedItems(
    chartData: ChartDataPoint[],
    pair: Pair,
    interval: Interval
  ): AIFeedItem[] {
    if (chartData.length < 20) return [];

    const items: AIFeedItem[] = [];
    const pairKey = `${pair.id}_${interval.id}`;
    const now = Date.now();
    
    // Throttle analysis to prevent duplicate items (every 10 seconds)
    const lastCheck = this.lastAnalysis.get(pairKey) || 0;
    if (now - lastCheck < 10000) {
      return [];
    }
    this.lastAnalysis.set(pairKey, now);

    const latest = chartData[chartData.length - 1];
    const trend = analyzeTrendStructure(chartData);
    const momentum = analyzeMomentum(chartData);
    const volatility = analyzeVolatility(chartData);

    // 1. Pattern Detection
    const patterns = this.detectPatterns(chartData);
    patterns.forEach(pattern => {
      items.push({
        id: `pattern_${pair.id}_${now}`,
        type: 'pattern',
        severity: pattern.bullish ? 'high' : 'medium',
        title: `${pattern.bullish ? '🟢' : '🔴'} ${pattern.name} Pattern`,
        description: `${pattern.description} (${pattern.confidence}% confidence)`,
        pair: pair.name,
        timestamp: now,
        actionable: true,
        actions: [
          { label: 'Analyze', action: 'analyze_pattern' },
          { label: 'View Chart', action: 'view_chart' }
        ]
      });
    });

    // 2. Key Level Alerts
    const levelAlert = this.checkKeyLevels(chartData, latest, pair);
    if (levelAlert) {
      items.push(levelAlert);
    }

    // 3. RSI Alerts
    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi > 70) {
        items.push({
          id: `rsi_${pair.id}_${now}`,
          type: 'alert',
          severity: 'medium',
          title: '⚠️ RSI Overbought',
          description: `${pair.name} RSI at ${latest.rsi.toFixed(1)} - price may pull back`,
          pair: pair.name,
          timestamp: now,
          actionable: true,
          actions: [
            { label: 'Exit Strategy', action: 'ask_exit' },
            { label: 'Explain RSI', action: 'explain_rsi' }
          ]
        });
      } else if (latest.rsi < 30) {
        items.push({
          id: `rsi_${pair.id}_${now}`,
          type: 'alert',
          severity: 'high',
          title: '🟢 RSI Oversold',
          description: `${pair.name} RSI at ${latest.rsi.toFixed(1)} - potential bounce opportunity`,
          pair: pair.name,
          timestamp: now,
          actionable: true,
          actions: [
            { label: 'Entry Analysis', action: 'ask_buy' },
            { label: 'Learn More', action: 'explain_rsi' }
          ]
        });
      }
    }

    // 4. MACD Crossovers
    const macdAlert = this.checkMACDCrossover(chartData, pair);
    if (macdAlert) {
      items.push(macdAlert);
    }

    // 5. Volume Alerts
    const volumeAlert = this.checkVolume(chartData, latest, pair);
    if (volumeAlert) {
      items.push(volumeAlert);
    }

    // 6. Trend Changes
    if (trend.primary === 'strong_uptrend' || trend.primary === 'strong_downtrend') {
      items.push({
        id: `trend_${pair.id}_${now}`,
        type: 'insight',
        severity: 'high',
        title: `📊 ${trend.primary === 'strong_uptrend' ? 'Strong Uptrend' : 'Strong Downtrend'}`,
        description: `${pair.name} showing ${trend.strength}% trend strength on ${interval.id}`,
        pair: pair.name,
        timestamp: now,
        actionable: true,
        actions: [
          { label: 'Get Strategy', action: 'ask_strategy' },
          { label: 'Analyze Trend', action: 'ask_trend' }
        ]
      });
    }

    // 7. Volatility Alerts
    if (volatility.regime === 'high') {
      items.push({
        id: `vol_${pair.id}_${now}`,
        type: 'alert',
        severity: 'medium',
        title: '⚡ High Volatility Detected',
        description: `${pair.name} experiencing ${volatility.regime} volatility - wider stops recommended`,
        pair: pair.name,
        timestamp: now,
        actionable: true,
        actions: [
          { label: 'Risk Analysis', action: 'ask_risk' },
          { label: 'Learn More', action: 'explain_volatility' }
        ]
      });
    }

    // 8. Educational Tips (random, context-aware)
    if (items.length === 0 || Math.random() > 0.7) {
      const tip = this.getEducationalTip(trend, momentum, latest);
      if (tip) items.push(tip);
    }

    // Add to history
    items.forEach(item => {
      this.feedHistory.unshift(item);
    });

    // Trim history
    if (this.feedHistory.length > this.maxHistorySize) {
      this.feedHistory = this.feedHistory.slice(0, this.maxHistorySize);
    }

    return items;
  }

  /**
   * Get full feed history
   */
  getFeedHistory(): AIFeedItem[] {
    return this.feedHistory;
  }

  /**
   * Clear feed history
   */
  clearHistory(): void {
    this.feedHistory = [];
  }

  private detectPatterns(data: ChartDataPoint[]): Array<{
    name: string;
    bullish: boolean;
    confidence: number;
    description: string;
  }> {
    const patterns: Array<any> = [];
    const recent = data.slice(-20);

    for (let i = 2; i < recent.length; i++) {
      const curr = recent[i];
      const prev = recent[i - 1];

      // Only report patterns in last 3 candles
      if (i < recent.length - 3) continue;

      // Bullish Engulfing
      if (prev.close < prev.open && curr.close > curr.open &&
          curr.close > prev.open && curr.open < prev.close) {
        patterns.push({
          name: 'Bullish Engulfing',
          bullish: true,
          confidence: 75,
          description: 'Strong reversal signal - buyers overwhelmed sellers'
        });
      }

      // Bearish Engulfing
      if (prev.close > prev.open && curr.close < curr.open &&
          curr.close < prev.open && curr.open > prev.close) {
        patterns.push({
          name: 'Bearish Engulfing',
          bullish: false,
          confidence: 75,
          description: 'Strong reversal signal - sellers overwhelmed buyers'
        });
      }

      // Doji
      const body = Math.abs(curr.close - curr.open);
      const range = curr.high - curr.low;
      if (body < range * 0.1) {
        patterns.push({
          name: 'Doji',
          bullish: false,
          confidence: 60,
          description: 'Indecision - potential reversal ahead'
        });
      }
    }

    return patterns.slice(0, 2); // Max 2 patterns per update
  }

  private checkKeyLevels(
    data: ChartDataPoint[],
    latest: ChartDataPoint,
    pair: Pair
  ): AIFeedItem | null {
    const recent50 = data.slice(-50);
    const highs = recent50.map(d => d.high);
    const lows = recent50.map(d => d.low);
    
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    const distanceToResistance = ((resistance - latest.close) / latest.close) * 100;
    const distanceToSupport = ((latest.close - support) / latest.close) * 100;

    if (distanceToResistance < 1 && distanceToResistance > 0) {
      return {
        id: `level_${pair.id}_${Date.now()}`,
        type: 'alert',
        severity: 'high',
        title: '🎯 Approaching Resistance',
        description: `${pair.name} testing resistance at $${resistance.toFixed(2)} - watch for breakout or rejection`,
        pair: pair.name,
        timestamp: Date.now(),
        actionable: true,
        actions: [
          { label: 'Analyze', action: 'ask_levels' },
          { label: 'Set Alert', action: 'set_alert' }
        ]
      };
    }

    if (distanceToSupport < 1 && distanceToSupport > 0) {
      return {
        id: `level_${pair.id}_${Date.now()}`,
        type: 'alert',
        severity: 'high',
        title: '🎯 Approaching Support',
        description: `${pair.name} testing support at $${support.toFixed(2)} - watch for bounce or breakdown`,
        pair: pair.name,
        timestamp: Date.now(),
        actionable: true,
        actions: [
          { label: 'Analyze', action: 'ask_levels' },
          { label: 'Set Alert', action: 'set_alert' }
        ]
      };
    }

    return null;
  }

  private checkMACDCrossover(data: ChartDataPoint[], pair: Pair): AIFeedItem | null {
    if (data.length < 2) return null;

    const latest = data[data.length - 1];
    const prev = data[data.length - 2];

    if (!latest.macd || !latest.macdSignal || !prev.macd || !prev.macdSignal) {
      return null;
    }

    const isBullishCross = prev.macd < prev.macdSignal && latest.macd > latest.macdSignal;
    const isBearishCross = prev.macd > prev.macdSignal && latest.macd < latest.macdSignal;

    if (isBullishCross) {
      return {
        id: `macd_${pair.id}_${Date.now()}`,
        type: 'momentum',
        severity: 'high',
        title: '🟢 MACD Bullish Crossover',
        description: `${pair.name} MACD crossed above signal - bullish momentum building`,
        pair: pair.name,
        timestamp: Date.now(),
        actionable: true,
        actions: [
          { label: 'Entry Analysis', action: 'ask_buy' },
          { label: 'Explain MACD', action: 'explain_macd' }
        ]
      };
    }

    if (isBearishCross) {
      return {
        id: `macd_${pair.id}_${Date.now()}`,
        type: 'momentum',
        severity: 'medium',
        title: '🔴 MACD Bearish Crossover',
        description: `${pair.name} MACD crossed below signal - bearish momentum building`,
        pair: pair.name,
        timestamp: Date.now(),
        actionable: true,
        actions: [
          { label: 'Exit Strategy', action: 'ask_sell' },
          { label: 'Explain MACD', action: 'explain_macd' }
        ]
      };
    }

    return null;
  }

  private checkVolume(
    data: ChartDataPoint[],
    latest: ChartDataPoint,
    pair: Pair
  ): AIFeedItem | null {
    const recent20 = data.slice(-20);
    const avgVolume = recent20.reduce((sum, d) => sum + d.volume, 0) / recent20.length;
    const volumeRatio = latest.volume / avgVolume;

    if (volumeRatio > 2) {
      return {
        id: `volume_${pair.id}_${Date.now()}`,
        type: 'volume',
        severity: 'high',
        title: '🔥 Volume Spike Detected',
        description: `${pair.name} volume ${((volumeRatio - 1) * 100).toFixed(0)}% above average - strong conviction`,
        pair: pair.name,
        timestamp: Date.now(),
        actionable: true,
        actions: [
          { label: 'Analyze', action: 'ask_volume' },
          { label: 'What It Means', action: 'explain_volume' }
        ]
      };
    }

    return null;
  }

  private getEducationalTip(
    trend: any,
    momentum: any,
    latest: ChartDataPoint
  ): AIFeedItem | null {
    const tips = [
      {
        title: '💡 Trading Tip: Trend is Your Friend',
        description: 'Trading with the trend has higher probability than counter-trend. Always check higher timeframe direction.',
        condition: () => true
      },
      {
        title: '💡 Risk Management: The 2% Rule',
        description: 'Never risk more than 2% of your account on a single trade. Position size = (Account × 2%) ÷ Stop Loss distance.',
        condition: () => true
      },
      {
        title: '💡 Support Becomes Resistance',
        description: 'When support breaks, it often becomes new resistance. The opposite is also true - old resistance becomes support.',
        condition: () => true
      },
      {
        title: '💡 Volume Confirms Price',
        description: 'Rising prices with rising volume = healthy trend. Rising prices with falling volume = weak trend likely to reverse.',
        condition: () => true
      },
      {
        title: '💡 RSI Divergence Signal',
        description: 'When price makes new high but RSI makes lower high, it\'s bearish divergence - potential reversal ahead.',
        condition: () => latest.rsi !== null && latest.rsi !== undefined
      },
      {
        title: '💡 MACD Histogram Insight',
        description: 'MACD histogram shows momentum strength. When histogram bars get smaller, momentum is fading.',
        condition: () => latest.macd !== null
      },
      {
        title: '💡 Bollinger Band Squeeze',
        description: 'When Bollinger Bands narrow (squeeze), it signals low volatility. Big moves often follow.',
        condition: () => latest.bbUpper !== null
      }
    ];

    const validTips = tips.filter(t => t.condition());
    if (validTips.length === 0) return null;

    const randomTip = validTips[Math.floor(Math.random() * validTips.length)];

    return {
      id: `tip_${Date.now()}`,
      type: 'education',
      severity: 'low',
      title: randomTip.title,
      description: randomTip.description,
      pair: 'General',
      timestamp: Date.now(),
      actionable: false
    };
  }
}

// Singleton instance
export const aiTradingFeed = new AITradingFeedGenerator();
