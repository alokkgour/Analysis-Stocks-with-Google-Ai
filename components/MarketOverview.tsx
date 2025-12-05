import React from 'react';
import { MarketAnalysis, Sentiment } from '../types';

interface MarketOverviewProps {
  analysis: MarketAnalysis;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ analysis }) => {
  const isBullish = analysis.marketSentiment === Sentiment.BULLISH;
  const isBearish = analysis.marketSentiment === Sentiment.BEARISH;

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 mb-8 shadow-md">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sentiment Indicator */}
        <div className="md:w-1/4 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-700 pb-4 md:pb-0">
          <span className="text-slate-400 text-sm uppercase tracking-wider mb-2">Market Sentiment</span>
          <div className={`text-3xl font-extrabold ${isBullish ? 'text-green-400' : isBearish ? 'text-red-400' : 'text-yellow-400'}`}>
            {analysis.marketSentiment}
          </div>
        </div>

        {/* Summary Text */}
        <div className="md:w-2/5">
          <h4 className="text-slate-200 font-semibold mb-2">AI Strategist Summary</h4>
          <p className="text-slate-400 text-sm leading-6">
            {analysis.overallSummary}
          </p>
        </div>

        {/* Sectors Visualization */}
        <div className="md:w-1/3 flex flex-col gap-4">
          <div>
             <span className="text-xs text-green-500 uppercase font-bold flex justify-between">
                Strong Sectors <span>Strength</span>
             </span>
             <div className="flex flex-col gap-2 mt-2">
               {analysis.topSectors.length > 0 ? (
                 analysis.topSectors.map((s, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <span className="text-xs text-slate-300 w-24 truncate">{s.name}</span>
                     <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${(s.strength / 10) * 100}%` }}
                       ></div>
                     </div>
                   </div>
                 ))
               ) : (
                 <span className="text-xs text-slate-500">None detected</span>
               )}
             </div>
          </div>
          <div>
             <span className="text-xs text-red-500 uppercase font-bold flex justify-between">
                Weak Sectors <span>Weakness</span>
             </span>
             <div className="flex flex-col gap-2 mt-2">
               {analysis.weakSectors.length > 0 ? (
                 analysis.weakSectors.map((s, i) => (
                   <div key={i} className="flex items-center gap-2">
                     <span className="text-xs text-slate-300 w-24 truncate">{s.name}</span>
                     <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-red-500 rounded-full" 
                        style={{ width: `${(s.strength / 10) * 100}%` }}
                       ></div>
                     </div>
                   </div>
                 ))
               ) : (
                 <span className="text-xs text-slate-500">None detected</span>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketOverview;