
import React, { useState } from 'react';
import { geminiService } from '../services/geminiService';
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

  const examplePrompts = [
    "Explain what a 50-day moving average is.",
    "What does RSI mean?",
    "Based on the current price, what is a possible short term outlook?",
    "Describe a common pattern in candlestick charts.",
  ];

  const handlePromptSubmit = async (text: string) => {
    setIsLoading(true);
    setError('');
    setResponse('');
    
    const fullPrompt = `
      You are an AI assistant in a crypto charting platform.
      The user is viewing the ${pair.name} (${pair.id}) chart on a ${interval.id} timeframe.
      The latest data point shows: Open=${latestData?.open}, High=${latestData?.high}, Low=${latestData?.low}, Close=${latestData?.close}, Volume=${latestData?.volume}.
      
      The user's question is: "${text}"

      Please provide a clear, concise, and educational answer suitable for a retail investor. Avoid giving direct financial advice. Explain concepts simply.
    `;

    try {
      const result = await geminiService.generateText(fullPrompt);
      setResponse(result);
    } catch (err) {
      setError('Failed to get response from AI. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setPrompt('');
    }
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
        <span>AI Assistant</span>
      </h3>
      
      <div className="space-y-4">
        <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-gray-700 p-3 rounded-md min-h-[100px]">
          {isLoading && <p>Thinking...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {response && <p>{response}</p>}
           {!isLoading && !response && !error && <p className="text-gray-500">Ask a question about the chart, technical indicators, or general crypto concepts.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map(p => (
            <button
              key={p}
              onClick={() => handlePromptSubmit(p)}
              disabled={isLoading}
              className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-md hover:bg-indigo-200 dark:hover:bg-indigo-500 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Explain Bollinger Bands..."
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {isLoading ? '...' : 'Ask'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
