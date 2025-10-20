import { describe, it, expect } from 'vitest';
import { 
  calculateSMA, 
  calculateEMA, 
  calculateRSI, 
  calculateBollingerBands,
  calculateMACD,
  calculateStochastic
} from '../../lib/technicalIndicators';

describe('Technical Indicators', () => {
  const mockPrices = [100, 102, 101, 103, 105, 104, 106, 108, 107, 109, 111, 110, 112, 114, 113];

  describe('calculateSMA', () => {
    it('should calculate simple moving average correctly', () => {
      const result = calculateSMA(mockPrices, 5);
      expect(result).toBeDefined();
      expect(result.length).toBe(mockPrices.length);
      // SMA should be null for first (period - 1) values
      expect(result[0]).toBeNull();
      expect(result[3]).toBeNull();
      // SMA should have values after the period
      expect(result[4]).toBeGreaterThan(0);
    });

    it('should return array of nulls if period is larger than data', () => {
      const result = calculateSMA([100, 101, 102], 10);
      expect(result.every(val => val === null)).toBe(true);
    });

    it('should handle empty array', () => {
      const result = calculateSMA([], 5);
      expect(result).toEqual([]);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate exponential moving average correctly', () => {
      const result = calculateEMA(mockPrices, 5);
      expect(result).toBeDefined();
      expect(result.length).toBe(mockPrices.length);
      // EMA should be null for first (period - 1) values
      expect(result[0]).toBeNull();
      expect(result[4]).toBeGreaterThan(0);
    });

    it('should give more weight to recent prices than SMA', () => {
      const prices = [100, 100, 100, 100, 120]; // Sharp increase at end
      const sma = calculateSMA(prices, 5);
      const ema = calculateEMA(prices, 5);
      
      const smaValue = sma[sma.length - 1];
      const emaValue = ema[ema.length - 1];
      
      // EMA should react more to recent price increase
      if (smaValue && emaValue) {
        expect(emaValue).toBeGreaterThanOrEqual(smaValue);
      }
    });
  });

  describe('calculateRSI', () => {
    it('should calculate RSI correctly', () => {
      const result = calculateRSI(mockPrices, 14);
      expect(result).toBeDefined();
      expect(result.length).toBe(mockPrices.length);
    });

    it('should return values between 0 and 100', () => {
      const result = calculateRSI(mockPrices, 14);
      result.forEach(val => {
        if (val !== null) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should detect overbought conditions', () => {
      const increasingPrices = Array.from({ length: 20 }, (_, i) => 100 + i * 2);
      const result = calculateRSI(increasingPrices, 14);
      const lastRSI = result[result.length - 1];
      
      if (lastRSI !== null) {
        expect(lastRSI).toBeGreaterThan(50); // Uptrend should have RSI > 50
      }
    });
  });

  describe('calculateBollingerBands', () => {
    it('should calculate Bollinger Bands correctly', () => {
      const result = calculateBollingerBands(mockPrices, 20, 2);
      expect(result).toBeDefined();
      expect(result.upper.length).toBe(mockPrices.length);
      expect(result.middle.length).toBe(mockPrices.length);
      expect(result.lower.length).toBe(mockPrices.length);
    });

    it('should have upper band greater than middle, and middle greater than lower', () => {
      const result = calculateBollingerBands(mockPrices, 5, 2);
      
      for (let i = 0; i < result.upper.length; i++) {
        const upper = result.upper[i];
        const middle = result.middle[i];
        const lower = result.lower[i];
        
        if (upper !== null && middle !== null && lower !== null) {
          expect(upper).toBeGreaterThanOrEqual(middle);
          expect(middle).toBeGreaterThanOrEqual(lower);
        }
      }
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD correctly', () => {
      const result = calculateMACD(mockPrices);
      expect(result).toBeDefined();
      expect(result.macd.length).toBe(mockPrices.length);
      expect(result.signal.length).toBe(mockPrices.length);
      expect(result.histogram.length).toBe(mockPrices.length);
    });

    it('should have histogram as difference between MACD and signal', () => {
      const prices = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i / 5) * 10);
      const result = calculateMACD(prices);
      
      for (let i = 0; i < result.macd.length; i++) {
        const macd = result.macd[i];
        const signal = result.signal[i];
        const histogram = result.histogram[i];
        
        if (macd !== null && signal !== null && histogram !== null) {
          expect(Math.abs(histogram - (macd - signal))).toBeLessThan(0.01);
        }
      }
    });
  });

  describe('calculateStochastic', () => {
    it('should calculate Stochastic Oscillator correctly', () => {
      const highs = mockPrices.map(p => p + 2);
      const lows = mockPrices.map(p => p - 2);
      const closes = mockPrices;
      
      const result = calculateStochastic(highs, lows, closes, 14, 3);
      expect(result).toBeDefined();
      expect(result.k.length).toBe(mockPrices.length);
      expect(result.d.length).toBe(mockPrices.length);
    });

    it('should return values between 0 and 100', () => {
      const highs = mockPrices.map(p => p + 5);
      const lows = mockPrices.map(p => p - 5);
      const closes = mockPrices;
      
      const result = calculateStochastic(highs, lows, closes, 14, 3);
      
      result.k.forEach(val => {
        if (val !== null) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
      
      result.d.forEach(val => {
        if (val !== null) {
          expect(val).toBeGreaterThanOrEqual(0);
          expect(val).toBeLessThanOrEqual(100);
        }
      });
    });
  });
});
