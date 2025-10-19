export interface Pair {
  id: 'BTC/USD' | 'ETH/USD' | 'XRP/USD' | 'SOL/USD';
  name: string;
  base: string;
  quote: string;
}

export interface Interval {
  id: string;
  minutes: number;
}

export interface OhlcvData {
  time: number; // UNIX timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  price: number;
  volume: number;
  time: number;
  side: 'buy' | 'sell';
}

// A more comprehensive type for data points that will be rendered on the chart
export interface ChartDataPoint extends OhlcvData {
    // Technical Indicators
    sma50?: number | null;
    ema20?: number | null;
    bbUpper?: number | null;
    bbMiddle?: number | null;
    bbLower?: number | null;
    rsi?: number | null;
    macd?: number | null;
    macdSignal?: number | null;
    macdHist?: number | null;
    stochK?: number | null;
    stochD?: number | null;
    // Ichimoku Cloud indicators
    ichimokuTenkan?: number | null;
    ichimokuKijun?: number | null;
    ichimokuSenkouA?: number | null;
    ichimokuSenkouB?: number | null;
    ichimokuChikou?: number | null;
}

export interface Opportunity {
  id: string;
  type: 'Pattern' | 'Indicator' | 'Volatility' | 'News';
  title: string;
  description: string;
  dataPointIndex?: number; // Optional index to highlight on the chart
}

export interface ScoredOpportunity extends Opportunity {
  confidence: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  suggestedAction: 'watch' | 'consider' | 'strong_signal';
  rationale: string;
}


// Fix: Add AssetProfileData type.
export interface AssetProfileData {
  name: string;
  symbol: string;
  description: string;
  links: Record<string, string | undefined | null>;
}

// Fix: Add NewsArticle type.
export interface NewsArticle {
  uri: string;
  title: string;
}
