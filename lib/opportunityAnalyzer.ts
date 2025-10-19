import type { ChartDataPoint, Opportunity } from '../types';

// This is a mock analysis engine. In a real application, this could be a
// more sophisticated backend service or a complex client-side library.

export const analyzeOpportunities = (data: ChartDataPoint[]): Opportunity[] => {
    const opportunities: Opportunity[] = [];
    if (data.length < 2) {
        return [];
    }
    
    const last = data[data.length - 1];
    const prev = data[data.length - 2];

    // 1. Candlestick Pattern: Bullish Engulfing
    if (
        prev.close < prev.open && // Previous candle is bearish
        last.close > last.open &&  // Current candle is bullish
        last.close > prev.open &&  // Current close is above previous open
        last.open < prev.close     // Current open is below previous close
    ) {
        opportunities.push({
            id: `pattern-bullish-engulfing-${last.time}`,
            type: 'Pattern',
            title: 'Bullish Engulfing Detected',
            description: 'A potential bottom reversal pattern has formed.',
            dataPointIndex: data.length - 1,
        });
    }

    // 2. Candlestick Pattern: Bearish Engulfing
    if (
        prev.close > prev.open && // Previous candle is bullish
        last.close < last.open &&  // Current candle is bearish
        last.close < prev.open &&  // Current close is below previous open
        last.open > prev.close     // Current open is above previous close
    ) {
        opportunities.push({
            id: `pattern-bearish-engulfing-${last.time}`,
            type: 'Pattern',
            title: 'Bearish Engulfing Detected',
            description: 'A potential top reversal pattern has formed.',
            dataPointIndex: data.length - 1,
        });
    }

    // 3. Indicator Signal: RSI Oversold/Overbought
    if (last.rsi) {
        if (last.rsi < 30 && prev.rsi && prev.rsi >= 30) {
            opportunities.push({
                id: `indicator-rsi-oversold-${last.time}`,
                type: 'Indicator',
                title: 'RSI is Oversold',
                description: `RSI(14) just crossed below 30 (${last.rsi.toFixed(2)}).`,
                dataPointIndex: data.length - 1,
            });
        }
        if (last.rsi > 70 && prev.rsi && prev.rsi <= 70) {
            opportunities.push({
                id: `indicator-rsi-overbought-${last.time}`,
                type: 'Indicator',
                title: 'RSI is Overbought',
                description: `RSI(14) just crossed above 70 (${last.rsi.toFixed(2)}).`,
                dataPointIndex: data.length - 1,
            });
        }
    }

    // 4. Volatility Signal: Bollinger Band Squeeze
    if (data.length > 20) {
        const last20Points = data.slice(-20);
        const bandwidths = last20Points.map(p => 
            p.bbUpper && p.bbLower && p.bbMiddle ? (p.bbUpper - p.bbLower) / p.bbMiddle : null
        ).filter((b): b is number => b !== null);
        
        if (bandwidths.length === 20) {
            const currentBandwidth = bandwidths[19];
            const minBandwidth = Math.min(...bandwidths);
            if (currentBandwidth <= minBandwidth * 1.1) { // If we are within 10% of the 20-period low
                 opportunities.push({
                    id: `volatility-bb-squeeze-${last.time}`,
                    type: 'Volatility',
                    title: 'Bollinger Bands Squeezing',
                    description: 'Low volatility suggests a potential breakout is imminent.',
                    dataPointIndex: data.length - 1,
                });
            }
        }
    }
    
    // 5. Indicator Signal: MACD Crossover
    if (last.macd && last.macdSignal && prev.macd && prev.macdSignal) {
        // Bullish Crossover
        if (prev.macd < prev.macdSignal && last.macd > last.macdSignal) {
             opportunities.push({
                id: `indicator-macd-bullish-cross-${last.time}`,
                type: 'Indicator',
                title: 'MACD Bullish Crossover',
                description: 'The MACD line has crossed above its signal line.',
                dataPointIndex: data.length - 1,
            });
        }
        // Bearish Crossover
         if (prev.macd > prev.macdSignal && last.macd < last.macdSignal) {
             opportunities.push({
                id: `indicator-macd-bearish-cross-${last.time}`,
                type: 'Indicator',
                title: 'MACD Bearish Crossover',
                description: 'The MACD line has crossed below its signal line.',
                dataPointIndex: data.length - 1,
            });
        }
    }


    // Make sure opportunities are unique by id and return sorted by time
    const uniqueOpportunities = Array.from(new Map(opportunities.map(op => [op.id, op])).values());
    return uniqueOpportunities.reverse();
};
