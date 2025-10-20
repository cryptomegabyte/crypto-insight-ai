import type { ChartDataPoint } from '../types';
import { scoreOpportunity, sortByConfidence } from './scoringEngine';
import type { ScoredOpportunity } from './scoringEngine';

// This is a local analysis engine providing scored opportunities
// No external APIs required - all analysis is client-side

export const analyzeOpportunities = (data: ChartDataPoint[], pair: string, interval: string): ScoredOpportunity[] => {
    const opportunities: ScoredOpportunity[] = [];
    if (data.length < 2) {
        return [];
    }
    
    const last = data[data.length - 1];
    const prev = data[data.length - 2];
    const dataPointIndex = data.length - 1;

    // 1. Candlestick Pattern: Bullish Engulfing
    if (
        prev.close < prev.open && // Previous candle is bearish
        last.close > last.open &&  // Current candle is bullish
        last.close > prev.open &&  // Current close is above previous open
        last.open < prev.close     // Current open is below previous close
    ) {
        opportunities.push(
            scoreOpportunity(
                data,
                `pattern-bullish-engulfing-${last.time}`,
                'Pattern',
                'Bullish Engulfing Detected',
                'A potential bottom reversal pattern has formed.',
                dataPointIndex,
                pair,
                interval
            )
        );
    }

    // 2. Candlestick Pattern: Bearish Engulfing
    if (
        prev.close > prev.open && // Previous candle is bullish
        last.close < last.open &&  // Current candle is bearish
        last.close < prev.open &&  // Current close is below previous open
        last.open > prev.close     // Current open is above previous close
    ) {
        opportunities.push(
            scoreOpportunity(
                data,
                `pattern-bearish-engulfing-${last.time}`,
                'Pattern',
                'Bearish Engulfing Detected',
                'A potential top reversal pattern has formed.',
                dataPointIndex,
                pair,
                interval
            )
        );
    }

    // 3. Indicator Signal: RSI Oversold/Overbought
    if (last.rsi) {
        if (last.rsi < 30 && prev.rsi && prev.rsi >= 30) {
            opportunities.push(
                scoreOpportunity(
                    data,
                    `indicator-rsi-oversold-${last.time}`,
                    'Indicator',
                    'RSI is Oversold',
                    `RSI(14) just crossed below 30 (${last.rsi.toFixed(2)}).`,
                    dataPointIndex,
                    pair,
                    interval
                )
            );
        }
        if (last.rsi > 70 && prev.rsi && prev.rsi <= 70) {
            opportunities.push(
                scoreOpportunity(
                    data,
                    `indicator-rsi-overbought-${last.time}`,
                    'Indicator',
                    'RSI is Overbought',
                    `RSI(14) just crossed above 70 (${last.rsi.toFixed(2)}).`,
                    dataPointIndex,
                    pair,
                    interval
                )
            );
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
            if (currentBandwidth <= minBandwidth * 1.1) {
                opportunities.push(
                    scoreOpportunity(
                        data,
                        `volatility-bb-squeeze-${last.time}`,
                        'Volatility',
                        'Bollinger Bands Squeezing',
                        'Low volatility suggests a potential breakout is imminent.',
                        dataPointIndex,
                        pair,
                        interval
                    )
                );
            }
        }
    }
    
    // 5. Indicator Signal: MACD Crossover
    if (last.macd && last.macdSignal && prev.macd && prev.macdSignal) {
        // Bullish Crossover
        if (prev.macd < prev.macdSignal && last.macd > last.macdSignal) {
            opportunities.push(
                scoreOpportunity(
                    data,
                    `indicator-macd-bullish-cross-${last.time}`,
                    'Indicator',
                    'MACD Bullish Crossover',
                    'The MACD line has crossed above its signal line.',
                    dataPointIndex,
                    pair,
                    interval
                )
            );
        }
        // Bearish Crossover
        if (prev.macd > prev.macdSignal && last.macd < last.macdSignal) {
            opportunities.push(
                scoreOpportunity(
                    data,
                    `indicator-macd-bearish-cross-${last.time}`,
                    'Indicator',
                    'MACD Bearish Crossover',
                    'The MACD line has crossed below its signal line.',
                    dataPointIndex,
                    pair,
                    interval
                )
            );
        }
    }

    // Make sure opportunities are unique by id and sort by confidence
    const uniqueOpportunities = Array.from(new Map(opportunities.map(op => [op.id, op])).values());
    return sortByConfidence(uniqueOpportunities).reverse();
};
