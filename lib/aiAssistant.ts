import type { ChartDataPoint, Pair, Interval } from '../types';
import { analyzeTrendStructure, analyzeMomentum, analyzeVolatility } from './chartSummaryEngine';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface AIContext {
  chartData: ChartDataPoint[];
  pair: Pair;
  interval: Interval;
  latestPrice: number;
}

interface PatternDetection {
  name: string;
  bullish: boolean;
  confidence: number;
  description: string;
}

interface PriceTarget {
  target: number;
  probability: number;
  timeframe: string;
  reasoning: string;
}

/**
 * Enhanced Local AI Assistant - No API calls required
 * Uses advanced rule-based analysis and pattern recognition
 */
export class LocalAIAssistant {
  private context: AIContext | null = null;
  private conversationHistory: AIMessage[] = [];

  setContext(context: AIContext) {
    this.context = context;
  }

  addToHistory(message: AIMessage) {
    this.conversationHistory.push(message);
    // Keep last 10 messages for context
    if (this.conversationHistory.length > 10) {
      this.conversationHistory.shift();
    }
  }

  /**
   * Main method to get AI response based on user query
   */
  generateResponse(query: string): string {
    if (!this.context || this.context.chartData.length < 50) {
      return "📊 I need more data to analyze. Please wait for the chart to load...";
    }

    const lowerQuery = query.toLowerCase();

    // Context-aware responses based on conversation history
    if (this.conversationHistory.length > 0) {
      const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
      if (lastMessage.role === 'user' && this.matchesIntent(lowerQuery, ['why', 'explain', 'how', 'tell me more'])) {
        return this.expandOnPreviousResponse(lastMessage.content);
      }
    }

    // Intent detection with enhanced coverage
    if (this.matchesIntent(lowerQuery, ['buy', 'entry', 'enter', 'purchase', 'long'])) {
      return this.analyzeBuyOpportunity();
    }
    
    if (this.matchesIntent(lowerQuery, ['sell', 'exit', 'take profit', 'close', 'short'])) {
      return this.analyzeSellOpportunity();
    }
    
    if (this.matchesIntent(lowerQuery, ['trend', 'direction', 'going', 'momentum'])) {
      return this.analyzeTrend();
    }
    
    if (this.matchesIntent(lowerQuery, ['risk', 'safe', 'danger', 'risky', 'volatile'])) {
      return this.analyzeRisk();
    }
    
    if (this.matchesIntent(lowerQuery, ['support', 'resistance', 'level', 'floor', 'ceiling'])) {
      return this.findSupportResistance();
    }
    
    if (this.matchesIntent(lowerQuery, ['volume', 'liquidity', 'trading activity'])) {
      return this.analyzeVolumeContext();
    }
    
    if (this.matchesIntent(lowerQuery, ['rsi', 'overbought', 'oversold', 'relative strength'])) {
      return this.analyzeRSI();
    }
    
    if (this.matchesIntent(lowerQuery, ['macd', 'momentum', 'moving average convergence'])) {
      return this.analyzeMACDContext();
    }

    if (this.matchesIntent(lowerQuery, ['pattern', 'candle', 'formation', 'setup'])) {
      return this.detectPatterns();
    }

    if (this.matchesIntent(lowerQuery, ['predict', 'forecast', 'target', 'price target', 'where'])) {
      return this.generatePricePrediction();
    }

    if (this.matchesIntent(lowerQuery, ['divergence', 'hidden', 'bullish divergence', 'bearish divergence'])) {
      return this.analyzeDivergences();
    }

    if (this.matchesIntent(lowerQuery, ['timeframe', 'multi-timeframe', 'higher timeframe', 'bigger picture'])) {
      return this.multiTimeframeAnalysis();
    }

    if (this.matchesIntent(lowerQuery, ['sentiment', 'market sentiment', 'fear', 'greed'])) {
      return this.analyzeMarketSentiment();
    }

    if (this.matchesIntent(lowerQuery, ['summary', 'overview', 'analysis', 'what'])) {
      return this.generateOverview();
    }

    // Educational responses
    if (this.matchesIntent(lowerQuery, ['explain', 'what is', 'how does', 'teach', 'learn'])) {
      return this.provideEducation(lowerQuery);
    }

    // Strategy-related queries
    if (this.matchesIntent(lowerQuery, ['strategy', 'plan', 'approach', 'what should i do'])) {
      return this.suggestStrategy();
    }

    // Default intelligent response
    return this.generateContextualResponse(lowerQuery);
  }

  private matchesIntent(query: string, keywords: string[]): boolean {
    return keywords.some(keyword => query.includes(keyword));
  }

  private expandOnPreviousResponse(previousQuery: string): string {
    // Provide more details based on previous question
    if (previousQuery.includes('buy')) {
      return this.provideDetailedBuyStrategy();
    }
    if (previousQuery.includes('sell')) {
      return this.provideDetailedSellStrategy();
    }
    return "I can provide more details about any aspect. What would you like to know more about?";
  }

  private detectPatterns(): string {
    const { chartData, pair } = this.context!;
    const patterns = this.findCandlestickPatterns(chartData);

    let response = `🔍 **${pair.name} Pattern Detection**\n\n`;

    if (patterns.length === 0) {
      response += `No significant patterns detected in the last 20 candles.\n\n`;
      response += `I'm watching for:\n`;
      response += `• Engulfing patterns\n`;
      response += `• Doji formations\n`;
      response += `• Hammer/Shooting Star\n`;
      response += `• Morning/Evening Star\n`;
      response += `• Three White Soldiers/Black Crows\n`;
    } else {
      response += `**Active Patterns Found:**\n\n`;
      patterns.forEach(pattern => {
        const emoji = pattern.bullish ? '🟢' : '🔴';
        response += `${emoji} **${pattern.name}** (${pattern.confidence}% confidence)\n`;
        response += `${pattern.description}\n\n`;
      });

      // Provide actionable advice
      const bullishPatterns = patterns.filter(p => p.bullish);
      const bearishPatterns = patterns.filter(p => p.bullish === false);

      if (bullishPatterns.length > bearishPatterns.length) {
        response += `💡 **Interpretation**: Multiple bullish patterns suggest upward pressure.\n`;
        response += `Consider waiting for confirmation before entering.\n`;
      } else if (bearishPatterns.length > bullishPatterns.length) {
        response += `⚠️ **Interpretation**: Multiple bearish patterns suggest downward pressure.\n`;
        response += `Consider protective stops or waiting on sidelines.\n`;
      } else {
        response += `⚖️ **Interpretation**: Mixed signals. Market is undecided.\n`;
        response += `Wait for clearer direction.\n`;
      }
    }

    return response;
  }

  private findCandlestickPatterns(data: ChartDataPoint[]): PatternDetection[] {
    const patterns: PatternDetection[] = [];
    const recent = data.slice(-20);

    for (let i = 2; i < recent.length; i++) {
      const curr = recent[i];
      const prev = recent[i - 1];
      const prev2 = recent[i - 2];

      // Bullish Engulfing
      if (prev.close < prev.open && curr.close > curr.open &&
          curr.close > prev.open && curr.open < prev.close) {
        patterns.push({
          name: 'Bullish Engulfing',
          bullish: true,
          confidence: 75,
          description: 'Strong reversal pattern - buyers overwhelmed sellers'
        });
      }

      // Bearish Engulfing
      if (prev.close > prev.open && curr.close < curr.open &&
          curr.close < prev.open && curr.open > prev.close) {
        patterns.push({
          name: 'Bearish Engulfing',
          bullish: false,
          confidence: 75,
          description: 'Strong reversal pattern - sellers overwhelmed buyers'
        });
      }

      // Hammer (bullish reversal at bottom)
      const body = Math.abs(curr.close - curr.open);
      const lowerWick = Math.min(curr.open, curr.close) - curr.low;
      const upperWick = curr.high - Math.max(curr.open, curr.close);
      
      if (lowerWick > body * 2 && upperWick < body * 0.5 && i > 10) {
        const isAtBottom = curr.low < Math.min(...recent.slice(0, i).map(d => d.low));
        if (isAtBottom) {
          patterns.push({
            name: 'Hammer',
            bullish: true,
            confidence: 70,
            description: 'Potential bottom - buyers rejected lower prices'
          });
        }
      }

      // Shooting Star (bearish reversal at top)
      if (upperWick > body * 2 && lowerWick < body * 0.5 && i > 10) {
        const isAtTop = curr.high > Math.max(...recent.slice(0, i).map(d => d.high));
        if (isAtTop) {
          patterns.push({
            name: 'Shooting Star',
            bullish: false,
            confidence: 70,
            description: 'Potential top - sellers rejected higher prices'
          });
        }
      }

      // Doji (indecision)
      if (body < (curr.high - curr.low) * 0.1) {
        patterns.push({
          name: 'Doji',
          bullish: false, // Neutral but often precedes reversals
          confidence: 60,
          description: 'Indecision - market is at a crossroads'
        });
      }

      // Morning Star (bullish reversal - 3 candles)
      if (i >= 2) {
        const isDowntrend = prev2.close < prev2.open;
        const isSmallMiddle = Math.abs(prev.close - prev.open) < Math.abs(prev2.close - prev2.open) * 0.3;
        const isBullishLast = curr.close > curr.open && curr.close > (prev2.open + prev2.close) / 2;
        
        if (isDowntrend && isSmallMiddle && isBullishLast) {
          patterns.push({
            name: 'Morning Star',
            bullish: true,
            confidence: 80,
            description: 'Strong 3-candle reversal - trend change likely'
          });
        }
      }
    }

    // Remove duplicates and keep highest confidence
    const uniquePatterns = Array.from(new Map(patterns.map(p => [p.name, p])).values());
    return uniquePatterns.slice(0, 5); // Top 5 patterns
  }

  private generatePricePrediction(): string {
    const { chartData, pair, latestPrice, interval } = this.context!;
    
    let response = `🔮 **${pair.name} Price Analysis & Targets**\n\n`;
    response += `💰 Current Price: $${latestPrice.toFixed(2)}\n`;
    response += `⏰ Timeframe: ${interval.id}\n\n`;

    const targets = this.calculatePriceTargets(chartData, latestPrice);
    
    response += `**Short-term Scenarios** (next ${this.getTimeframeDescription(interval)}):\n\n`;

    targets.forEach((target, idx) => {
      const emoji = target.target > latestPrice ? '📈' : '📉';
      const change = ((target.target - latestPrice) / latestPrice * 100).toFixed(2);
      response += `${emoji} **Target ${idx + 1}**: $${target.target.toFixed(2)} (${change}%)\n`;
      response += `   Probability: ${target.probability}%\n`;
      response += `   ${target.reasoning}\n\n`;
    });

    response += `⚠️ **Important Notes**:\n`;
    response += `• These are statistical projections, not guarantees\n`;
    response += `• Market can be influenced by unexpected events\n`;
    response += `• Always use stop losses\n`;
    response += `• Past performance doesn't guarantee future results\n`;

    return response;
  }

  private calculatePriceTargets(data: ChartDataPoint[], currentPrice: number): PriceTarget[] {
    const targets: PriceTarget[] = [];
    const latest = data[data.length - 1];
    const recent50 = data.slice(-50);

    // Calculate ATR (Average True Range) for volatility
    const tr = recent50.map((d, i) => {
      if (i === 0) return d.high - d.low;
      const prev = recent50[i - 1];
      return Math.max(
        d.high - d.low,
        Math.abs(d.high - prev.close),
        Math.abs(d.low - prev.close)
      );
    });
    const atr = tr.reduce((a, b) => a + b, 0) / tr.length;

    // Support and resistance levels
    const highs = recent50.map(d => d.high);
    const lows = recent50.map(d => d.low);
    const resistance = Math.max(...highs);
    const support = Math.min(...lows);

    // Trend-based targets
    const trend = analyzeTrendStructure(data);
    
    if (trend.primary === 'uptrend' || trend.primary === 'strong_uptrend') {
      // Bullish scenario
      targets.push({
        target: currentPrice + atr * 1.5,
        probability: 65,
        timeframe: 'near',
        reasoning: `Based on current uptrend and average volatility (ATR: ${atr.toFixed(2)})`
      });
      
      targets.push({
        target: resistance,
        probability: 55,
        timeframe: 'medium',
        reasoning: `Recent resistance at $${resistance.toFixed(2)} - breakout target`
      });
    } else if (trend.primary === 'downtrend' || trend.primary === 'strong_downtrend') {
      // Bearish scenario
      targets.push({
        target: currentPrice - atr * 1.5,
        probability: 65,
        timeframe: 'near',
        reasoning: `Based on current downtrend and average volatility (ATR: ${atr.toFixed(2)})`
      });
      
      targets.push({
        target: support,
        probability: 55,
        timeframe: 'medium',
        reasoning: `Recent support at $${support.toFixed(2)} - breakdown target`
      });
    } else {
      // Consolidation - both directions possible
      targets.push({
        target: currentPrice + atr,
        probability: 45,
        timeframe: 'near',
        reasoning: 'Upside breakout scenario from consolidation'
      });
      
      targets.push({
        target: currentPrice - atr,
        probability: 45,
        timeframe: 'near',
        reasoning: 'Downside breakdown scenario from consolidation'
      });
    }

    // Fibonacci extension
    if (latest.sma50) {
      const fibTarget = currentPrice + (currentPrice - latest.sma50) * 0.618;
      targets.push({
        target: fibTarget,
        probability: 40,
        timeframe: 'extended',
        reasoning: 'Fibonacci extension from 50 SMA'
      });
    }

    return targets.slice(0, 3); // Top 3 targets
  }

  private getTimeframeDescription(interval: Interval): string {
    const minutes = interval.minutes;
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${minutes / 60} hours`;
    return `${minutes / 1440} days`;
  }

  private analyzeDivergences(): string {
    const { chartData, pair } = this.context!;
    
    let response = `🔄 **${pair.name} Divergence Analysis**\n\n`;

    const divergences = this.findDivergences(chartData);

    if (divergences.length === 0) {
      response += `No significant divergences detected.\n\n`;
      response += `📚 **What is Divergence?**\n`;
      response += `When price and indicator move in opposite directions.\n`;
      response += `• Bullish: Price makes lower low, RSI makes higher low\n`;
      response += `• Bearish: Price makes higher high, RSI makes lower high\n`;
      response += `\nDivergences often signal trend reversals.\n`;
    } else {
      response += `**Divergences Found:**\n\n`;
      divergences.forEach(div => {
        response += `${div}\n\n`;
      });
    }

    return response;
  }

  private findDivergences(data: ChartDataPoint[]): string[] {
    const divergences: string[] = [];
    const recent = data.slice(-30);

    if (recent.length < 20) return divergences;

    // Find price highs/lows
    const priceHighs: number[] = [];
    const priceLows: number[] = [];
    const rsiHighs: number[] = [];
    const rsiLows: number[] = [];

    for (let i = 5; i < recent.length - 5; i++) {
      const slice = recent.slice(i - 5, i + 6);
      const prices = slice.map(d => d.close);
      const rsiValues = slice.map(d => d.rsi).filter((r): r is number => r !== null && r !== undefined);

      if (prices.length > 0 && recent[i].close === Math.max(...prices)) {
        priceHighs.push(recent[i].close);
        if (recent[i].rsi) rsiHighs.push(recent[i].rsi);
      }
      if (prices.length > 0 && recent[i].close === Math.min(...prices)) {
        priceLows.push(recent[i].close);
        if (recent[i].rsi) rsiLows.push(recent[i].rsi);
      }
    }

    // Check for bearish divergence (price higher high, RSI lower high)
    if (priceHighs.length >= 2 && rsiHighs.length >= 2) {
      const lastPriceHigh = priceHighs[priceHighs.length - 1];
      const prevPriceHigh = priceHighs[priceHighs.length - 2];
      const lastRsiHigh = rsiHighs[rsiHighs.length - 1];
      const prevRsiHigh = rsiHighs[rsiHighs.length - 2];

      if (lastPriceHigh > prevPriceHigh && lastRsiHigh < prevRsiHigh) {
        divergences.push(`🔴 **Bearish Divergence**: Price making higher highs but RSI making lower highs. Momentum weakening - possible reversal ahead.`);
      }
    }

    // Check for bullish divergence (price lower low, RSI higher low)
    if (priceLows.length >= 2 && rsiLows.length >= 2) {
      const lastPriceLow = priceLows[priceLows.length - 1];
      const prevPriceLow = priceLows[priceLows.length - 2];
      const lastRsiLow = rsiLows[rsiLows.length - 1];
      const prevRsiLow = rsiLows[rsiLows.length - 2];

      if (lastPriceLow < prevPriceLow && lastRsiLow > prevRsiLow) {
        divergences.push(`🟢 **Bullish Divergence**: Price making lower lows but RSI making higher lows. Selling pressure weakening - possible bounce ahead.`);
      }
    }

    return divergences;
  }

  private multiTimeframeAnalysis(): string {
    const { pair, interval } = this.context!;
    
    let response = `📊 **${pair.name} Multi-Timeframe Perspective**\n\n`;
    response += `Current Timeframe: ${interval.id}\n\n`;

    // Simulate higher timeframe analysis
    response += `**Timeframe Alignment:**\n\n`;
    
    response += `📈 **Higher Timeframe** (${this.getHigherTimeframe(interval)}):\n`;
    response += `Based on current momentum indicators, the higher timeframe appears to be in a ${this.simulateHigherTFTrend()}.\n\n`;

    response += `📊 **Current Timeframe** (${interval.id}):\n`;
    response += `You're viewing the detailed price action on this timeframe.\n\n`;

    response += `📉 **Lower Timeframe** (${this.getLowerTimeframe(interval)}):\n`;
    response += `Lower timeframes would show more granular entry/exit points.\n\n`;

    response += `💡 **Trading Wisdom**:\n`;
    response += `• Trade in direction of higher timeframe trend\n`;
    response += `• Use current timeframe for entries\n`;
    response += `• Use lower timeframe for precise timing\n`;
    response += `• "Trend is your friend" across timeframes\n`;

    return response;
  }

  private getHigherTimeframe(interval: Interval): string {
    const map: Record<string, string> = {
      '1m': '15m',
      '15m': '1h',
      '1h': '4h',
      '4h': '1D',
      '1D': '1W'
    };
    return map[interval.id] || 'Higher TF';
  }

  private getLowerTimeframe(interval: Interval): string {
    const map: Record<string, string> = {
      '15m': '1m',
      '1h': '15m',
      '4h': '1h',
      '1D': '4h',
      '1W': '1D'
    };
    return map[interval.id] || 'Lower TF';
  }

  private simulateHigherTFTrend(): string {
    const { chartData } = this.context!;
    const trend = analyzeTrendStructure(chartData);
    return trend.primary.replace('_', ' ');
  }

  private analyzeMarketSentiment(): string {
    const { chartData, pair } = this.context!;
    
    let response = `😊 **${pair.name} Market Sentiment**\n\n`;

    const sentiment = this.calculateSentiment(chartData);

    response += `**Sentiment Score**: ${sentiment.score}/100\n`;
    response += `**Market Mood**: ${sentiment.mood}\n\n`;

    response += `**Indicators:**\n`;
    sentiment.factors.forEach(factor => {
      response += `${factor}\n`;
    });

    response += `\n💡 **What This Means**:\n`;
    if (sentiment.score > 70) {
      response += `Market is very bullish. Watch for overbought conditions.\n`;
    } else if (sentiment.score > 50) {
      response += `Market is moderately bullish. Positive momentum present.\n`;
    } else if (sentiment.score > 30) {
      response += `Market is moderately bearish. Caution advised.\n`;
    } else {
      response += `Market is very bearish. May present contrarian opportunities.\n`;
    }

    return response;
  }

  private calculateSentiment(data: ChartDataPoint[]): {
    score: number;
    mood: string;
    factors: string[];
  } {
    let score = 50;
    const factors: string[] = [];
    const latest = data[data.length - 1];

    // RSI sentiment
    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi > 70) {
        score += 15;
        factors.push(`🔥 RSI overbought (${latest.rsi.toFixed(1)}) - Euphoric`);
      } else if (latest.rsi > 50) {
        score += 10;
        factors.push(`😊 RSI bullish (${latest.rsi.toFixed(1)}) - Optimistic`);
      } else if (latest.rsi < 30) {
        score -= 15;
        factors.push(`😰 RSI oversold (${latest.rsi.toFixed(1)}) - Fearful`);
      } else {
        score -= 10;
        factors.push(`😐 RSI bearish (${latest.rsi.toFixed(1)}) - Pessimistic`);
      }
    }

    // Trend sentiment
    const trend = analyzeTrendStructure(data);
    if (trend.primary.includes('up')) {
      score += 15;
      factors.push(`📈 Uptrend - Confident buyers`);
    } else if (trend.primary.includes('down')) {
      score -= 15;
      factors.push(`📉 Downtrend - Nervous sellers`);
    }

    // Volume sentiment
    const recent20 = data.slice(-20);
    const avgVolume = recent20.reduce((sum, d) => sum + d.volume, 0) / 20;
    if (latest.volume > avgVolume * 1.5) {
      score += 10;
      factors.push(`📊 High volume - Strong conviction`);
    }

    // MACD sentiment
    if (latest.macd && latest.macdSignal) {
      if (latest.macd > latest.macdSignal) {
        score += 10;
        factors.push(`↗️ MACD bullish - Positive momentum`);
      } else {
        score -= 10;
        factors.push(`↘️ MACD bearish - Negative momentum`);
      }
    }

    score = Math.max(0, Math.min(100, score));

    let mood = '';
    if (score > 80) mood = 'Extreme Greed 🤑';
    else if (score > 60) mood = 'Greed 😁';
    else if (score > 50) mood = 'Neutral-Bullish 🙂';
    else if (score > 40) mood = 'Neutral-Bearish 😕';
    else if (score > 20) mood = 'Fear 😨';
    else mood = 'Extreme Fear 😱';

    return { score, mood, factors };
  }

  private suggestStrategy(): string {
    const { chartData, pair, latestPrice } = this.context!;
    const trend = analyzeTrendStructure(chartData);
    const latest = chartData[chartData.length - 1];

    let response = `🎯 **${pair.name} Strategy Recommendation**\n\n`;
    response += `💰 Current Price: $${latestPrice.toFixed(2)}\n`;
    response += `📊 Market State: ${trend.primary.replace('_', ' ')}\n\n`;

    // Determine best strategy based on conditions
    if (trend.primary === 'strong_uptrend') {
      response += `**Recommended Strategy: Trend Following**\n\n`;
      response += `✅ **Entry**: Buy dips to support levels\n`;
      response += `✅ **Stop Loss**: Below recent swing low\n`;
      response += `✅ **Target**: Ride the trend, trail stops\n`;
      response += `✅ **Risk/Reward**: 1:3 or better\n\n`;
      response += `**Why**: Strong uptrends favor buying pullbacks.\n`;
    } else if (trend.primary === 'strong_downtrend') {
      response += `**Recommended Strategy: Stay Defensive**\n\n`;
      response += `❌ **Avoid**: New long positions\n`;
      response += `✅ **Consider**: Short positions (if experienced)\n`;
      response += `✅ **Or**: Wait on sidelines for reversal\n\n`;
      response += `**Why**: Don't catch falling knives.\n`;
    } else if (trend.primary === 'consolidation') {
      response += `**Recommended Strategy: Range Trading**\n\n`;
      response += `✅ **Buy**: Near support\n`;
      response += `✅ **Sell**: Near resistance\n`;
      response += `✅ **Stop Loss**: Tight stops outside range\n`;
      response += `✅ **Target**: Opposite side of range\n\n`;
      response += `**Why**: Price is bouncing between levels.\n`;
    } else {
      response += `**Recommended Strategy: Trend Reversal**\n\n`;
      response += `⚠️ **Watch for**: Reversal patterns\n`;
      response += `⚠️ **Wait for**: Confirmation before entry\n`;
      response += `✅ **Entry**: After break of structure\n\n`;
      response += `**Why**: Trend is weakening, reversal possible.\n`;
    }

    response += `\n📚 **General Rules**:\n`;
    response += `• Never risk more than 2% per trade\n`;
    response += `• Always use stop losses\n`;
    response += `• Have a plan before entering\n`;
    response += `• Let winners run, cut losers quickly\n`;

    return response;
  }

  private provideDetailedBuyStrategy(): string {
    let response = `📚 **Detailed Entry Strategy**\n\n`;
    response += `**Step-by-Step Process:**\n\n`;
    response += `1️⃣ **Confirm Direction**\n`;
    response += `   • Check higher timeframe trend\n`;
    response += `   • Ensure momentum is bullish\n`;
    response += `   • Look for bullish patterns\n\n`;
    response += `2️⃣ **Find Entry Zone**\n`;
    response += `   • Look for support levels\n`;
    response += `   • Wait for pullbacks in uptrends\n`;
    response += `   • Use limit orders at key levels\n\n`;
    response += `3️⃣ **Set Stop Loss**\n`;
    response += `   • Place below recent swing low\n`;
    response += `   • Give it room to breathe\n`;
    response += `   • Calculate position size from stop\n\n`;
    response += `4️⃣ **Define Target**\n`;
    response += `   • At least 2:1 reward:risk\n`;
    response += `   • Use resistance as target\n`;
    response += `   • Consider trailing stops\n\n`;
    response += `5️⃣ **Execute With Discipline**\n`;
    response += `   • Stick to your plan\n`;
    response += `   • Don't move stops further\n`;
    response += `   • Take profits at targets\n`;

    return response;
  }

  private provideDetailedSellStrategy(): string {
    let response = `📚 **Detailed Exit Strategy**\n\n`;
    response += `**When to Exit:**\n\n`;
    response += `✅ **Target Hit** - Take profits\n`;
    response += `✅ **Reversal Signal** - Close proactively\n`;
    response += `✅ **Stop Loss Hit** - Accept the loss\n`;
    response += `✅ **Time-based** - Exit if stalling\n\n`;
    response += `**Partial vs Full Exit:**\n`;
    response += `• Take 50% at first target\n`;
    response += `• Move stop to breakeven\n`;
    response += `• Let remaining run with trail\n\n`;
    response += `**Emotional Control:**\n`;
    response += `• Don't hope for recovery\n`;
    response += `• Don't fear missing out\n`;
    response += `• Follow your system\n`;
    response += `• Review trades objectively\n`;

    return response;
  }

  private generateContextualResponse(query: string): string {
    const { pair } = this.context!;
    
    return `🤔 I'm not sure I understand "${query}"\n\n` +
      `I can help you with:\n` +
      `• Trading decisions ("Should I buy?")\n` +
      `• Technical analysis ("What's the trend?")\n` +
      `• Market patterns ("Find patterns")\n` +
      `• Price predictions ("Where is price heading?")\n` +
      `• Risk assessment ("What's the risk?")\n` +
      `• Strategy advice ("What strategy should I use?")\n` +
      `• Education ("Explain RSI")\n\n` +
      `What would you like to know about ${pair.name}?`;
  }

  private analyzeBuyOpportunity(): string {
    const { chartData, pair, latestPrice } = this.context!;
    const trend = analyzeTrendStructure(chartData);
    const momentum = analyzeMomentum(chartData);
    const latest = chartData[chartData.length - 1];

    let response = `🤔 **${pair.name} Entry Analysis**\n\n`;
    response += `💰 Current Price: $${latestPrice.toFixed(2)}\n\n`;

    // Trend assessment
    if (trend.primary === 'strong_uptrend' || trend.primary === 'uptrend') {
      response += `✅ **Trend**: ${trend.primary.replace('_', ' ').toUpperCase()} (${trend.strength}% strength)\n`;
      response += `This is favorable for buying.\n\n`;
    } else if (trend.primary === 'consolidation') {
      response += `⚠️ **Trend**: CONSOLIDATION - Price is ranging\n`;
      response += `Consider waiting for a breakout direction.\n\n`;
    } else {
      response += `❌ **Trend**: ${trend.primary.replace('_', ' ').toUpperCase()}\n`;
      response += `Buying into a downtrend is risky. Wait for reversal signs.\n\n`;
    }

    // RSI assessment
    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi < 30) {
        response += `✅ **RSI**: ${latest.rsi.toFixed(1)} - OVERSOLD territory\n`;
        response += `Price may bounce soon. Good potential entry.\n\n`;
      } else if (latest.rsi < 50) {
        response += `✅ **RSI**: ${latest.rsi.toFixed(1)} - Below neutral\n`;
        response += `Room to move up before overbought.\n\n`;
      } else if (latest.rsi > 70) {
        response += `⚠️ **RSI**: ${latest.rsi.toFixed(1)} - OVERBOUGHT\n`;
        response += `Price may pull back. Consider waiting.\n\n`;
      } else {
        response += `📊 **RSI**: ${latest.rsi.toFixed(1)} - Neutral to bullish\n\n`;
      }
    }

    // Moving average position
    if (latest.sma50) {
      const priceVsSMA = ((latestPrice - latest.sma50) / latest.sma50) * 100;
      if (latestPrice > latest.sma50) {
        response += `✅ Price is ${priceVsSMA.toFixed(2)}% above SMA(50)\n`;
        response += `Bullish signal - price above key moving average.\n\n`;
      } else {
        response += `⚠️ Price is ${Math.abs(priceVsSMA).toFixed(2)}% below SMA(50)\n`;
        response += `Bearish signal - consider waiting for price to reclaim SMA.\n\n`;
      }
    }

    // Final recommendation
    const buyScore = this.calculateBuyScore(chartData, latest);
    
    if (buyScore >= 70) {
      response += `🟢 **Recommendation**: STRONG BUY SIGNAL (${buyScore}%)\n`;
      response += `Multiple indicators are bullish. Good entry opportunity.\n\n`;
      response += `💡 **Suggested Action**: Consider entering a position\n`;
      response += `🎯 **Stop Loss**: Set below recent support (~$${(latestPrice * 0.95).toFixed(2)})\n`;
    } else if (buyScore >= 50) {
      response += `🟡 **Recommendation**: MODERATE BUY (${buyScore}%)\n`;
      response += `Some bullish signals present. Proceed with caution.\n\n`;
      response += `💡 **Suggested Action**: Small position or wait for confirmation\n`;
    } else {
      response += `🔴 **Recommendation**: WAIT (${buyScore}%)\n`;
      response += `Not enough bullish signals. Better opportunities may come.\n\n`;
      response += `💡 **Suggested Action**: Stay on sidelines, watch for:\n`;
      response += `  • RSI to cool down below 50\n`;
      response += `  • Price to hold support\n`;
      response += `  • Trend reversal confirmation\n`;
    }

    response += `\n⚠️ **Remember**: This is educational analysis, not financial advice. Always do your own research and manage risk appropriately.`;

    return response;
  }

  private analyzeSellOpportunity(): string {
    const { chartData, pair, latestPrice } = this.context!;
    const latest = chartData[chartData.length - 1];

    let response = `🤔 **${pair.name} Exit Analysis**\n\n`;
    response += `💰 Current Price: $${latestPrice.toFixed(2)}\n\n`;

    // RSI for exit signals
    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi > 70) {
        response += `🔴 **RSI**: ${latest.rsi.toFixed(1)} - OVERBOUGHT\n`;
        response += `Price is extended. Consider taking profits.\n\n`;
      } else if (latest.rsi > 60) {
        response += `⚠️ **RSI**: ${latest.rsi.toFixed(1)} - Getting overbought\n`;
        response += `Watch for reversal signs.\n\n`;
      } else {
        response += `✅ **RSI**: ${latest.rsi.toFixed(1)} - Room for more upside\n\n`;
      }
    }

    const sellScore = this.calculateSellScore(chartData, latest);

    if (sellScore >= 70) {
      response += `🔴 **Recommendation**: STRONG SELL SIGNAL (${sellScore}%)\n`;
      response += `Consider taking profits or tightening stop loss.\n`;
    } else if (sellScore >= 50) {
      response += `🟡 **Recommendation**: PARTIAL EXIT (${sellScore}%)\n`;
      response += `Consider taking some profits off the table.\n`;
    } else {
      response += `🟢 **Recommendation**: HOLD (${sellScore}%)\n`;
      response += `Upside potential still present. Keep monitoring.\n`;
    }

    response += `\n\n⚠️ **Educational analysis only, not financial advice.**`;
    return response;
  }

  private analyzeTrend(): string {
    const { chartData, pair } = this.context!;
    const trend = analyzeTrendStructure(chartData);
    
    let response = `📊 **${pair.name} Trend Analysis**\n\n`;
    
    const trendEmoji = {
      'strong_uptrend': '🚀',
      'uptrend': '📈',
      'consolidation': '↔️',
      'downtrend': '📉',
      'strong_downtrend': '💥'
    };

    response += `${trendEmoji[trend.primary]} **Current Trend**: ${trend.primary.replace('_', ' ').toUpperCase()}\n`;
    response += `**Strength**: ${trend.strength}%\n`;
    response += `**Direction**: ${trend.direction > 50 ? 'Bullish' : trend.direction < -50 ? 'Bearish' : 'Neutral'}\n\n`;

    if (trend.primary === 'strong_uptrend') {
      response += `The market is in a strong uptrend. Dips may be buying opportunities.\n`;
    } else if (trend.primary === 'uptrend') {
      response += `The market is trending up. Look for pullbacks to support.\n`;
    } else if (trend.primary === 'consolidation') {
      response += `The market is consolidating. Wait for a breakout in either direction.\n`;
    } else if (trend.primary === 'downtrend') {
      response += `The market is trending down. Rallies may be selling opportunities.\n`;
    } else {
      response += `The market is in a strong downtrend. Avoid catching falling knives.\n`;
    }

    return response;
  }

  private analyzeRisk(): string {
    const { chartData, pair, latestPrice } = this.context!;
    const volatility = analyzeVolatility(chartData);
    const latest = chartData[chartData.length - 1];

    let response = `⚠️ **${pair.name} Risk Assessment**\n\n`;
    response += `**Volatility**: ${volatility.regime.toUpperCase()}\n`;
    response += `${volatility.description}\n\n`;

    // Calculate recent price swings
    const recent20 = chartData.slice(-20);
    const highs = recent20.map(d => d.high);
    const lows = recent20.map(d => d.low);
    const maxHigh = Math.max(...highs);
    const minLow = Math.min(...lows);
    const range = ((maxHigh - minLow) / minLow) * 100;

    response += `**Recent 20-candle range**: ${range.toFixed(2)}%\n\n`;

    if (volatility.regime === 'high') {
      response += `⚠️ **High volatility** means:\n`;
      response += `• Larger price swings\n`;
      response += `• Wider stop losses needed\n`;
      response += `• Potential for quick gains OR losses\n`;
      response += `• Best for experienced traders\n\n`;
    } else if (volatility.regime === 'low') {
      response += `✅ **Low volatility** means:\n`;
      response += `• More predictable price action\n`;
      response += `• Tighter stop losses possible\n`;
      response += `• May precede a big move\n`;
      response += `• Good for beginners\n\n`;
    }

    response += `💡 **Risk Management Tips**:\n`;
    response += `• Never risk more than 2% per trade\n`;
    response += `• Always use stop losses\n`;
    response += `• Position size based on volatility\n`;
    response += `• Don't overtrade\n`;

    return response;
  }

  private findSupportResistance(): string {
    const { chartData, pair, latestPrice } = this.context!;
    
    // Calculate support and resistance from recent price action
    const recent50 = chartData.slice(-50);
    const highs = recent50.map(d => d.high);
    const lows = recent50.map(d => d.low);
    
    const resistance1 = Math.max(...highs);
    const support1 = Math.min(...lows);
    
    // Find intermediate levels
    const sortedHighs = [...highs].sort((a, b) => b - a);
    const sortedLows = [...lows].sort((a, b) => a - b);
    
    const resistance2 = sortedHighs[Math.floor(sortedHighs.length * 0.25)];
    const support2 = sortedLows[Math.floor(sortedLows.length * 0.25)];

    let response = `📍 **${pair.name} Key Levels**\n\n`;
    response += `💰 Current Price: $${latestPrice.toFixed(2)}\n\n`;
    
    response += `**Resistance Levels**:\n`;
    response += `🔴 R1: $${resistance2.toFixed(2)} (+${((resistance2 - latestPrice) / latestPrice * 100).toFixed(2)}%)\n`;
    response += `🔴 R2: $${resistance1.toFixed(2)} (+${((resistance1 - latestPrice) / latestPrice * 100).toFixed(2)}%)\n\n`;
    
    response += `**Support Levels**:\n`;
    response += `🟢 S1: $${support2.toFixed(2)} (${((support2 - latestPrice) / latestPrice * 100).toFixed(2)}%)\n`;
    response += `🟢 S2: $${support1.toFixed(2)} (${((support1 - latestPrice) / latestPrice * 100).toFixed(2)}%)\n\n`;

    // Provide context
    const distanceToResistance = ((resistance2 - latestPrice) / latestPrice) * 100;
    const distanceToSupport = ((latestPrice - support2) / latestPrice) * 100;

    if (distanceToResistance < 2) {
      response += `⚠️ Price is near resistance - watch for rejection or breakout.\n`;
    } else if (distanceToSupport < 2) {
      response += `⚠️ Price is near support - watch for bounce or breakdown.\n`;
    } else {
      response += `📊 Price is between key levels - trading in the middle of the range.\n`;
    }

    return response;
  }

  private analyzeVolumeContext(): string {
    const { chartData, pair } = this.context!;
    const recent20 = chartData.slice(-20);
    const avgVolume = recent20.reduce((sum, d) => sum + d.volume, 0) / recent20.length;
    const latest = chartData[chartData.length - 1];
    const volumeRatio = latest.volume / avgVolume;

    let response = `📊 **${pair.name} Volume Analysis**\n\n`;
    response += `**Current Volume**: ${latest.volume.toLocaleString()}\n`;
    response += `**20-period Average**: ${avgVolume.toLocaleString()}\n`;
    response += `**Ratio**: ${volumeRatio.toFixed(2)}x average\n\n`;

    if (volumeRatio > 1.5) {
      response += `🔥 **High Volume Alert!**\n`;
      response += `Volume is ${((volumeRatio - 1) * 100).toFixed(0)}% above average.\n`;
      response += `This suggests strong conviction in the current move.\n`;
    } else if (volumeRatio < 0.7) {
      response += `😴 **Low Volume**\n`;
      response += `Volume is ${((1 - volumeRatio) * 100).toFixed(0)}% below average.\n`;
      response += `This suggests weak conviction. Moves may not sustain.\n`;
    } else {
      response += `📊 **Normal Volume**\n`;
      response += `Volume is near average. Standard price action.\n`;
    }

    return response;
  }

  private analyzeRSI(): string {
    const { chartData, pair } = this.context!;
    const latest = chartData[chartData.length - 1];

    let response = `📊 **${pair.name} RSI Analysis**\n\n`;

    if (latest.rsi === null || latest.rsi === undefined) {
      return response + `RSI data not available yet. Need more historical data.`;
    }

    response += `**Current RSI**: ${latest.rsi.toFixed(2)}\n\n`;

    if (latest.rsi > 70) {
      response += `🔴 **OVERBOUGHT** (>70)\n`;
      response += `The asset is overbought. Price may:\n`;
      response += `• Pull back to cool off\n`;
      response += `• Continue higher in strong trends\n`;
      response += `• Form a divergence signaling reversal\n\n`;
      response += `💡 Action: Consider taking profits or waiting for pullback.\n`;
    } else if (latest.rsi > 60) {
      response += `🟡 **Strong** (60-70)\n`;
      response += `Momentum is bullish but approaching overbought.\n`;
      response += `Watch for signs of exhaustion.\n`;
    } else if (latest.rsi > 50) {
      response += `🟢 **Bullish** (50-60)\n`;
      response += `Healthy bullish momentum with room to run.\n`;
      response += `Good conditions for holding positions.\n`;
    } else if (latest.rsi > 40) {
      response += `🟠 **Neutral** (40-50)\n`;
      response += `Momentum is neutral. Wait for direction.\n`;
    } else if (latest.rsi > 30) {
      response += `🔵 **Bearish** (30-40)\n`;
      response += `Momentum is bearish but not yet oversold.\n`;
      response += `May continue lower before bounce.\n`;
    } else {
      response += `🟢 **OVERSOLD** (<30)\n`;
      response += `The asset is oversold. Price may:\n`;
      response += `• Bounce higher soon\n`;
      response += `• Continue lower in strong downtrends\n`;
      response += `• Form a divergence signaling reversal\n\n`;
      response += `💡 Action: Watch for reversal signals and potential bounce.\n`;
    }

    return response;
  }

  private analyzeMACDContext(): string {
    const { chartData, pair } = this.context!;
    const latest = chartData[chartData.length - 1];
    const prev = chartData[chartData.length - 2];

    let response = `📊 **${pair.name} MACD Analysis**\n\n`;

    if (!latest.macd || !latest.macdSignal) {
      return response + `MACD data not available yet.`;
    }

    const isBullishCross = prev.macd! < prev.macdSignal! && latest.macd > latest.macdSignal;
    const isBearishCross = prev.macd! > prev.macdSignal! && latest.macd < latest.macdSignal;

    response += `**MACD**: ${latest.macd.toFixed(4)}\n`;
    response += `**Signal**: ${latest.macdSignal.toFixed(4)}\n`;
    response += `**Histogram**: ${latest.macdHist?.toFixed(4) || 'N/A'}\n\n`;

    if (isBullishCross) {
      response += `🟢 **BULLISH CROSSOVER!**\n`;
      response += `MACD just crossed above signal line.\n`;
      response += `This is a bullish momentum signal.\n`;
    } else if (isBearishCross) {
      response += `🔴 **BEARISH CROSSOVER!**\n`;
      response += `MACD just crossed below signal line.\n`;
      response += `This is a bearish momentum signal.\n`;
    } else if (latest.macd > latest.macdSignal) {
      response += `🟢 **Bullish**\n`;
      response += `MACD is above signal line.\n`;
      response += `Momentum is positive.\n`;
    } else {
      response += `🔴 **Bearish**\n`;
      response += `MACD is below signal line.\n`;
      response += `Momentum is negative.\n`;
    }

    return response;
  }

  private generateOverview(): string {
    const { chartData, pair, interval, latestPrice } = this.context!;
    const trend = analyzeTrendStructure(chartData);
    const momentum = analyzeMomentum(chartData);
    const latest = chartData[chartData.length - 1];

    let response = `📊 **${pair.name} Market Overview**\n`;
    response += `⏰ Timeframe: ${interval.id}\n`;
    response += `💰 Price: $${latestPrice.toFixed(2)}\n\n`;

    response += `**Trend**: ${trend.primary.replace('_', ' ')} (${trend.strength}%)\n`;
    response += `**Momentum**: ${momentum.momentum}\n\n`;

    if (latest.rsi) {
      response += `**RSI**: ${latest.rsi.toFixed(1)}\n`;
    }

    response += `\n💡 **Quick Tips**:\n`;
    response += `• Ask "should I buy?" for entry analysis\n`;
    response += `• Ask "what's the trend?" for trend info\n`;
    response += `• Ask "show me support/resistance" for key levels\n`;
    response += `• Ask "what's the risk?" for risk assessment\n\n`;

    response += `⚠️ This is educational analysis, not financial advice.`;

    return response;
  }

  private provideEducation(query: string): string {
    const topics: Record<string, string> = {
      'rsi': `📚 **RSI (Relative Strength Index)**\n\n` +
        `Measures momentum from 0 to 100.\n` +
        `• Above 70: Overbought (may reverse down)\n` +
        `• Below 30: Oversold (may reverse up)\n` +
        `• 50: Neutral zone\n\n` +
        `💡 Pro Tip: In uptrends, RSI can stay overbought for extended periods. Look for divergences for stronger signals.\n\n` +
        `**How to Trade It:**\n` +
        `• Buy when RSI exits oversold (crosses above 30)\n` +
        `• Sell when RSI enters overbought (crosses above 70)\n` +
        `• Watch for hidden divergences in trends`,
      
      'macd': `📚 **MACD (Moving Average Convergence Divergence)**\n\n` +
        `Shows relationship between 12-period and 26-period EMAs.\n` +
        `• MACD Line > Signal: Bullish momentum\n` +
        `• MACD Line < Signal: Bearish momentum\n` +
        `• Crossovers signal trend changes\n` +
        `• Histogram shows momentum strength\n\n` +
        `💡 Pro Tip: MACD works best in trending markets. In consolidation, it generates false signals.\n\n` +
        `**How to Trade It:**\n` +
        `• Buy on bullish crossover (MACD crosses above signal)\n` +
        `• Sell on bearish crossover (MACD crosses below signal)\n` +
        `• Use histogram for early warnings`,
      
      'support': `📚 **Support & Resistance**\n\n` +
        `Key price levels where supply and demand balance changes.\n` +
        `• Support: Price floor where buyers step in\n` +
        `• Resistance: Price ceiling where sellers appear\n` +
        `• Break above resistance = bullish (new support)\n` +
        `• Break below support = bearish (new resistance)\n\n` +
        `💡 Pro Tip: "Old resistance becomes new support" - This is called role reversal.\n\n` +
        `**How to Find Them:**\n` +
        `• Look for multiple touches of same price\n` +
        `• Previous swing highs = resistance\n` +
        `• Previous swing lows = support\n` +
        `• Psychological round numbers (e.g., $50,000)`,

      'resistance': `📚 **Support & Resistance**\n\n` +
        `Key price levels where supply and demand balance changes.\n` +
        `• Support: Price floor where buyers step in\n` +
        `• Resistance: Price ceiling where sellers appear\n` +
        `• Break above resistance = bullish\n` +
        `• Break below support = bearish\n\n` +
        `💡 Pro Tip: More touches = stronger level. Volume confirms breakouts.`,
      
      'fibonacci': `📚 **Fibonacci Retracement**\n\n` +
        `Uses mathematical golden ratio to find reversal levels.\n` +
        `• Key levels: 23.6%, 38.2%, 50%, 61.8%, 78.6%\n` +
        `• Price often retraces to these levels before continuing\n` +
        `• 61.8% is the "golden ratio" - most significant\n` +
        `• 50% is not a Fib number but psychologically important\n\n` +
        `💡 Pro Tip: Combine with support/resistance for confluence.\n\n` +
        `**How to Use:**\n` +
        `• Draw from swing low to swing high (uptrend)\n` +
        `• Draw from swing high to swing low (downtrend)\n` +
        `• Buy near retracement levels in uptrends\n` +
        `• Sell near retracement levels in downtrends`,

      'bollinger': `📚 **Bollinger Bands**\n\n` +
        `Volatility bands around a moving average.\n` +
        `• Upper band: 2 standard deviations above SMA\n` +
        `• Lower band: 2 standard deviations below SMA\n` +
        `• Price at upper band = overbought\n` +
        `• Price at lower band = oversold\n\n` +
        `💡 Pro Tip: Band squeeze (narrow bands) often precedes big moves.\n\n` +
        `**Trading Strategies:**\n` +
        `• Buy at lower band, sell at upper band (range)\n` +
        `• Breakout when price closes outside bands\n` +
        `• W-bottom at lower band = bullish reversal\n` +
        `• M-top at upper band = bearish reversal`,

      'ichimoku': `📚 **Ichimoku Cloud**\n\n` +
        `Complete trading system with multiple components.\n` +
        `• Conversion Line (Tenkan): 9-period midpoint\n` +
        `• Base Line (Kijun): 26-period midpoint\n` +
        `• Cloud (Kumo): Future support/resistance\n` +
        `• Price above cloud = bullish\n` +
        `• Price below cloud = bearish\n\n` +
        `💡 Pro Tip: When conversion line crosses above base line (Tenkan/Kijun cross) = strong buy signal.\n\n` +
        `**Cloud Colors:**\n` +
        `• Green cloud = bullish (Leading Span A > Leading Span B)\n` +
        `• Red cloud = bearish (Leading Span A < Leading Span B)`,

      'stochastic': `📚 **Stochastic Oscillator**\n\n` +
        `Momentum indicator comparing closing price to price range.\n` +
        `• Range: 0 to 100\n` +
        `• Above 80: Overbought\n` +
        `• Below 20: Oversold\n` +
        `• %K line: Fast line\n` +
        `• %D line: Slow line (signal)\n\n` +
        `💡 Pro Tip: Wait for %K to cross above %D while both are below 20 for best buy signals.\n\n` +
        `**Trading Signals:**\n` +
        `• Bullish: %K crosses above %D in oversold\n` +
        `• Bearish: %K crosses below %D in overbought\n` +
        `• Divergences signal reversals`,

      'volume': `📚 **Volume Analysis**\n\n` +
        `Number of shares/contracts traded in a period.\n` +
        `• High volume = strong conviction\n` +
        `• Low volume = weak conviction\n` +
        `• Volume confirms price moves\n` +
        `• Breakouts need volume to sustain\n\n` +
        `💡 Pro Tip: "Volume precedes price" - watch for volume spikes before big moves.\n\n` +
        `**Key Patterns:**\n` +
        `• Climax volume = potential reversal\n` +
        `• Rising price + rising volume = healthy trend\n` +
        `• Rising price + falling volume = weak trend\n` +
        `• Volume at support/resistance = key test`,

      'trend': `📚 **Trend Trading**\n\n` +
        `The most important concept: "Trend is your friend."\n` +
        `• Uptrend: Higher highs, higher lows\n` +
        `• Downtrend: Lower highs, lower lows\n` +
        `• Consolidation: Sideways movement\n\n` +
        `💡 Pro Tip: Trade with the trend, not against it. The trend is more likely to continue than reverse.\n\n` +
        `**How to Trade:**\n` +
        `• Buy dips in uptrends\n` +
        `• Sell rallies in downtrends\n` +
        `• Wait on sidelines in consolidation\n` +
        `• Use moving averages to identify trends`,

      'divergence': `📚 **Divergence**\n\n` +
        `When price and indicator move in opposite directions.\n\n` +
        `**Regular Divergence** (reversal signal):\n` +
        `• Bullish: Price lower low, RSI higher low\n` +
        `• Bearish: Price higher high, RSI lower high\n\n` +
        `**Hidden Divergence** (continuation signal):\n` +
        `• Bullish: Price higher low, RSI lower low (in uptrend)\n` +
        `• Bearish: Price lower high, RSI higher high (in downtrend)\n\n` +
        `💡 Pro Tip: Divergences work best on longer timeframes (4H, Daily).`,

      'risk management': `📚 **Risk Management**\n\n` +
        `The MOST IMPORTANT aspect of trading.\n\n` +
        `**Golden Rules:**\n` +
        `1. Never risk more than 2% per trade\n` +
        `2. Always use stop losses\n` +
        `3. Position size = Account Size × 2% ÷ (Entry - Stop Loss)\n` +
        `4. Risk/Reward ratio minimum 1:2 (better 1:3)\n` +
        `5. Don't overtrade - quality over quantity\n\n` +
        `💡 Pro Tip: Professional traders focus on NOT LOSING rather than winning. Capital preservation is key.\n\n` +
        `**Psychology:**\n` +
        `• Cut losses quickly\n` +
        `• Let winners run\n` +
        `• Don't revenge trade\n` +
        `• Keep a trading journal`,

      'stop loss': `📚 **Stop Loss**\n\n` +
        `An order that closes your position at a predetermined price.\n\n` +
        `**Why Crucial:**\n` +
        `• Limits losses to acceptable levels\n` +
        `• Removes emotion from trading\n` +
        `• Protects capital\n\n` +
        `**Where to Place:**\n` +
        `• Below support for longs\n` +
        `• Above resistance for shorts\n` +
        `• Based on ATR (2x ATR typical)\n` +
        `• Never move stop loss further away\n\n` +
        `💡 Pro Tip: If you can't afford the stop loss, don't take the trade. Position size correctly.`,

      'position sizing': `📚 **Position Sizing**\n\n` +
        `How much to invest in each trade.\n\n` +
        `**Formula:**\n` +
        `Position Size = (Account × Risk %) ÷ (Entry Price - Stop Loss Price)\n\n` +
        `**Example:**\n` +
        `• $10,000 account\n` +
        `• 2% risk = $200\n` +
        `• Entry at $100, Stop at $95\n` +
        `• Position = $200 ÷ $5 = 40 shares\n\n` +
        `💡 Pro Tip: Never let a winning trade become a losing trade. Move stop to breakeven once in profit.`
    };

    for (const [key, explanation] of Object.entries(topics)) {
      if (query.includes(key)) {
        return explanation;
      }
    }

    return `📚 **Learning Resources**\n\n` +
      `I can explain any of these topics:\n\n` +
      `**Technical Indicators:**\n` +
      `• RSI - Momentum oscillator\n` +
      `• MACD - Trend momentum\n` +
      `• Bollinger Bands - Volatility\n` +
      `• Stochastic - Overbought/oversold\n` +
      `• Ichimoku Cloud - Complete system\n\n` +
      `**Concepts:**\n` +
      `• Support & Resistance\n` +
      `• Fibonacci Retracements\n` +
      `• Volume Analysis\n` +
      `• Trend Trading\n` +
      `• Divergence\n\n` +
      `**Risk Management:**\n` +
      `• Stop Loss placement\n` +
      `• Position Sizing\n` +
      `• Risk/Reward ratios\n\n` +
      `Just ask "Explain [topic]" for detailed information!\n` +
      `Example: "Explain MACD" or "Explain risk management"`;
  }

  private calculateBuyScore(chartData: ChartDataPoint[], latest: ChartDataPoint): number {
    let score = 50; // Base score

    // Trend
    const trend = analyzeTrendStructure(chartData);
    if (trend.primary === 'strong_uptrend') score += 20;
    else if (trend.primary === 'uptrend') score += 10;
    else if (trend.primary === 'downtrend') score -= 10;
    else if (trend.primary === 'strong_downtrend') score -= 20;

    // RSI
    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi < 30) score += 15;
      else if (latest.rsi < 50) score += 10;
      else if (latest.rsi > 70) score -= 15;
    }

    // Price vs SMA
    if (latest.sma50 && latest.close > latest.sma50) score += 10;
    else if (latest.sma50) score -= 10;

    // MACD
    if (latest.macd && latest.macdSignal && latest.macd > latest.macdSignal) score += 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateSellScore(chartData: ChartDataPoint[], latest: ChartDataPoint): number {
    let score = 50;

    const trend = analyzeTrendStructure(chartData);
    if (trend.primary === 'strong_downtrend') score += 20;
    else if (trend.primary === 'downtrend') score += 10;
    else if (trend.primary === 'uptrend') score -= 10;
    else if (trend.primary === 'strong_uptrend') score -= 20;

    if (latest.rsi !== null && latest.rsi !== undefined) {
      if (latest.rsi > 70) score += 15;
      else if (latest.rsi > 60) score += 10;
      else if (latest.rsi < 40) score -= 10;
    }

    if (latest.sma50 && latest.close < latest.sma50) score += 10;

    if (latest.macd && latest.macdSignal && latest.macd < latest.macdSignal) score += 10;

    return Math.max(0, Math.min(100, score));
  }
}
