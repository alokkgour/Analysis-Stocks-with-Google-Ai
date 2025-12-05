export enum MarketIndex {
  NIFTY_50 = 'NIFTY 50',
  BANK_NIFTY = 'BANK NIFTY',
  NIFTY_500 = 'NIFTY 500',
}

export enum RecommendationType {
  BUY = 'BUY',
  SELL = 'SELL',
  HOLD = 'HOLD',
  AVOID = 'AVOID'
}

export enum Sentiment {
  BULLISH = 'BULLISH',
  BEARISH = 'BEARISH',
  NEUTRAL = 'NEUTRAL'
}

export type TradeHorizon = 'INTRADAY' | 'BTST' | 'SWING' | 'POSITIONAL';
export type SetupType = 'BREAKOUT' | 'REVERSAL' | 'MOMENTUM' | 'SUPPORT_BOUNCE' | 'RESISTANCE_REJECTION';

export interface StockRecommendation {
  symbol: string;
  companyName: string;
  currentPrice: string;
  entryRange: string; // e.g. "1200 - 1205"
  targetPrice: string;
  stopLoss: string;
  tradeHorizon: TradeHorizon;
  setupType: SetupType;
  sector: string;
  sectorSentiment: Sentiment;
  volumeAnalysis: string;
  newsSummary: string;
  newsImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: RecommendationType;
  reasoning: string;
}

export interface SectorPerformance {
  name: string;
  strength: number; // 1 to 10 scale
}

export interface MarketAnalysis {
  marketSentiment: Sentiment;
  overallSummary: string;
  topSectors: SectorPerformance[];
  weakSectors: SectorPerformance[];
  stocks: StockRecommendation[];
  sourceUrls: { title: string; uri: string }[];
}

export interface ServiceResponse {
  analysis: MarketAnalysis | null;
  rawText: string;
  error?: string;
}