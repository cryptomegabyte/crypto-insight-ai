import React, { useState } from 'react';
import type { Opportunity } from '../types';
import type { ScoredOpportunity } from '../lib/scoringEngine';

const OpportunityCard: React.FC<{ opportunity: Opportunity | ScoredOpportunity }> = ({ opportunity }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isScoredOpportunity = 'confidence' in opportunity;
    const scored = opportunity as ScoredOpportunity;

    const getIcon = () => {
        switch (opportunity.type) {
            case 'Pattern': return ' M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'; // Chart line up
            case 'Indicator': return ' M7 12l3-3 3 3 4-4M8 21l4-4 4 4M4 4h16'; // Indicator icon
            case 'Volatility': return ' M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'; // Sparkles
            case 'News': return ' M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 12h6m-3 8h.01'; // Newspaper
        }
    };
    
    const getAccentColor = () => {
        switch (opportunity.type) {
            case 'Pattern': return 'border-l-4 border-indigo-400';
            case 'Indicator': return 'border-l-4 border-teal-400';
            case 'Volatility': return 'border-l-4 border-amber-400';
            case 'News': return 'border-l-4 border-rose-400';
        }
    };

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case 'strong_signal': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
            case 'consider': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
            case 'watch': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
            default: return '';
        }
    };

    const getRiskBadgeColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 dark:text-green-400';
            case 'medium': return 'text-yellow-600 dark:text-yellow-400';
            case 'high': return 'text-red-600 dark:text-red-400';
            default: return '';
        }
    };

    const handleCardClick = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md transition-all duration-300 ${getAccentColor()} hover:shadow-lg`}>
            <button onClick={handleCardClick} className="w-full text-left p-3 sm:p-4 active:bg-gray-50 dark:active:bg-gray-700 transition-colors">
                <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getIcon()} />
                        </svg>
                    </div>
                    <div className="flex-grow min-w-0">
                        <p className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-100">{opportunity.title}</p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{opportunity.description}</p>
                        {isScoredOpportunity && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getActionBadgeColor(scored.suggestedAction)}`}>
                                    {scored.suggestedAction === 'strong_signal' ? '🔥 Strong Signal' : scored.suggestedAction === 'consider' ? '👍 Consider' : '👀 Watch'}
                                </span>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 dark:bg-gray-700`}>
                                    📊 {scored.confidence}% confidence
                                </span>
                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeColor(scored.riskLevel)} bg-gray-100 dark:bg-gray-700`}>
                                    ⚠️ {scored.riskLevel}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </div>
            </button>
            {isExpanded && isScoredOpportunity && (
                <div className="px-4 pb-4">
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                        <h4 className="font-bold text-sm mb-2 text-indigo-500 dark:text-indigo-400">📚 Why This Matters</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{scored.rationale}</p>
                    </div>
                </div>
            )}
        </div>
    );
};


const OpportunityFeed: React.FC<{ opportunities: Opportunity[] | ScoredOpportunity[] }> = ({ opportunities }) => {
    // Sort opportunities: strong signals first, then by confidence
    const sorted = [...opportunities].sort((a, b) => {
        if ('suggestedAction' in a && 'suggestedAction' in b) {
            const actionOrder = { 'strong_signal': 0, 'consider': 1, 'watch': 2 };
            if (actionOrder[a.suggestedAction as keyof typeof actionOrder] !== actionOrder[b.suggestedAction as keyof typeof actionOrder]) {
                return actionOrder[a.suggestedAction as keyof typeof actionOrder] - actionOrder[b.suggestedAction as keyof typeof actionOrder];
            }
            return (b.confidence || 0) - (a.confidence || 0);
        }
        return 0;
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-full flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <span>Trading Opportunities</span>
                </h3>
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{opportunities.length} signal(s) detected</p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {opportunities.length > 0 ? (
                    sorted.map(op => <OpportunityCard key={op.id} opportunity={op} />)
                ) : (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-500">No signals detected right now.</p>
                        <p className="text-xs text-gray-400 mt-1">Monitoring for patterns...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpportunityFeed;
