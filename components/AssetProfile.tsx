
import React from 'react';
import type { AssetProfileData } from '../types';

interface AssetProfileProps {
  profile: AssetProfileData;
}

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
    <h3 className="text-lg font-bold mb-3 text-gray-800 dark:text-white">{title}</h3>
    {children}
  </div>
);

const AssetProfile: React.FC<AssetProfileProps> = ({ profile }) => {
  return (
    <Card title="Asset Profile">
      <div className="space-y-4">
        <div>
          <h4 className="font-bold text-md">{profile.name} ({profile.symbol})</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.description}</p>
        </div>
        <div>
          <h5 className="font-semibold text-sm mb-2">Links</h5>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(profile.links).map(([key, value]) => value && (
              <a 
                key={key} 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-indigo-500 hover:text-indigo-400 capitalize truncate"
              >
                {key}
              </a>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AssetProfile;
