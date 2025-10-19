// Simple Moving Average
export const calculateSMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = Array(data.length).fill(null);
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    result[i] = sum / period;
  }
  return result;
};

// Exponential Moving Average
export const calculateEMA = (data: number[], period: number): (number | null)[] => {
  const result: (number | null)[] = Array(data.length).fill(null);
  if (data.length < period) return result;

  const multiplier = 2 / (period + 1);
  
  // Calculate the initial SMA for the first period
  let initialSlice = data.slice(0, period);
  let initialSum = initialSlice.reduce((a, b) => a + b, 0);
  let ema = initialSum / period;
  result[period - 1] = ema;

  // Calculate EMA for the rest of the data
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
    result[i] = ema;
  }
  return result;
};

// Bollinger Bands
export const calculateBollingerBands = (data: number[], period: number, stdDev: number) => {
  const middle: (number | null)[] = calculateSMA(data, period);
  const upper: (number | null)[] = Array(data.length).fill(null);
  const lower: (number | null)[] = Array(data.length).fill(null);

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const mean = middle[i]!;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const deviation = Math.sqrt(variance);
    upper[i] = mean + stdDev * deviation;
    lower[i] = mean - stdDev * deviation;
  }
  return { middle, upper, lower };
};

// Relative Strength Index
export const calculateRSI = (data: number[], period: number): (number | null)[] => {
    const result: (number | null)[] = Array(data.length).fill(null);
    if (data.length < period) return result;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const diff = data[i] - data[i - 1];
        if (diff > 0) {
            gains += diff;
        } else {
            losses -= diff;
        }
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    if (avgLoss === 0) {
        result[period] = 100;
    } else {
        const rs = avgGain / avgLoss;
        result[period] = 100 - (100 / (1 + rs));
    }

    for (let i = period + 1; i < data.length; i++) {
        const diff = data[i] - data[i - 1];
        let currentGain = 0;
        let currentLoss = 0;

        if (diff > 0) {
            currentGain = diff;
        } else {
            currentLoss = -diff;
        }

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

        if (avgLoss === 0) {
            result[i] = 100;
        } else {
            const rs = avgGain / avgLoss;
            result[i] = 100 - (100 / (1 + rs));
        }
    }
    return result;
};

// Moving Average Convergence Divergence (MACD)
export const calculateMACD = (data: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) => {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macdLine: (number | null)[] = Array(data.length).fill(null);
  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] !== null && emaSlow[i] !== null) {
      macdLine[i] = emaFast[i]! - emaSlow[i]!;
    }
  }

  const firstMacdIndex = macdLine.findIndex(v => v !== null);
  const signalLine: (number | null)[] = Array(data.length).fill(null);
  const histogram: (number | null)[] = Array(data.length).fill(null);

  if (firstMacdIndex !== -1) {
    const macdValuesOnly = macdLine.slice(firstMacdIndex).filter((v): v is number => v !== null);
    const signalEma = calculateEMA(macdValuesOnly, signalPeriod);
    
    // Align signal line with the original data array
    for(let i=0; i < signalEma.length; i++) {
        const originalIndex = firstMacdIndex + i;
        if(originalIndex < data.length) {
            signalLine[originalIndex] = signalEma[i];
        }
    }

    for (let i = 0; i < data.length; i++) {
        if (macdLine[i] !== null && signalLine[i] !== null) {
          histogram[i] = macdLine[i]! - signalLine[i]!;
        }
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
};

// Stochastic Oscillator
export const calculateStochastic = (highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) => {
  const kLine: (number | null)[] = Array(closes.length).fill(null);

  for (let i = kPeriod - 1; i < closes.length; i++) {
    const highSlice = highs.slice(i - kPeriod + 1, i + 1);
    const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...highSlice);
    const lowestLow = Math.min(...lowSlice);
    const currentClose = closes[i];

    if (highestHigh === lowestLow) {
      kLine[i] = 50;
    } else {
      kLine[i] = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
    }
  }

  const firstKIndex = kLine.findIndex(v => v !== null);
  const dLine: (number | null)[] = Array(closes.length).fill(null);

  if(firstKIndex !== -1) {
      const kValuesOnly = kLine.slice(firstKIndex).filter((v): v is number => v !== null);
      const dSma = calculateSMA(kValuesOnly, dPeriod);
      
      for(let i=0; i < dSma.length; i++) {
        const originalIndex = firstKIndex + i;
        if(originalIndex < closes.length) {
            dLine[originalIndex] = dSma[i];
        }
    }
  }
  
  return { k: kLine, d: dLine };
};

// Ichimoku Cloud
export const calculateIchimoku = (highs: number[], lows: number[], closes: number[], tenkanPeriod = 9, kijunPeriod = 26, senkouBPeriod = 52, senkouShift = 26, chikouShift = 26) => {
    const result = {
        tenkan: Array(closes.length).fill(null) as (number | null)[],
        kijun: Array(closes.length).fill(null) as (number | null)[],
        senkouA: Array(closes.length).fill(null) as (number | null)[],
        senkouB: Array(closes.length).fill(null) as (number | null)[],
        chikou: Array(closes.length).fill(null) as (number | null)[],
    };

    const _tenkan: (number | null)[] = [];
    const _kijun: (number | null)[] = [];

    for (let i = 0; i < closes.length; i++) {
        // Tenkan-sen (Conversion Line)
        if (i >= tenkanPeriod - 1) {
            const sliceHigh = highs.slice(i - tenkanPeriod + 1, i + 1);
            const sliceLow = lows.slice(i - tenkanPeriod + 1, i + 1);
            _tenkan[i] = (Math.max(...sliceHigh) + Math.min(...sliceLow)) / 2;
        } else {
            _tenkan[i] = null;
        }
        result.tenkan[i] = _tenkan[i];

        // Kijun-sen (Base Line)
        if (i >= kijunPeriod - 1) {
            const sliceHigh = highs.slice(i - kijunPeriod + 1, i + 1);
            const sliceLow = lows.slice(i - kijunPeriod + 1, i + 1);
            _kijun[i] = (Math.max(...sliceHigh) + Math.min(...sliceLow)) / 2;
        } else {
            _kijun[i] = null;
        }
        result.kijun[i] = _kijun[i];
        
        // Chikou Span (Lagging Span) - Shifted back
        if (i >= chikouShift) {
            result.chikou[i - chikouShift] = closes[i];
        }
    }

    for (let i = 0; i < closes.length; i++) {
        // Senkou Span A (Leading Span A) - Shifted forward
        if (_tenkan[i] !== null && _kijun[i] !== null && i + senkouShift < closes.length) {
            result.senkouA[i + senkouShift] = (_tenkan[i]! + _kijun[i]!) / 2;
        }

        // Senkou Span B (Leading Span B) - Shifted forward
        if (i >= senkouBPeriod - 1 && i + senkouShift < closes.length) {
            const sliceHigh = highs.slice(i - senkouBPeriod + 1, i + 1);
            const sliceLow = lows.slice(i - senkouBPeriod + 1, i + 1);
            result.senkouB[i + senkouShift] = (Math.max(...sliceHigh) + Math.min(...sliceLow)) / 2;
        }
    }

    return result;
};