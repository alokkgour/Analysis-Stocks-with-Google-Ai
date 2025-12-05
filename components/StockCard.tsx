import React, { useState, useEffect } from 'react';
import { StockRecommendation, RecommendationType } from '../types';
import { Target, ShieldAlert, TrendingUp, Zap, Bell, BellRing } from 'lucide-react';

interface StockCardProps {
  stock: StockRecommendation;
  onAlertTrigger: (symbol: string, type: 'TARGET' | 'STOP_LOSS', price: number) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onAlertTrigger }) => {
  const isBuy = stock.recommendation === RecommendationType.BUY;
  
  // Parse initial price
  const initialPrice = parseFloat(stock.currentPrice.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
  const targetPriceVal = parseFloat(stock.targetPrice.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;
  const stopLossVal = parseFloat(stock.stopLoss.replace(/,/g, '').replace(/[^0-9.]/g, '')) || 0;

  const [livePrice, setLivePrice] = useState<number>(initialPrice);
  const [targetAlert, setTargetAlert] = useState(false);
  const [slAlert, setSlAlert] = useState(false);
  const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');

  // Dynamic border color based on horizon
  let borderColor = "border-slate-700";
  if (stock.tradeHorizon === 'BTST') borderColor = "border-indigo-500/50";
  if (stock.tradeHorizon === 'INTRADAY') borderColor = "border-blue-500/50";

  // Simulate Live Ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrice((prev) => {
        const volatility = 0.0015; // 0.15% fluctuation
        const change = prev * volatility * (Math.random() - 0.5);
        const newPrice = prev + change;
        
        setPriceDirection(newPrice > prev ? 'up' : 'down');
        
        // Check Alerts
        if (targetAlert && isBuy && newPrice >= targetPriceVal) {
          onAlertTrigger(stock.symbol, 'TARGET', newPrice);
          setTargetAlert(false); // Disable after trigger
        }
        if (targetAlert && !isBuy && newPrice <= targetPriceVal) {
             onAlertTrigger(stock.symbol, 'TARGET', newPrice);
             setTargetAlert(false);
        }

        if (slAlert && isBuy && newPrice <= stopLossVal) {
          onAlertTrigger(stock.symbol, 'STOP_LOSS', newPrice);
          setSlAlert(false);
        }
        if (slAlert && !isBuy && newPrice >= stopLossVal) {
            onAlertTrigger(stock.symbol, 'STOP_LOSS', newPrice);
            setSlAlert(false);
        }

        return newPrice;
      });
    }, 5000); // Update every 5 seconds for simulation

    return () => clearInterval(interval);
  }, [stock.symbol, targetAlert, slAlert, isBuy, targetPriceVal, stopLossVal, onAlertTrigger]);


  return (
    <div className={`bg-slate-800 border ${borderColor} rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full relative overflow-hidden group`}>
      
      {/* Background Glow Effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 pointer-events-none ${isBuy ? 'bg-green-500' : 'bg-red-500'}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <h3 className="text-xl font-bold text-white tracking-tight">{stock.symbol}</h3>
             <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded uppercase font-semibold tracking-wider">{stock.tradeHorizon}</span>
          </div>
          <p className="text-xs text-slate-400">{stock.companyName}</p>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex flex-col items-center ${isBuy ? 'bg-green-900/40 text-green-400 ring-1 ring-green-700' : 'bg-red-900/40 text-red-400 ring-1 ring-red-700'}`}>
          <span>{stock.recommendation}</span>
          <span className="text-[10px] opacity-80 font-normal">{stock.setupType.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Main Signal Box */}
      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 mb-4 grid grid-cols-2 gap-y-3 gap-x-2 relative z-10">
         <div className="col-span-2 flex justify-between border-b border-slate-700/50 pb-2 mb-1 items-end">
            <span className="text-xs text-slate-400 uppercase font-semibold">Live Price</span>
            <div className="text-right">
                <span className={`text-lg font-mono font-bold transition-colors duration-500 ${priceDirection === 'up' ? 'text-green-400' : priceDirection === 'down' ? 'text-red-400' : 'text-white'}`}>
                    {livePrice.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-500 block">Simulated Feed</span>
            </div>
         </div>
         
         <div>
            <div className="flex items-center gap-1 text-xs text-slate-400 mb-1">
               <TrendingUp className="w-3 h-3" /> Entry Zone
            </div>
            <p className="text-sm font-semibold text-blue-200">{stock.entryRange}</p>
         </div>
         
         <div className="relative group/target">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
               <div className="flex items-center gap-1"><Target className="w-3 h-3 text-green-400" /> Target</div>
               <button 
                onClick={() => setTargetAlert(!targetAlert)}
                className={`transition-colors ${targetAlert ? 'text-green-400' : 'text-slate-600 hover:text-green-400'}`}
                title="Alert on Target"
               >
                 {targetAlert ? <BellRing className="w-3 h-3 animate-pulse" /> : <Bell className="w-3 h-3" />}
               </button>
            </div>
            <p className="text-sm font-semibold text-green-400">{stock.targetPrice}</p>
         </div>

         <div className="col-span-2 pt-1 border-t border-slate-700/50 flex justify-between items-center relative group/sl">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <ShieldAlert className="w-3 h-3 text-red-400" /> Stop Loss
                </div>
            </div>
            <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-red-400">{stock.stopLoss}</p>
                <button 
                    onClick={() => setSlAlert(!slAlert)}
                    className={`transition-colors ${slAlert ? 'text-red-400' : 'text-slate-600 hover:text-red-400'}`}
                    title="Alert on Stop Loss"
                >
                    {slAlert ? <BellRing className="w-3 h-3 animate-pulse" /> : <Bell className="w-3 h-3" />}
                </button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4 text-xs relative z-10">
        <div>
          <p className="text-slate-500 uppercase mb-0.5">Volume</p>
          <p className="text-slate-300 font-medium truncate" title={stock.volumeAnalysis}>{stock.volumeAnalysis}</p>
        </div>
        <div>
           <p className="text-slate-500 uppercase mb-0.5">Sector</p>
           <div className="flex items-center gap-1">
             <p className="text-slate-300 font-medium truncate">{stock.sector}</p>
           </div>
        </div>
      </div>

      <div className="mb-4 bg-slate-700/20 p-2.5 rounded border border-slate-700/30 relative z-10">
        <div className="flex items-start gap-2">
            <Zap className={`w-3 h-3 mt-0.5 flex-shrink-0 ${stock.newsImpact === 'HIGH' ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
                <p className="text-xs text-slate-300 italic leading-snug">"{stock.newsSummary}"</p>
                {stock.newsImpact === 'HIGH' && (
                    <span className="text-[9px] text-red-300 bg-red-900/30 px-1 rounded ml-1 font-bold">HIGH IMPACT</span>
                )}
            </div>
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-slate-700 relative z-10">
        <p className="text-[10px] text-slate-500 uppercase mb-1 font-bold">Analysis</p>
        <p className="text-xs text-slate-300 leading-relaxed">{stock.reasoning}</p>
      </div>
    </div>
  );
};

export default StockCard;