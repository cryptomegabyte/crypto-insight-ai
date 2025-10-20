import { describe, it, expect } from 'vitest';
import { calculateScore } from '../../lib/scoringEngine';
import type { ChartDataPoint } from '../../types';

describe('Scoring Engine', () => {
  const createMockDataPoint = (overrides: Partial<ChartDataPoint> = {}): ChartDataPoint => ({
    timestamp: Date.now(),
    open: 100,
    high: 105,
    low: 95,
    close: 102,
    volume: 1000000,
    sma: 100,
    rsi: 50,
    ...overrides,
  });

  it('should return a score between 0 and 100', () => {
    const data = [createMockDataPoint()];
    const score = calculateScore(data);
    
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should give higher score for bullish indicators', () => {
    const bullishData = [
      createMockDataPoint({ 
        close: 110,
        sma: 100,
        rsi: 55,
      }),
    ];
    
    const neutralData = [
      createMockDataPoint({ 
        close: 100,
        sma: 100,
        rsi: 50,
      }),
    ];
    
    const bullishScore = calculateScore(bullishData);
    const neutralScore = calculateScore(neutralData);
    
    expect(bullishScore).toBeGreaterThan(neutralScore);
  });

  it('should give lower score for bearish indicators', () => {
    const bearishData = [
      createMockDataPoint({ 
        close: 90,
        sma: 100,
        rsi: 30,
      }),
    ];
    
    const neutralData = [
      createMockDataPoint({ 
        close: 100,
        sma: 100,
        rsi: 50,
      }),
    ];
    
    const bearishScore = calculateScore(bearishData);
    const neutralScore = calculateScore(neutralData);
    
    expect(bearishScore).toBeLessThan(neutralScore);
  });

  it('should handle empty data', () => {
    const score = calculateScore([]);
    expect(score).toBe(50); // Should return neutral score
  });

  it('should consider multiple data points', () => {
    const multiPointData = Array.from({ length: 10 }, (_, i) => 
      createMockDataPoint({ 
        close: 100 + i,
        rsi: 50 + i,
      })
    );
    
    const score = calculateScore(multiPointData);
    expect(score).toBeGreaterThan(50); // Uptrend should give score > 50
  });
});
