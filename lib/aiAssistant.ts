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

/**
 * Local AI Assistant - No API calls required
 * Uses rule-based analysis and your existing technical analysis
 */
export class LocalAIAssistant {
  private context: AIContext | null = null;

  setContext(context: AIContext) {
    this.context = context;
  }

  /**
   * Main method to get AI response based on user query
   */
  generateResponse(query: string): string {
    if (!this.context || this.context.chartData.length < 50) {
      return "📊 I need more data to analyze. Please wait for the chart to load...";
    }

    const lowerQuery = query.toLowerCase();

    // Intent detection
    if (this.matchesIntent(lowerQuery, ['buy', 'entry', 'enter', 'purchase'])) {
      return this.analyzeBuyOpportunity();
    }
    
    if (this.matchesIntent(lowerQuery, ['sell', 'exit', 'take profit', 'close'])) {
      return this.analyzeSellOpportunity();
    }
    
    if (this.matchesIntent(lowerQuery, ['trend', 'direction', 'going'])) {
      return this.analyzeTrend();
    }
    
    if (this.matchesIntent(lowerQuery, ['risk', 'safe', 'danger', 'risky'])) {
      return this.analyzeRisk();
    }
    
    if (this.matchesIntent(lowerQuery, ['support', 'resistance', 'level'])) {
      return this.findSupportResistance();
    }
    
    if (this.matchesIntent(lowerQuery, ['volume', 'liquidity'])) {
      return this.analyzeVolumeContext();
    }
    
    if (this.matchesIntent(lowerQuery, ['rsi', 'overbought', 'oversold'])) {
      return this.analyzeRSI();
    }
    
    if (this.matchesIntent(lowerQuery, ['macd', 'momentum'])) {
      return this.analyzeMACDContext();
    }

    if (this.matchesIntent(lowerQuery, ['summary', 'overview', 'analysis', 'what'])) {
      return this.generateOverview();
    }

    // Educational responses
    if (this.matchesIntent(lowerQuery, ['explain', 'what is', 'how does', 'teach'])) {
      return this.provideEducation(lowerQuery);
    }

    // Default response
    return this.generateOverview();
  }

  private matchesIntent(query: string, keywords: string[]): boolean {
    return keywords.some(keyword => query.includes(keyword));
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
    // Simple educational responses
    if (query.includes('rsi')) {
      return `📚 **RSI (Relative Strength Index)**\n\nRSI measures momentum on a scale of 0-100:\n• Above 70 = Overbought (may pull back)\n• Below 30 = Oversold (may bounce)\n• 50 = Neutral\n\nIt helps identify potential reversals.`;
    }
    
    if (query.includes('macd')) {
      return `📚 **MACD (Moving Average Convergence Divergence)**\n\nMACD shows momentum changes:\n• Bullish: MACD crosses above signal line\n• Bearish: MACD crosses below signal line\n• Histogram shows strength of momentum\n\nUsed to spot trend changes.`;
    }

    if (query.includes('support') || query.includes('resistance')) {
      return `📚 **Support & Resistance**\n\nSupport = Price floor where buyers step in\nResistance = Price ceiling where sellers step in\n\nThese levels help identify:\n• Entry points (near support)\n• Exit points (near resistance)\n• Breakout opportunities`;
    }

    return `I can explain RSI, MACD, Support/Resistance, and more! Just ask!`;
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
