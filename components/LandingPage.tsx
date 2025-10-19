import React, { useState, useEffect } from 'react';

interface LandingPageProps {
  onLaunch: () => void;
}

// Visual Components
const HeroChart: React.FC<{ isNight: boolean }> = ({ isNight }) => (
  <div className="relative w-full max-w-3xl mx-auto mt-12">
    <div className={`aspect-video p-4 rounded-xl shadow-2xl ${isNight ? 'bg-night-purple/50 border border-neon-cyan/20' : 'bg-white/80 border'}`}>
       {/* Chart SVG */}
       <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" className="overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="50" x2="400" y2="50" stroke={isNight ? '#3a3a3a' : '#e5e7eb'} strokeWidth="0.5"/>
            <line x1="0" y1="100" x2="400" y2="100" stroke={isNight ? '#3a3a3a' : '#e5e7eb'} strokeWidth="0.5"/>
            <line x1="0" y1="150" x2="400" y2="150" stroke={isNight ? '#3a3a3a' : '#e5e7eb'} strokeWidth="0.5"/>
            
            {/* Price Line */}
            <polyline points="20,120 80,80 140,100 200,60 260,90 320,50 380,70" fill="none" stroke={isNight ? '#00FBFB' : '#3b82f6'} strokeWidth="2" />
            
            {/* EMA Line */}
            <polyline points="20,110 80,95 140,98 200,75 260,85 320,65 380,70" fill="none" stroke={isNight ? '#F400F9' : '#f59e0b'} strokeWidth="1.5" strokeDasharray="3 3"/>
       </svg>
    </div>
    {/* Floating UI elements */}
    <div className={`absolute -top-4 -left-8 px-4 py-2 rounded-lg shadow-lg animate-float-light ${isNight ? 'bg-neon-pink text-white' : 'bg-indigo-500 text-white'}`}>AI Signal: Golden Cross</div>
    <div className={`absolute -bottom-6 -right-10 px-4 py-2 rounded-lg shadow-lg animate-float-heavy ${isNight ? 'bg-neon-cyan text-black' : 'bg-amber-400 text-black'}`}>Market Pulse: Strong Buy</div>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; isNight: boolean; }> = ({ icon, title, children, isNight }) => (
  <div className={`p-6 rounded-lg border transition-transform duration-300 hover:-translate-y-2 ${isNight ? 'bg-night-purple/30 border-neon-cyan/20 hover:border-neon-cyan/50' : 'bg-white/50 border-gray-200 hover:border-indigo-300'}`}>
    <div className={`rounded-lg w-12 h-12 flex items-center justify-center mb-4 ${isNight ? 'bg-neon-cyan/10 text-neon-cyan' : 'bg-indigo-100 text-indigo-500'}`}>
      {icon}
    </div>
    <h3 className={`text-xl font-bold mb-2 ${isNight ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
    <p className={`${isNight ? 'text-gray-400' : 'text-gray-600'}`}>{children}</p>
  </div>
);

const IndicatorShowcase: React.FC<{ name: string, description: string, isNight: boolean, children: React.ReactNode }> = ({ name, description, isNight, children }) => (
    <div className={`rounded-lg border overflow-hidden ${isNight ? 'bg-night-purple/30 border-neon-pink/20' : 'bg-white border-gray-200'}`}>
        <div className="p-4">
            <h4 className={`font-bold ${isNight ? 'text-neon-pink' : 'text-indigo-600'}`}>{name}</h4>
            <p className={`text-sm mt-1 ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
        </div>
        <div className={`h-24 ${isNight ? 'bg-night-purple/50' : 'bg-gray-50'}`}>
             {children}
        </div>
    </div>
);


const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    const night = hour < 7 || hour >= 19;
    setIsNight(night);
    document.documentElement.classList.toggle('dark', night);
    document.documentElement.classList.toggle('light', !night);
  }, []);

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isNight ? 'bg-night-gradient text-gray-200' : 'bg-day-gradient text-gray-800'}`}>
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${isNight ? 'text-neon-cyan' : 'text-indigo-500'}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 R-E-A-C-T-COMPONENTS a 1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold">Crypto Insight AI</h1>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="text-center py-16 px-6">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Trade Smarter, Not Harder.
          </h2>
           <h3 className={`text-5xl md:text-6xl font-extrabold leading-tight mt-2 bg-clip-text text-transparent ${isNight ? 'bg-gradient-to-r from-neon-cyan to-neon-pink' : 'bg-gradient-to-r from-indigo-500 to-sky-500'}`}>
              Your AI Co-Pilot for Crypto
           </h3>
          <p className={`mt-6 text-lg max-w-2xl mx-auto ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>
            Stop guessing. Start leveraging institutional-grade charting tools and AI-driven insights to find your edge in the fast-paced crypto market.
          </p>
          <HeroChart isNight={isNight} />
          <button
            onClick={onLaunch}
            className={`mt-16 px-8 py-4 font-bold rounded-lg shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out ${isNight ? 'bg-gradient-to-r from-neon-cyan to-neon-pink text-night-blue' : 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'}`}
          >
            Launch The Platform
          </button>
        </section>

        {/* Features Section */}
        <section className={`py-20 ${isNight ? 'bg-black/20' : 'bg-white/30'}`}>
          <div className="container mx-auto px-6 text-center">
             <h3 className="text-4xl font-bold mb-12">Everything You Need To Succeed</h3>
             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                <FeatureCard title="Pro-Level Charting" isNight={isNight} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                    Fast, fluid, and fully interactive charts built for serious analysis. No lag, no compromises.
                </FeatureCard>
                <FeatureCard title="Adaptive AI Strategies" isNight={isNight} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                    Our strategies adapt to market volatility, leveraging AI to identify high-probability setups and filter out noise.
                </FeatureCard>
                <FeatureCard title="Instant Market Pulse" isNight={isNight} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}>
                    Get an AI-generated summary of technical indicators for any timeframe. Know the market sentiment in a single glance.
                </FeatureCard>
                <FeatureCard title="Full Indicator Suite" isNight={isNight} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M4 4h16" /></svg>}>
                    From moving averages to complex tools like Ichimoku clouds, our library has you covered.
                </FeatureCard>
             </div>
          </div>
        </section>
        
        {/* Indicators and Strategies Showcase */}
        <section className="py-20">
            <div className="container mx-auto px-6 text-center">
                <h3 className="text-4xl font-bold">Master the Markets with Powerful Tools</h3>
                <p className={`mt-4 text-lg max-w-2xl mx-auto ${isNight ? 'text-gray-400' : 'text-gray-600'}`}>
                    We provide a comprehensive suite of battle-tested indicators and strategies. Here's a taste of what you can deploy.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
                    <IndicatorShowcase name="Ichimoku Cloud Breakout" description="Identify strong trends when the price breaks out of the 'Kumo' cloud." isNight={isNight}>
                        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none"><path d="M50,70 L80,75 L110,60 L140,80 L170,70" fill={isNight ? 'rgba(244,0,249,0.2)' : 'rgba(239, 68, 68, 0.2)'} /><path d="M50,60 L80,65 L110,50 L140,70 L170,60" fill={isNight ? 'rgba(0,251,251,0.2)' : 'rgba(34, 197, 94, 0.2)'} /><polyline points="10,80 40,60 70,70 100,40 130,50 160,30 190,40" stroke={isNight ? '#fff' : '#1f2937'} strokeWidth="1.5" fill="none"/></svg>
                    </IndicatorShowcase>
                    <IndicatorShowcase name="MACD Crossover" description="Pinpoint shifts in momentum when the MACD line crosses its signal line." isNight={isNight}>
                        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none"><rect x="10" y="55" width="5" height="10" fill={isNight ? '#F400F9' : '#ef4444'} /><rect x="20" y="52" width="5" height="16" fill={isNight ? '#F400F9' : '#ef4444'} /><rect x="30" y="48" width="5" height="24" fill={isNight ? '#F400F9' : '#ef4444'} /><rect x="40" y="53" width="5" height="14" fill={isNight ? '#00FBFB' : '#22c55e'} /><rect x="50" y="56" width="5" height="8" fill={isNight ? '#00FBFB' : '#22c55e'} /><polyline points="10,40 60,60 110,30 160,50 190,20" stroke={isNight ? '#00FBFB' : '#3b82f6'} strokeWidth="1.5" fill="none"/><polyline points="10,50 60,55 110,40 160,45 190,35" stroke={isNight ? '#F400F9' : '#f59e0b'} strokeWidth="1.5" fill="none"/></svg>
                    </IndicatorShowcase>
                    <IndicatorShowcase name="RSI Divergence" description="Spot potential trend reversals when price and RSI move in opposite directions." isNight={isNight}>
                        <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none"><polyline points="10,30 80,60 150,20" stroke={isNight ? '#fff' : '#1f2937'} strokeWidth="1.5" fill="none"/><line x1="10" y1="30" x2="150" y2="20" stroke={isNight ? '#F400F9' : '#ef4444'} strokeWidth="1" strokeDasharray="2 2"/><polyline points="10,90 80,70 150,80" stroke={isNight ? '#00FBFB' : '#3b82f6'} strokeWidth="1.5" fill="none"/><line x1="10" y1="90" x2="150" y2="80" stroke={isNight ? '#00FBFB' : '#22c55e'} strokeWidth="1" strokeDasharray="2 2"/></svg>
                    </IndicatorShowcase>
                </div>
            </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="text-center p-6 text-sm">
        <p className={`${isNight ? 'text-gray-500' : 'text-gray-600'}`}>Crypto Insight AI &copy; 2024</p>
      </footer>
    </div>
  );
};

export default LandingPage;