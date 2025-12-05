import React, { useState } from 'react';
import { MarketIndex, MarketAnalysis } from './types';
import { analyzeMarket } from './services/geminiService';
import StockCard from './components/StockCard';
import MarketOverview from './components/MarketOverview';
import { 
  TrendingUp, 
  Search, 
  BarChart2, 
  Activity, 
  AlertCircle,
  ExternalLink,
  Clock,
  Zap,
  Target,
  BellRing,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<MarketIndex>(MarketIndex.NIFTY_50);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<MarketAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Toast State
  const [toasts, setToasts] = useState<{id: number, message: string, type: 'success' | 'danger'}[]>([]);

  const addToast = (message: string, type: 'success' | 'danger') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove after 5 seconds
    setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAlertTrigger = (symbol: string, type: 'TARGET' | 'STOP_LOSS', price: number) => {
    const message = type === 'TARGET' 
        ? `${symbol} hit Target Price at ${price.toFixed(2)}!` 
        : `${symbol} hit Stop Loss at ${price.toFixed(2)}!`;
    const toastType = type === 'TARGET' ? 'success' : 'danger';
    addToast(message, toastType);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await analyzeMarket(selectedIndex);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 relative">
      
      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
            <div 
                key={toast.id} 
                className={`min-w-[300px] p-4 rounded-lg shadow-2xl border flex items-center justify-between animate-fade-in-up ${
                    toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-green-100' : 'bg-red-900/90 border-red-500 text-red-100'
                }`}
            >
                <div className="flex items-center gap-3">
                    <BellRing className="w-5 h-5 animate-bounce" />
                    <span className="font-semibold text-sm">{toast.message}</span>
                </div>
                <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100"><X className="w-4 h-4"/></button>
            </div>
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-900/20">
              <Target className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              NiftyAI Live Trader
            </h1>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block font-medium">
            Predictive Engine • Gemini 2.5 • Live Simulation
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Section */}
        <section className="mb-10 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-3">
            Predictive Market Analysis
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Scan {selectedIndex} for <span className="text-indigo-400 font-semibold">Live Breakouts</span>, <span className="text-blue-400 font-semibold">BTST</span>, and <span className="text-green-400 font-semibold">Intraday</span> opportunities.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-slate-900 p-2 rounded-2xl border border-slate-800 inline-flex shadow-xl">
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(e.target.value as MarketIndex)}
              className="bg-slate-800 text-white border border-slate-700 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto appearance-none cursor-pointer hover:bg-slate-750 transition-colors font-medium"
            >
              {Object.values(MarketIndex).map((index) => (
                <option key={index} value={index}>{index}</option>
              ))}
            </select>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`
                px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all w-full sm:w-auto justify-center
                ${loading 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 active:scale-95'}
              `}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-200 border-t-transparent"></div>
                  Scanning Market...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  Find Trades
                </>
              )}
            </button>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="max-w-3xl mx-auto bg-red-900/20 border border-red-700/50 text-red-200 p-4 rounded-xl flex items-start gap-3 mb-8 animate-fade-in">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Scan Failed</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {data && (
          <div className="animate-fade-in-up space-y-8">
            <MarketOverview analysis={data} />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-6 h-6 text-indigo-400" />
                  <h3 className="text-2xl font-bold text-white">Actionable Setups</h3>
                </div>
                <div className="flex gap-3 text-xs font-semibold">
                   <span className="flex items-center gap-1 bg-indigo-900/30 text-indigo-300 px-2 py-1 rounded border border-indigo-800"><Clock className="w-3 h-3"/> BTST</span>
                   <span className="flex items-center gap-1 bg-blue-900/30 text-blue-300 px-2 py-1 rounded border border-blue-800"><Zap className="w-3 h-3"/> Intraday</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.stocks.map((stock, idx) => (
                  <StockCard 
                    key={idx} 
                    stock={stock} 
                    onAlertTrigger={handleAlertTrigger}
                  />
                ))}
              </div>

              {data.stocks.length === 0 && (
                <div className="text-center py-16 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-lg">No high-probability setups found right now.</p>
                  <p className="text-sm opacity-60">The market might be choppy or sideways.</p>
                </div>
              )}
            </div>

            {/* Grounding Sources */}
            {data.sourceUrls.length > 0 && (
              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ExternalLink className="w-3 h-3" />
                  Live Data Sources
                </h4>
                <div className="flex flex-wrap gap-3">
                  {data.sourceUrls.map((source, idx) => (
                    <a 
                      key={idx}
                      href={source.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 bg-slate-900 hover:bg-slate-800 hover:text-indigo-400 px-3 py-2 rounded-lg border border-slate-800 transition-colors flex items-center gap-2"
                    >
                      <span className="truncate max-w-[200px]">{source.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State / Initial View */}
        {!data && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-12">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 hover:border-indigo-500/30 transition-colors">
              <div className="w-12 h-12 bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">BTST Strategy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Identifies strong closing stocks with high delivery percentages to buy today and sell tomorrow for a gap-up profit.
              </p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 hover:border-blue-500/30 transition-colors">
              <div className="w-12 h-12 bg-blue-900/20 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Live Breakouts</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scans for stocks breaking key resistance levels with volume spikes occurring right now in the live market.
              </p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800/60 hover:border-green-500/30 transition-colors">
              <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center mb-4 text-green-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Precise Levels</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates specific Entry Zones, Target Prices, and strict Stop Loss levels based on technical chart patterns.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;