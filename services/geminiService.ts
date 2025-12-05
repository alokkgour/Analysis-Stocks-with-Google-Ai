import { GoogleGenAI, Tool } from "@google/genai";
import { MarketIndex, MarketAnalysis, Sentiment } from "../types";

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

// Clean markdown code blocks from string
const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|```/g, '').trim();
};

export const analyzeMarket = async (index: MarketIndex): Promise<MarketAnalysis> => {
  const modelId = "gemini-2.5-flash"; 
  
  const prompt = `
    Act as an elite Live Trader and Technical Analyst for the Indian Stock Market (NSE).
    I need actionable **Buy Today Sell Tomorrow (BTST)**, **Intraday**, or **Swing Trading** suggestions for **${index}**.

    **Goal:** Do NOT just list stocks that have already gained 5% today. Find stocks that are **setting up** for a move NOW or TOMORROW.

    **Strategy to follow:**
    1.  **Search Phase (Live Data)**: 
        *   Find stocks with **unusual volume spikes** happening right now.
        *   Identify sectors experiencing **live rotation** (money flowing in/out today).
        *   Look for "High Delivery Percentage" stocks (indicates positioning for tomorrow).
        *   Find stocks near key **Breakout levels** or **Support zones**.
        *   **News Analysis**: Prioritize news from the LAST 2 HOURS. Differentiate between "General Company Updates" (Low Impact) and "Price Sensitive News" (High Impact) like earnings, orders, or regulatory changes.
    
    2.  **Analysis Phase (Predictive)**:
        *   **For BUY:** Look for "Bullish Flag patterns", "Support Bounces", or "Volume Breakouts" happening now. 
        *   **For SELL:** Look for "Resistance Rejection", "Head and Shoulders breakdowns", or "Weak structures".
        *   Determine strictly: Entry Range, Target, and Stop Loss.
        *   Classify the trade: Is it for today (INTRADAY) or for tomorrow (BTST)?
        *   **Sector Strength**: Rate strong and weak sectors on a scale of 1-10 based on momentum.

    3.  **Output**:
        *   Select the top 4-6 best **forward-looking** setups.
        *   Provide the output strictly in the following JSON format inside a code block. 
    
    **JSON Schema:**
    {
      "marketSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
      "overallSummary": "Brief outlook on whether to buy dips or sell rallies today/tomorrow.",
      "topSectors": [ {"name": "Sector Name", "strength": 8} ], // Strength 1-10
      "weakSectors": [ {"name": "Sector Name", "strength": 8} ], // Strength 1-10
      "stocks": [
        {
          "symbol": "TICKER",
          "companyName": "Company Name",
          "currentPrice": "Live Price INR (e.g. 1240.50)",
          "entryRange": "Ideal Buy/Sell Zone",
          "targetPrice": "Projected Target (e.g. 1260.00)",
          "stopLoss": "Strict Stop Loss (e.g. 1230.00)",
          "tradeHorizon": "INTRADAY" | "BTST" | "SWING",
          "setupType": "BREAKOUT" | "REVERSAL" | "MOMENTUM" | "SUPPORT_BOUNCE",
          "sector": "Sector Name",
          "sectorSentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
          "volumeAnalysis": "e.g., 2x Avg Volume, Accumulation detected",
          "newsSummary": "Key catalyst or reason",
          "newsImpact": "HIGH" | "MEDIUM" | "LOW",
          "recommendation": "BUY" | "SELL",
          "reasoning": "Technical setup description (e.g. crossing 200 EMA with volume)"
        }
      ]
    }
  `;

  const tools: Tool[] = [{ googleSearch: {} }];

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: tools,
        systemInstruction: "You are a forward-looking market strategist. You focus on future potential, not past performance. You give precise levels.",
        temperature: 0.2
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sourceUrls = groundingChunks
      .map((chunk) => chunk.web)
      .filter((web) => web !== undefined)
      .map((web) => ({ title: web.title || 'Source', uri: web.uri || '#' }));

    const text = response.text;
    
    let parsedData: any = {};
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(cleanJsonString(jsonMatch[0]));
      } catch (e) {
        console.error("JSON parse error:", e);
        throw new Error("Failed to parse market data structure.");
      }
    } else {
        throw new Error("No structured data found in analysis.");
    }

    // Map to strictly typed interface
    const analysis: MarketAnalysis = {
      marketSentiment: parsedData.marketSentiment || Sentiment.NEUTRAL,
      overallSummary: parsedData.overallSummary || "Analysis complete.",
      topSectors: (parsedData.topSectors || []).map((s: any) => ({
        name: s.name || s,
        strength: typeof s.strength === 'number' ? s.strength : 5
      })),
      weakSectors: (parsedData.weakSectors || []).map((s: any) => ({
        name: s.name || s,
        strength: typeof s.strength === 'number' ? s.strength : 5
      })),
      stocks: (parsedData.stocks || []).map((s: any) => ({
        symbol: s.symbol,
        companyName: s.companyName,
        currentPrice: s.currentPrice,
        entryRange: s.entryRange || "At Market",
        targetPrice: s.targetPrice || "TBD",
        stopLoss: s.stopLoss || "TBD",
        tradeHorizon: s.tradeHorizon || "INTRADAY",
        setupType: s.setupType || "MOMENTUM",
        sector: s.sector,
        sectorSentiment: s.sectorSentiment,
        volumeAnalysis: s.volumeAnalysis,
        newsSummary: s.newsSummary,
        newsImpact: s.newsImpact || "LOW",
        recommendation: s.recommendation,
        reasoning: s.reasoning
      })),
      sourceUrls: sourceUrls
    };

    return analysis;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "An unexpected error occurred while analyzing the market.");
  }
};