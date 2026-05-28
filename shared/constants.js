export const GAME_DURATIONS = [
  { label: "1 MIN", seconds: 60 },
  { label: "3 MIN", seconds: 180 },
  { label: "5 MIN", seconds: 300 },
];

export const DEFAULT_DURATION = 60;
export const TICK_MS = 250;
export const STARTING_CASH = 10_000;
export const MAX_HISTORY = 200;

export const STOCKS = [
  { symbol: "NXT", name: "NextGen Tech", color: "#00E5FF", volatility: 0.045, drift: 0.002, basePrice: 120, risk: "HIGH RISK", desc: "AI & chip maker. Moves on tech breakthroughs, chip shortages, and defense contracts." },
  { symbol: "ECO", name: "EcoPower Solar", color: "#76FF03", volatility: 0.035, drift: 0.001, basePrice: 42, risk: "MED RISK", desc: "Solar energy installer. Driven by government subsidies, tax credits, and oil prices." },
  { symbol: "CART", name: "FreshCart Retail", color: "#FFD600", volatility: 0.02, drift: 0.0005, basePrice: 75, risk: "LOW-MED", desc: "National grocery chain. Tracks consumer spending, inflation, and supply chains." },
  { symbol: "SAFE", name: "SafeHaven Bonds", color: "#FF9100", volatility: 0.008, drift: 0.0002, basePrice: 95, risk: "LOW RISK", desc: "U.S. Treasury bonds. A safe place to park cash when the market gets scary." },
];

export const BADGES = [
  { id: "first_trade", label: "First Trade", icon: "🏁", key: "totalTrades", min: 1, desc: "Execute your first trade", threshold: "1 trade" },
  { id: "profit", label: "In The Green", icon: "💚", key: "returnPct", min: 0.01, desc: "Finish with a positive return", threshold: "> 0% return" },
  { id: "double", label: "Doubled Up", icon: "🚀", key: "returnPct", min: 100, desc: "Double your starting cash", threshold: "+100% return" },
  { id: "diamond", label: "Diamond Hands", icon: "💎", key: "longestHold", min: 20, desc: "Hold a position through volatility", threshold: "Hold 20+ ticks" },
  { id: "trader", label: "Day Trader", icon: "📈", key: "totalTrades", min: 15, desc: "Trade at high frequency", threshold: "15+ trades" },
  { id: "diversified", label: "Diversified", icon: "🎯", key: "uniqueStocks", min: 3, desc: "Trade at least 3 different stocks", threshold: "3+ stocks traded" },
  { id: "whale", label: "Whale", icon: "🐋", key: "biggestPosition", min: 5000, desc: "Build a massive single position", threshold: "$5,000+ position" },
  { id: "rekt", label: "Got REKT", icon: "💀", key: "returnPct", max: -50, desc: "Lose more than half your money", threshold: "-50% return" },
];

export const TRADER_TITLES = [
  { minReturn: -Infinity, title: "INTERN", icon: "📋", color: "#666" },
  { minReturn: 0, title: "ANALYST", icon: "📊", color: "#aaa" },
  { minReturn: 5, title: "ASSOCIATE", icon: "💼", color: "#00E5FF" },
  { minReturn: 15, title: "VP", icon: "📈", color: "#76FF03" },
  { minReturn: 30, title: "DIRECTOR", icon: "🏦", color: "#FFD600" },
  { minReturn: 50, title: "MANAGING DIR.", icon: "👔", color: "#FF9100" },
  { minReturn: 100, title: "PARTNER", icon: "👑", color: "#FF3D71" },
];

export const NEWS_EVENTS = [
  // Tech (NXT)
  { stockIdx: 0, headline: "NextGen Tech secures $2B government AI defense contract", sentiment: "bullish", driftMod: 0.04, durationSec: 8 },
  { stockIdx: 0, headline: "Breakthrough in quantum computing announced by NXT", sentiment: "bullish", driftMod: 0.035, durationSec: 7 },
  { stockIdx: 0, headline: "Global semiconductor shortage stalls tech manufacturing", sentiment: "bearish", driftMod: -0.03, durationSec: 8 },
  { stockIdx: 0, headline: "Major cybersecurity breach exposes NXT user data", sentiment: "bearish", driftMod: -0.045, durationSec: 6 },
  { stockIdx: 0, headline: "EU proposes strict new AI regulations on data usage", sentiment: "bearish", driftMod: -0.035, durationSec: 7 },

  // Solar/Energy (ECO)
  { stockIdx: 1, headline: "Government announces massive new subsidies for renewable energy", sentiment: "bullish", driftMod: 0.05, durationSec: 8 },
  { stockIdx: 1, headline: "EcoPower Solar unveils record-breaking efficient solar panel", sentiment: "bullish", driftMod: 0.04, durationSec: 7 },
  { stockIdx: 1, headline: "Oil prices plummet, reducing immediate demand for green alternatives", sentiment: "bearish", driftMod: -0.03, durationSec: 8 },
  { stockIdx: 1, headline: "Changes in tax policy strip funding away from solar initiatives", sentiment: "bearish", driftMod: -0.04, durationSec: 7 },
  { stockIdx: 1, headline: "Major cities mandate solar panels on all new commercial buildings", sentiment: "bullish", driftMod: 0.045, durationSec: 9 },

  // Retail (CART)
  { stockIdx: 2, headline: "Supply chain delays and labor strikes causing nationwide food shortages", sentiment: "bearish", driftMod: -0.04, durationSec: 8 },
  { stockIdx: 2, headline: "FreshCart posts record holiday quarter consumer spending", sentiment: "bullish", driftMod: 0.03, durationSec: 7 },
  { stockIdx: 2, headline: "Inflation hits families — grocery spending shifts to bargain brands", sentiment: "bearish", driftMod: -0.025, durationSec: 9 },
  { stockIdx: 2, headline: "FreshCart acquires major organic farming conglomerate", sentiment: "bullish", driftMod: 0.02, durationSec: 6 },
  { stockIdx: 2, headline: "E-coli outbreak linked to national retail produce distributor", sentiment: "bearish", driftMod: -0.045, durationSec: 6 },

  // Bonds (SAFE)
  { stockIdx: 3, headline: "Federal Reserve signals aggressive rate cuts — bonds rally", sentiment: "bullish", driftMod: 0.015, durationSec: 10 },
  { stockIdx: 3, headline: "Inflation spikes unexpectedly — bond yields crater", sentiment: "bearish", driftMod: -0.015, durationSec: 10 },
  { stockIdx: 3, headline: "Stock market volatility drives investors toward safe-haven assets", sentiment: "bullish", driftMod: 0.01, durationSec: 8 },
  { stockIdx: 3, headline: "Treasury auction sees worst demand in a decade", sentiment: "bearish", driftMod: -0.01, durationSec: 8 },

  // Macro (All/Market)
  { stockIdx: -1, headline: "BREAKING: Unexpected banking crisis — global markets in panic", sentiment: "bearish", driftMod: -0.04, durationSec: 8 },
  { stockIdx: -1, headline: "Fed announces surprise emergency economic stimulus package", sentiment: "bullish", driftMod: 0.03, durationSec: 8 },
  { stockIdx: -1, headline: "Trade war escalates — massive tariffs enacted globally", sentiment: "bearish", driftMod: -0.03, durationSec: 7 },
  { stockIdx: -1, headline: "Historic peace treaty signed — global investor confidence soars", sentiment: "bullish", driftMod: 0.02, durationSec: 7 },
  { stockIdx: -1, headline: "Unemployment hits all-time low — consumer economy booming", sentiment: "bullish", driftMod: 0.015, durationSec: 9 }
];
