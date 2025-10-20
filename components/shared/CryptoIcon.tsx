
import React from 'react';

interface CryptoIconProps {
  symbol: string;
  className?: string;
}

export const CryptoIcon: React.FC<CryptoIconProps> = ({ symbol, className }) => {
  const getIcon = () => {
    const baseClass = className ? `${className} w-6 h-6` : 'w-6 h-6';
    const baseSymbol = symbol.toUpperCase().split('/')[0];
    switch (baseSymbol) {
      case 'BTC':
        return (
          <svg className={`${baseClass} text-orange-400`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.68.73C15.22.28 13.58 0 12 0 7.82 0 4.1 2.38 4.1 6.13c0 2.29 1.5 3.55 3.03 4.28.9.43 1.83.84 1.83 1.54 0 .61-.53.94-1.29.94-.78 0-1.47-.36-1.88-.73l-.75 2.53c.63.36 1.76.63 2.75.63 2.89 0 4.39-1.5 4.39-4.22 0-2.34-1.59-3.66-3.14-4.36-.87-.4-1.7-.76-1.7-1.52 0-.53.53-.84 1.18-.84.73 0 1.25.29 1.63.63l.74-2.48zM12 24c-2.49 0-4.5-2.01-4.5-4.5S9.51 15 12 15s4.5 2.01 4.5 4.5S14.49 24 12 24zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5S13.38 17 12 17z"/>
          </svg>
        );
      case 'ETH':
        return (
          <svg className={`${baseClass} text-indigo-500`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0l-1.93 6.94L12 9.43l1.93-2.49L12 0zm0 10.9l-1.93 2.49L12 24l1.93-10.62L12 10.9zm7.07-5.43L12 9.43l-7.07-3.96L12 0l7.07 5.47zm0 8.86L12 24l7.07-8.62-7.07-3.96zM4.93 5.47L12 9.43 4.93 5.47zM4.93 15.38L12 11.43l-7.07 3.95.01-.01z"/>
          </svg>
        );
      case 'XRP':
        return (
          <svg className={`${baseClass} text-blue-500`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm4.23 6.88l-2.11 2.11c-.34.34-.89.34-1.23 0L9.4 5.5c-.34-.34-.34-.89 0-1.23l2.11-2.11c.34-.34.89-.34 1.23 0l3.49 3.49c.34.34.34.89 0 1.23zm-8.46 0l2.11 2.11c.34.34.34.89 0 1.23L6.39 13.7c-.34.34-.89.34-1.23 0l-2.11-2.11c-.34-.34-.34-.89 0-1.23l3.49-3.49c.33-.34.88-.34 1.22 0zm8.46 10.24l-2.11-2.11c-.34-.34-.34-.89 0-1.23l3.49-3.49c.34-.34.89-.34 1.23 0l2.11 2.11c.34.34.34.89 0 1.23l-3.49 3.49c-.34.34-.89.34-1.23 0z"/>
          </svg>
        );
      case 'SOL':
        return (
          <svg className={`${baseClass} text-green-400`} fill="currentColor" viewBox="0 0 24 24">
             <path d="M6.34,19.34,3.51,16.51a1,1,0,0,1,0-1.42L14.7,3.9a1,1,0,0,1,1.42,0l2.83,2.83a1,1,0,0,1,0,1.42L7.76,19.34A1,1,0,0,1,6.34,19.34Zm11.32-9.9L6.47,20.62a1,1,0,0,1-1.42,0L2.22,17.79a1,1,0,0,1,0-1.42L13.41,5.18a1,1,0,0,1,1.42,0Z"/>
          </svg>
        );
      default:
        return <div className={`${baseClass} bg-gray-400 rounded-full`}></div>;
    }
  };
  return getIcon();
};
