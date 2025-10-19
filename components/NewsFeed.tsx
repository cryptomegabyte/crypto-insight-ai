import React, { useState, useEffect } from 'react';
import type { Pair, NewsArticle } from '../types';

interface NewsFeedProps {
  pair: Pair;
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-3 8h.01" />
        </svg>
        <span>{title}</span>
    </h3>
    {children}
  </div>
);


const NewsFeed: React.FC<NewsFeedProps> = ({ pair }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsData = () => {
      setLoading(true);
      setError(null);
      setSummary('');
      setArticles([]);
      
      // Simulate API delay
      setTimeout(() => {
        // Mock news data
        const mockSummary = `Recent ${pair.name} market activity shows increased volatility with strong trading volume across major exchanges.`;
        const mockArticles: NewsArticle[] = [
          { title: `${pair.name} Shows Strong Market Performance`, uri: 'https://example.com/news1' },
          { title: `Analysts Predict Continued Interest in ${pair.name}`, uri: 'https://example.com/news2' },
          { title: `${pair.name} Trading Volume Increases`, uri: 'https://example.com/news3' },
          { title: `Market Update: ${pair.name} Analysis`, uri: 'https://example.com/news4' },
          { title: `${pair.name} Technical Breakdown`, uri: 'https://example.com/news5' },
        ];
        
        setSummary(mockSummary);
        setArticles(mockArticles);
        setLoading(false);
      }, 500);
    };

    fetchNewsData();
  }, [pair]);

  return (
    <Card title="Latest News">
      <div className="space-y-4">
        {loading && <p className="text-sm text-gray-500">Fetching news...</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        {!loading && !error && (
          <>
            {summary && <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{summary}</p>}
            <ul className="space-y-3">
              {articles.length > 0 ? articles.map((article, index) => (
                <li key={index}>
                  <a
                    href={article.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-500 hover:text-indigo-400 group"
                  >
                    <p className="text-sm font-semibold group-hover:underline">{article.title}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{new URL(article.uri).hostname}</p>
                  </a>
                </li>
              )) : <p className="text-sm text-gray-500">No recent news found.</p>}
            </ul>
          </>
        )}
      </div>
    </Card>
  );
};

export default NewsFeed;
