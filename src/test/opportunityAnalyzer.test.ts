import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeOpportunities } from '../../lib/opportunityAnalyzer';
import type { ChartDataPoint } from '../../types';

describe('Opportunity Analyzer', () => {
  let mockChartData: ChartDataPoint[];

  beforeEach(() => {
    mockChartData = Array.from({ length: 30 }, (_, i) => ({
      timestamp: Date.now() + i * 60000,
      open: 100 + i,
      high: 105 + i,
      low: 95 + i,
      close: 102 + i,
      volume: 1000000,
      sma: 100 + i,
      rsi: 50,
    }));
  });

  it('should return an array of opportunities', () => {
    const opportunities = analyzeOpportunities(mockChartData, 'BTC/USD', '1h');
    expect(Array.isArray(opportunities)).toBe(true);
  });

  it('should detect RSI oversold conditions', () => {
    const oversoldData = mockChartData.map((point, i) => ({
      ...point,
      rsi: i === mockChartData.length - 1 ? 25 : (i === mockChartData.length - 2 ? 50 : 50), // Last point oversold, prev normal
    }));

    const opportunities = analyzeOpportunities(oversoldData, 'BTC/USD', '1h');
    const hasOversoldOpportunity = opportunities.some(
      opp => opp.title.includes('Oversold') || opp.title.includes('RSI')
    );
    
    expect(hasOversoldOpportunity).toBe(true);
  });

  it('should detect RSI overbought conditions', () => {
    const overboughtData = mockChartData.map((point, i) => ({
      ...point,
      rsi: i === mockChartData.length - 1 ? 75 : (i === mockChartData.length - 2 ? 50 : 50), // Last point overbought, prev normal
    }));

    const opportunities = analyzeOpportunities(overboughtData, 'BTC/USD', '1h');
    const hasOverboughtOpportunity = opportunities.some(
      opp => opp.title.includes('Overbought') || opp.title.includes('RSI')
    );
    
    expect(hasOverboughtOpportunity).toBe(true);
  });

  it('should include pair and interval in opportunities', () => {
    const opportunities = analyzeOpportunities(mockChartData, 'ETH/USD', '4h');
    
    opportunities.forEach(opp => {
      expect(opp.pair).toBe('ETH/USD');
      expect(opp.interval).toBe('4h');
    });
  });

  it('should handle empty chart data', () => {
    const opportunities = analyzeOpportunities([], 'BTC/USD', '1h');
    expect(opportunities).toEqual([]);
  });

  it('should limit number of opportunities', () => {
    const largeData = Array.from({ length: 100 }, (_, i) => ({
      timestamp: Date.now() + i * 60000,
      open: 100,
      high: 105,
      low: 95,
      close: 102,
      volume: 1000000,
      sma: 100,
      rsi: i % 2 === 0 ? 25 : 75, // Alternate between oversold and overbought
    }));

    const opportunities = analyzeOpportunities(largeData, 'BTC/USD', '1h');
    expect(opportunities.length).toBeLessThanOrEqual(10);
  });

  it('should assign confidence scores', () => {
    const opportunities = analyzeOpportunities(mockChartData, 'BTC/USD', '1h');
    
    opportunities.forEach(opp => {
      expect(opp.confidence).toBeDefined();
      expect(opp.confidence).toBeGreaterThanOrEqual(0);
      expect(opp.confidence).toBeLessThanOrEqual(1);
    });
  });
});
