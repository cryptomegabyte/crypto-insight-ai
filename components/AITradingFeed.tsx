import { useState, useEffect, useRef } from 'react';
import type { AIFeedItem } from '../lib/aiTradingFeed';

interface AITradingFeedProps {
  feedItems: AIFeedItem[];
  onActionClick: (action: string, item: AIFeedItem) => void;
  onClearFeed: () => void;
}

export default function AITradingFeed({ feedItems, onActionClick, onClearFeed }: AITradingFeedProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const feedEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest item
  useEffect(() => {
    if (feedItems.length > 0) {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feedItems.length]);

  const filteredItems = filter === 'all' 
    ? feedItems 
    : feedItems.filter(item => item.severity === filter);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'low': return 'bg-blue-500/20 border-blue-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pattern': return '📊';
      case 'alert': return '⚠️';
      case 'education': return '💡';
      case 'insight': return '🔍';
      case 'volume': return '📈';
      case 'momentum': return '⚡';
      default: return '📌';
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <h2 className="text-lg font-bold text-white">AI Trading Feed</h2>
          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
            Live
          </span>
        </div>
        <button
          onClick={onClearFeed}
          className="text-gray-400 hover:text-white text-sm transition-colors"
          title="Clear feed"
        >
          Clear
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 p-3 border-b border-gray-700">
        {(['all', 'high', 'medium', 'low'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-1 text-xs opacity-70">
                ({feedItems.filter(i => i.severity === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Feed Items */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center p-6">
            <span className="text-4xl mb-3">📡</span>
            <p className="text-sm">
              {filter === 'all' 
                ? 'Monitoring markets... AI insights will appear here'
                : `No ${filter} priority items`}
            </p>
            <p className="text-xs mt-2 opacity-70">
              Switch pairs or wait for market events
            </p>
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <div
              key={item.id || index}
              className={`p-3 rounded-lg border ${getSeverityColor(item.severity)} backdrop-blur-sm transition-all hover:scale-[1.02]`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getTypeIcon(item.type)}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-blue-400">{item.pair}</span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-400">{getTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                {item.description}
              </p>

              {/* Actions */}
              {item.actionable && item.actions && item.actions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {item.actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onActionClick(action.action, item)}
                      className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs font-medium rounded transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={feedEndRef} />
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-gray-700 bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{feedItems.length} total insights</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Monitoring
          </span>
        </div>
      </div>
    </div>
  );
}
