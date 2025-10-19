
import type { OhlcvData, Trade } from '../types';

// This is a mock service to simulate Kraken API
// In a real application, this would use fetch for REST and WebSocket for live data.

const generateMockOhlcv = (pair: string, minutes: number, count: number): OhlcvData[] => {
  const data: OhlcvData[] = [];
  let price = pair.startsWith('BTC') ? 60000 : pair.startsWith('ETH') ? 3000 : 0.5;
  let time = Math.floor(Date.now() / 1000) - count * minutes * 60;

  for (let i = 0; i < count; i++) {
    const open = price;
    const change = (Math.random() - 0.49) * (price * 0.05);
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * (price * 0.01);
    const low = Math.min(open, close) - Math.random() * (price * 0.01);
    const volume = Math.random() * 100 + 10;
    
    data.push({ time, open, high, low, close, volume });

    price = close;
    time += minutes * 60;
  }
  return data;
};

const fetchOhlcv = (pair: string, interval: number): Promise<OhlcvData[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockOhlcv(pair, interval, 400); // Generate 400 candles
      resolve(data);
    }, 500); // Simulate network latency
  });
};

const subscribeToTrades = (pair: string, onTrade: (trade: Trade) => void): (() => void) => {
  let lastPrice = pair.startsWith('BTC') ? 60000 : pair.startsWith('ETH') ? 3000 : 0.5;

  const intervalId = setInterval(() => {
    const change = (Math.random() - 0.5) * (lastPrice * 0.0005);
    const price = lastPrice + change;
    const volume = Math.random() * 0.5;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';

    onTrade({ price, volume, time: Date.now(), side });
    lastPrice = price;
  }, 2000); // New trade every 2 seconds

  return () => {
    clearInterval(intervalId);
  };
};

export const mockKrakenService = {
  fetchOhlcv,
  subscribeToTrades,
};
