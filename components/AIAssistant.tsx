import React, { useState } from 'react';
import { generateEducationalResponse, isAskingForAdvice } from '../lib/educationalKnowledgeBase';
import type { OhlcvData, Pair, Interval } from '../types';

interface AIAssistantProps {
  pair: Pair;
  interval: Interval;
  latestData: OhlcvData | null;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ pair, interval, latestData }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const examplePrompts = [
    'Explain what a 50-day moving average is.',
    'What does RSI mean?',
    'Describe Bollinger Bands.',
    'What is a bullish engulfing pattern?',
    'How do I identify support and resistance?',
  ];

  const handlePromptSubmit = (text: string) => {
    setIsLoading(true);
    setError('');
    setResponse('');
    setShowDisclaimer(false);

    // Check if asking for financial advice
    if (isAskingForAdvice(text)) {
      setShowDisclaimer(true);
      setError('⚠️ I can only provide educational information, not financial advice. Please rephrase your question to ask about trading concepts instead.');
      setIsLoading(false);
      return;
    }

    // Simulate processing delay
    setTimeout(() => {
      try {
        const result = generateEducationalResponse(text, pair.name, interval.id, latestData?.close);
        setResponse(result);
      } catch (err) {
        console.error(err);
        setError('Unable to generate response. Please try a different question.');
      } finally {
        setIsLoading(false);
        setPrompt('');
      }
    }, 300); // Small delay for UX feel
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      handlePromptSubmit(prompt);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-3 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        <span>Learning Assistant</span>
      </h3>
      
      <div className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700 p-4 rounded-md min-h-[120px] max-h-[300px] overflow-y-auto whitespace-pre-wrap">
          {isLoading && <p className="text-gray-500">🤔 Thinking...</p>}
          {showDisclaimer && (
            <p className="text-amber-600 dark:text-amber-400 font-semibold">
              ⚠️ I provide educational content only, not financial advice. I cannot predict markets or recommend trades.
            </p>
          )}
          {error && <p className="text-red-500">{error}</p>}
          {response && <div className="text-gray-700 dark:text-gray-300">{response}</div>}
          {!isLoading && !response && !error && (
            <p className="text-gray-500">Ask me about technical analysis concepts like moving averages, RSI, patterns, and more.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((p) => (
            <button
              key={p}
              onClick={() => handlePromptSubmit(p)}
              disabled={isLoading}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500 disabled:opacity-50 transition-colors"
            >
              {p.split(' ').slice(0, 3).join(' ')}...
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about technical analysis..."
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition-colors"
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </form>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          💡 Runs locally • No API calls • Educational only • Not financial advice
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;