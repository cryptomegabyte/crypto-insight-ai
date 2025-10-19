import React from 'react';

interface AIChartSummaryProps {
  summary: string;
  isLoading: boolean;
  theme: 'light' | 'dark';
}

const AIChartSummary: React.FC<AIChartSummaryProps> = ({ summary, isLoading, theme }) => {
  return (
    <div 
      className={`absolute top-4 left-4 z-10 p-3 rounded-lg shadow-lg max-w-sm transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-gray-900/70 border border-gray-700 backdrop-blur-sm' 
        : 'bg-white/70 border border-gray-200 backdrop-blur-sm'
      }`}
    >
      <h4 className="font-bold text-sm mb-2 flex items-center space-x-2 text-indigo-500 dark:text-indigo-400">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        <span>AI Chart Analyst</span>
      </h4>
      {isLoading ? (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">Analyzing chart...</p>
      ) : (
        <p className="text-xs text-gray-700 dark:text-gray-300">
          {summary}
        </p>
      )}
    </div>
  );
};

export default AIChartSummary;