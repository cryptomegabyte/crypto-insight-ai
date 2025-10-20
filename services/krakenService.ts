
import type { OhlcvData, Trade } from '../types';

/**
 * Real Kraken API Service
 * Uses Kraken's public REST API for historical data and WebSocket for live trades
 */

// Map our pair names to Kraken's format
const getPairName = (pair: string): string => {
  const mapping: Record<string, string> = {
    'BTCUSD': 'XXBTZUSD',
    'ETHUSD': 'XETHZUSD',
    'SOLUSD': 'SOLUSD',
    'ADAUSD': 'ADAUSD',
    'DOGEUSD': 'XDGUSD'
  };
  return mapping[pair] || pair;
};

// Map our interval minutes to Kraken's interval format
const getKrakenInterval = (minutes: number): number => {
  // Kraken supports: 1, 5, 15, 30, 60, 240, 1440, 10080, 21600
  if (minutes <= 1) return 1;
  if (minutes <= 5) return 5;
  if (minutes <= 15) return 15;
  if (minutes <= 30) return 30;
  if (minutes <= 60) return 60;
  if (minutes <= 240) return 240;
  if (minutes <= 1440) return 1440;
  return 1440; // Default to daily
};

/**
 * Fetch historical OHLC data from Kraken REST API
 */
const fetchOhlcv = async (pair: string, interval: number): Promise<OhlcvData[]> => {
  try {
    const krakenPair = getPairName(pair);
    const krakenInterval = getKrakenInterval(interval);
    
    const url = `https://api.kraken.com/0/public/OHLC?pair=${krakenPair}&interval=${krakenInterval}`;
    
    const response = await fetch(url);
    const json = await response.json();
    
    if (json.error && json.error.length > 0) {
      console.error('Kraken API error:', json.error);
      throw new Error(json.error[0]);
    }
    
    // Kraken returns data with the pair name as key
    const pairKey = Object.keys(json.result).find(key => key !== 'last');
    if (!pairKey) {
      throw new Error('No data returned from Kraken');
    }
    
    const rawData = json.result[pairKey];
    
    // Convert Kraken format to our format
    // Kraken format: [time, open, high, low, close, vwap, volume, count]
    const data: OhlcvData[] = rawData.map((candle: any[]) => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[6])
    }));
    
    return data;
  } catch (error) {
    console.error('Error fetching OHLC data from Kraken:', error);
    // Fallback to mock data if API fails
    return generateMockOhlcv(pair, interval, 400);
  }
};

/**
 * Subscribe to live trades via Kraken WebSocket
 */
const subscribeToTrades = (pair: string, onTrade: (trade: Trade) => void): (() => void) => {
  try {
    const krakenPair = getPairName(pair);
    const ws = new WebSocket('wss://ws.kraken.com');
    
    ws.onopen = () => {
      console.log('Kraken WebSocket connected');
      
      // Subscribe to trade feed
      const subscribeMsg = {
        event: 'subscribe',
        pair: [krakenPair],
        subscription: { name: 'trade' }
      };
      
      ws.send(JSON.stringify(subscribeMsg));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Ignore subscription confirmations and heartbeats
        if (Array.isArray(data) && data[2] === 'trade') {
          const trades = data[1];
          
          // Process each trade in the array
          trades.forEach((trade: any[]) => {
            // Kraken trade format: [price, volume, time, side, orderType, misc]
            const tradeData: Trade = {
              price: parseFloat(trade[0]),
              volume: parseFloat(trade[1]),
              time: Math.floor(parseFloat(trade[2]) * 1000), // Convert to milliseconds
              side: trade[3] === 'b' ? 'buy' : 'sell'
            };
            
            onTrade(tradeData);
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Kraken WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('Kraken WebSocket disconnected');
    };
    
    // Return cleanup function
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  } catch (error) {
    console.error('Error setting up Kraken WebSocket:', error);
    
    // Fallback to mock trades if WebSocket fails
    return subscribeToMockTrades(pair, onTrade);
  }
};

/**
 * Fallback mock data generator (used when API is unavailable)
 */
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

/**
 * Fallback mock trade subscription (used when WebSocket is unavailable)
 */
const subscribeToMockTrades = (pair: string, onTrade: (trade: Trade) => void): (() => void) => {
  let lastPrice = pair.startsWith('BTC') ? 60000 : pair.startsWith('ETH') ? 3000 : 0.5;

  const intervalId = setInterval(() => {
    const change = (Math.random() - 0.5) * (lastPrice * 0.0005);
    const price = lastPrice + change;
    const volume = Math.random() * 0.5;
    const side = Math.random() > 0.5 ? 'buy' : 'sell';

    onTrade({ price, volume, time: Date.now(), side });
    lastPrice = price;
  }, 2000);

  return () => {
    clearInterval(intervalId);
  };
};

export const mockKrakenService = {
  fetchOhlcv,
  subscribeToTrades,
};
