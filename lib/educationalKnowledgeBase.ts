/**
 * Educational Knowledge Base for AI Assistant
 * Provides contextual trading education without API calls
 * All content is educational and not financial advice
 */

export interface KnowledgeEntry {
  keywords: string[];
  topic: string;
  explanation: string;
  context: string;
  tips: string[];
}

const knowledgeBase: KnowledgeEntry[] = [
  {
    keywords: ['moving average', 'sma', 'ema', 'ma', '50', '200'],
    topic: 'Moving Averages',
    explanation:
      'A moving average (MA) is the average price over a set period. The 50-period MA shows medium-term direction, while the 200-period MA shows long-term trend. When price is above the MA, it typically indicates an uptrend.',
    context: 'Moving averages help identify trend direction and potential support/resistance levels.',
    tips: [
      'Price above both 50 and 200 MA often indicates strong uptrend',
      'Crossover of fast MA above slow MA can signal bullish momentum',
      'Use multiple timeframes to confirm trend strength',
    ],
  },
  {
    keywords: ['rsi', 'relative strength', 'overbought', 'oversold', '70', '30'],
    topic: 'RSI (Relative Strength Index)',
    explanation:
      'RSI measures the magnitude of price changes to identify overbought/oversold conditions. Values above 70 suggest overbought (potential pullback), below 30 suggest oversold (potential bounce).',
    context:
      'RSI is a momentum oscillator that helps identify potential reversal points and trend changes.',
    tips: [
      'RSI above 70 may indicate upcoming pullback - watch support levels',
      'RSI below 30 may indicate upcoming bounce - watch resistance',
      'Divergence between price and RSI can signal reversal',
      'In strong trends, RSI can stay overbought/oversold for extended periods',
    ],
  },
  {
    keywords: ['bollinger bands', 'bb', 'squeeze', 'volatility', 'bandwidth'],
    topic: 'Bollinger Bands',
    explanation:
      'Bollinger Bands consist of a moving average (middle band) with upper and lower bands 2 standard deviations away. When bands squeeze together, volatility is low. When they expand, volatility is high.',
    context:
      'Bollinger Bands help identify volatility regimes and potential breakout opportunities.',
    tips: [
      'Bollinger Band squeeze often precedes a significant breakout move',
      'Price touching upper band in uptrend can signal continuation or exhaustion',
      'Watch for volume confirmation when price breaks above/below bands',
      'Band width expansion after squeeze often leads to strong directional move',
    ],
  },
  {
    keywords: ['macd', 'crossover', 'signal line', 'momentum', 'divergence'],
    topic: 'MACD (Moving Average Convergence Divergence)',
    explanation:
      'MACD measures the difference between two exponential moving averages. When MACD crosses above its signal line, it can indicate bullish momentum. Below signal line suggests bearish momentum.',
    context: 'MACD helps identify changes in momentum and trend direction.',
    tips: [
      'Bullish crossover (MACD above signal) can indicate buying opportunity',
      'Bearish crossover (MACD below signal) can indicate potential selling pressure',
      'Divergence between price and MACD often precedes reversals',
      'Use histogram height to measure momentum strength',
    ],
  },
  {
    keywords: ['engulfing', 'bullish', 'bearish', 'reversal', 'candlestick', 'pattern'],
    topic: 'Engulfing Patterns',
    explanation:
      'A bullish engulfing pattern occurs when a large bullish candle completely encompasses a previous bearish candle, suggesting reversal to upside. Bearish engulfing is the opposite at tops.',
    context:
      'Candlestick patterns provide visual confirmation of potential trend reversals.',
    tips: [
      'Engulfing patterns are stronger when they occur at key support/resistance levels',
      'Confirm engulfing patterns with volume - higher volume increases reliability',
      'In strong trends, engulfing can also be continuation rather than reversal',
      'Wait for close confirmation before entering trades',
    ],
  },
  {
    keywords: ['support', 'resistance', 'level', 'bounce', 'breakout', 'break'],
    topic: 'Support and Resistance',
    explanation:
      'Support is a price level where buying interest stops further declines. Resistance is where selling pressure halts further gains. These levels are key reference points for technical analysis.',
    context:
      'Identifying support and resistance helps determine entry, exit, and stop-loss levels.',
    tips: [
      'Round numbers often act as psychological support/resistance',
      'Previous highs/lows frequently become new support/resistance',
      'Breakouts above resistance or below support can signal strong moves',
      'Test breakouts - price often retests broken support/resistance',
    ],
  },
  {
    keywords: ['trend', 'uptrend', 'downtrend', 'consolidation', 'direction', 'higher', 'lower'],
    topic: 'Trend Direction',
    explanation:
      'An uptrend shows higher highs and higher lows. A downtrend shows lower highs and lower lows. Consolidation is sideways movement between levels.',
    context: 'Identifying the primary trend is fundamental to all technical analysis.',
    tips: [
      '"The trend is your friend" - trade in the direction of the main trend',
      'Multiple timeframe analysis helps confirm trend strength',
      'Shorter timeframe trends within longer trends often provide better entries',
      'Consolidation often precedes trend continuation or reversal',
    ],
  },
  {
    keywords: ['volatility', 'high', 'low', 'squeeze', 'expansion', 'vix'],
    topic: 'Volatility Analysis',
    explanation:
      'Volatility measures how much price fluctuates. Low volatility means small price moves, high volatility means large moves. Understanding volatility helps with position sizing and risk management.',
    context: 'Volatility analysis helps traders prepare for market behavior.',
    tips: [
      'Low volatility often precedes high volatility moves',
      'High volatility environments favor trend traders, not swing traders',
      'Position sizing should be adjusted for volatility levels',
      'Economic news often increases volatility significantly',
    ],
  },
  {
    keywords: ['breakout', 'break', 'resistance', 'support', 'volume'],
    topic: 'Breakouts',
    explanation:
      'A breakout occurs when price moves beyond established support or resistance. Strong breakouts are confirmed by volume increase, indicating conviction behind the move.',
    context:
      'Breakouts can signal the start of strong trending moves or be false breakouts.',
    tips: [
      'Breakouts on high volume are more likely to succeed',
      'False breakouts (breakout followed by quick reversal) are common',
      'Best breakouts often occur after consolidation or squeeze periods',
      'Set stop losses just below breakout point for risk management',
    ],
  },
  {
    keywords: ['pullback', 'retracement', 'correction', 'dip'],
    topic: 'Pullbacks and Retracements',
    explanation:
      'A pullback is a temporary reversal within a larger trend - price moves against the main trend briefly before continuing in the original direction. Common retracement levels are 38%, 50%, 62%.',
    context: 'Understanding pullbacks helps identify low-risk entry points in trends.',
    tips: [
      'Pullbacks to moving averages often provide good entry points in trends',
      'The deeper the pullback, the more conviction in the reversal',
      'Common retracement targets: 38.2%, 50%, 61.8% (Fibonacci levels)',
      'Volume typically decreases during pullbacks',
    ],
  },
];

/**
 * Find relevant knowledge entries based on user question
 */
export const findRelevantKnowledge = (question: string): KnowledgeEntry[] => {
  const lowerQuestion = question.toLowerCase();
  const matches: KnowledgeEntry[] = [];

  knowledgeBase.forEach((entry) => {
    const keywordMatch = entry.keywords.some((keyword) => lowerQuestion.includes(keyword));
    if (keywordMatch) {
      matches.push(entry);
    }
  });

  return matches;
};

/**
 * Generate educational response based on user question and current chart context
 */
export const generateEducationalResponse = (
  question: string,
  pair?: string,
  interval?: string,
  currentPrice?: number
): string => {
  const relevantEntries = findRelevantKnowledge(question);

  if (relevantEntries.length === 0) {
    return `I'm not sure about that specific topic. I can help with: Moving Averages, RSI, Bollinger Bands, MACD, Candlestick Patterns, Support/Resistance, Trends, Volatility, Breakouts, and Pullbacks. Try asking about one of these!`;
  }

  const entry = relevantEntries[0];
  let response = `📚 **${entry.topic}**\n\n${entry.explanation}\n\n`;

  if (pair && interval && currentPrice) {
    response += `**On ${pair} (${interval} timeframe):**\n`;
    response += `${entry.context}\n\n`;
  }

  response += `**Key Takeaways:**\n`;
  entry.tips.forEach((tip) => {
    response += `• ${tip}\n`;
  });

  response += `\n*Note: This is educational content, not financial advice. Always do your own research.`;

  return response;
};

/**
 * Get related topics to teach the user more
 */
export const getRelatedTopics = (topic: string): string[] => {
  const entry = knowledgeBase.find((e) => e.topic.toLowerCase().includes(topic.toLowerCase()));
  if (!entry) return [];

  const related: string[] = [];
  entry.keywords.forEach((keyword) => {
    knowledgeBase.forEach((e) => {
      if (
        e.topic !== entry.topic &&
        e.keywords.some((k) => k.includes(keyword) || keyword.includes(k))
      ) {
        if (!related.includes(e.topic)) {
          related.push(e.topic);
        }
      }
    });
  });

  return related.slice(0, 3);
};

/**
 * Get random education tip for user
 */
export const getRandomTip = (): string => {
  const randomEntry = knowledgeBase[Math.floor(Math.random() * knowledgeBase.length)];
  const randomTip = randomEntry.tips[Math.floor(Math.random() * randomEntry.tips.length)];
  return `💡 Tip: ${randomTip}`;
};

/**
 * Check if question asks for financial advice (warn if it does)
 */
export const isAskingForAdvice = (question: string): boolean => {
  const advisoryKeywords = [
    'should i buy',
    'should i sell',
    'will it go up',
    'will it go down',
    'best trade',
    'guaranteed',
    'sure win',
    'must buy',
    'dont miss',
    'pump',
    'dump',
    'moon',
    'target',
  ];

  const lowerQuestion = question.toLowerCase();
  return advisoryKeywords.some((keyword) => lowerQuestion.includes(keyword));
};
