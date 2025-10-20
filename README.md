# 🚀 Crypto Insight AI

A sophisticated real-time cryptocurrency trading dashboard with AI-powered analysis, technical indicators, and intelligent trading insights.

![Crypto Insight AI Dashboard](./dashboard.png)

## ✨ Features

### 📊 Advanced Charting
- **Interactive Financial Charts** with real-time price updates
- **Technical Indicators**: SMA, EMA, Bollinger Bands, RSI, MACD, Stochastic, Ichimoku, ATR, and Awesome Oscillator
- **Drawing Tools** for chart annotations and pattern recognition
- **Multi-timeframe Analysis**: 1m, 15m, 1h, 4h, 1d intervals
- **Volume Analysis** with integrated volume bars

### 🤖 AI-Powered Trading Assistant
- **Real-time AI Analysis** of market conditions
- **Natural Language Interface** for chart queries
- **Pattern Recognition** and trend analysis
- **Risk Assessment** with buy/sell/hold recommendations
- **Support & Resistance Level Detection**

### 📈 AI Trading Feed
- **Live Trading Signals** with priority levels (High, Medium, Low)
- **Automated Opportunity Detection**:
  - RSI Oversold/Overbought alerts
  - Resistance and Support level notifications
  - High Volatility warnings
- **Actionable Insights** with one-click analysis

### 💹 Market Data Panel
- **Real-time Price Updates** from Kraken exchange
- **24h OHLC Data** (Open, High, Low, Close)
- **Price Change Indicators** with percentage tracking
- **Volume Monitoring**

### 🎯 Trading Opportunities
- **Smart Opportunity Scanner** analyzing market conditions
- **Pattern-based Signals** leveraging technical indicators
- **Risk-adjusted Recommendations**
- **Continuous Market Monitoring**

### 🎨 Customizable Layout
- **Drag-and-Drop Interface** using React Grid Layout
- **Responsive Design** adapting to any screen size
- **Panel Visibility Controls** to focus on what matters
- **Layout Presets** for different trading styles
- **Dark/Light Theme Support**

## 🛠️ Technology Stack

- **Frontend Framework**: React 19.2.0 with TypeScript
- **Charting**: Recharts for beautiful, responsive charts
- **Layout Management**: React Grid Layout for flexible panel arrangement
- **Build Tool**: Vite for lightning-fast development
- **Exchange Integration**: Kraken API (mock service for demo)
- **State Management**: React Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/cryptomegabyte/crypto-insight-ai.git
cd crypto-insight-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production-ready files will be generated in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
crypto-insight-ai/
├── components/           # React components
│   ├── AIChatAssistant.tsx
│   ├── AITradingFeed.tsx
│   ├── CustomFinancialChart.tsx
│   ├── DrawingToolbar.tsx
│   ├── Header.tsx
│   ├── LandingPage.tsx
│   ├── LayoutControlPanel.tsx
│   ├── MarketDataPanel.tsx
│   ├── OpportunityFeed.tsx
│   ├── indicators/
│   │   └── IndicatorsModal.tsx
│   └── shared/
│       ├── CryptoIcon.tsx
│       └── Icons.tsx
├── lib/                  # Core business logic
│   ├── aiAssistant.ts
│   ├── aiTradingFeed.ts
│   ├── chartAnnotations.ts
│   ├── chartSummaryEngine.ts
│   ├── layoutConfig.ts
│   ├── opportunityAnalyzer.ts
│   ├── responsiveLayouts.ts
│   ├── scoringEngine.ts
│   ├── technicalIndicators.ts
│   └── chart/
│       ├── ChartEngine.ts
│       ├── DrawingTools.ts
│       └── GestureManager.ts
├── services/             # External service integrations
│   └── krakenService.ts
├── App.tsx              # Main application component
├── constants.ts         # Application constants
├── types.ts            # TypeScript type definitions
└── vite.config.ts      # Vite configuration
```

## 🎯 Key Components

### AI Chat Assistant
Ask questions about the chart using natural language:
- "Should I buy now?"
- "What's the current trend?"
- "Show me support and resistance"
- "What's the risk level?"

### AI Trading Feed
Real-time alerts with actionable insights:
- **Approaching Resistance**: Price nearing key resistance levels
- **RSI Oversold/Overbought**: Momentum indicator signals
- **High Volatility**: Sudden price movement notifications

### Market Data Panel
Live cryptocurrency market data:
- Current price with 24h change
- OHLC (Open, High, Low, Close) values
- Volume tracking
- Multi-pair support (BTC/USD, ETH/USD, SOL/USD, etc.)

## 🔧 Configuration

### Adding New Trading Pairs

Edit `constants.ts` to add new cryptocurrency pairs:

```typescript
export const PAIRS: Pair[] = [
  { symbol: 'BTC/USD', name: 'Bitcoin' },
  { symbol: 'YOUR/PAIR', name: 'Your Coin' },
  // Add more pairs
];
```

### Customizing Indicators

Modify indicator calculations in `lib/technicalIndicators.ts` or enable/disable them through the Indicators modal in the UI.

### Layout Presets

Create custom layout presets in `lib/layoutConfig.ts` to save your preferred panel arrangements.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Kraken API for market data
- React community for amazing tools and libraries
- All contributors who help improve this project

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Built with ❤️ by cryptomegabyte**

*Real-time crypto insights powered by AI*
