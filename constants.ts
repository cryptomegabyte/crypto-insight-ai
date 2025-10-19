
import type { Pair, Interval } from './types';

export const PAIRS: Pair[] = [
  { id: 'BTC/USD', name: 'Bitcoin', base: 'BTC', quote: 'USD' },
  { id: 'ETH/USD', name: 'Ethereum', base: 'ETH', quote: 'USD' },
  { id: 'XRP/USD', name: 'XRP', base: 'XRP', quote: 'USD' },
  { id: 'SOL/USD', name: 'Solana', base: 'SOL', quote: 'USD' },
];

export const INTERVALS: Interval[] = [
  { id: '1m', minutes: 1 },
  { id: '15m', minutes: 15 },
  { id: '1h', minutes: 60 },
  { id: '4h', minutes: 240 },
  { id: '1D', minutes: 1440 },
];
