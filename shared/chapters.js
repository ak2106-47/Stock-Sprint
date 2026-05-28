import { STOCKS } from "./constants.js";

/**
 * Story spine: Sarge, linear paycheck-to-portfolio path (NEXT only; interactive mini-games between beats).
 */

export const CHAPTERS = [
  {
    id: 1,
    title: "First Paycheck",
    subtitle: "Stock = slice of a company",
    /** Demo path: one dialog NEXT → practice trade → one-line recap. */
    dialogTypingSpeed: 12,
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "Welcome! I'm Sarge. I know you're here to learn, so I'm going to help you understand stocks, markets, and how money works.",
        scene: { icon: "🎒", headline: "CLASS IN SESSION", detail: "Chapter 1 · student intro", accent: "#76FF03" },
      },
      {
        speaker: "sarge",
        text: "Whether you're studying in the classroom right now or practicing at home, the stock market doesn't have to be an intimidating mystery.",
      },
      {
        speaker: "sarge",
        text: "We'll start with the absolute basics. You've probably heard people talking about buying stocks before.",
      },
      {
        speaker: "sarge",
        text: "A stock is really just a tiny slice of ownership in a real company. When the company does well, your slice becomes more valuable.",
      },
      {
        speaker: "sarge",
        text: "Let's do a quick practice run. You're going to buy a slice, wait for the price to go up, and sell it to lock in your profit. Let's go!",
        scene: { icon: "🎯", headline: "YOUR FIRST TRADE", detail: "Buy, hold, and sell", accent: "#00E5FF" },
      },
    ],
    learnDialog: [],
    situationDialog: [],
    miniGame: {
      type: "first-buy",
      config: {
        stockIdx: 0,
        title: "PRACTICE TRADE",
        /** Slightly faster uptrend + calmer noise so the demo almost always hits green quickly. */
        priceDrift: 0.007,
        shockScale: 0.65,
        instructions: "BUY 1 share, wait a moment, SELL when you’re above your buy price.",
        successText: "You completed the loop—buy, hold a tick, sell. That’s what “owning a share” feels like, shortened.",
        failText: "Tap BUY, wait until the price is above your buy, then SELL—or try again; practice costs nothing.",
      },
    },
    gameplay: {
      skipGameplay: true,
      availableStocks: [0],
      durationSeconds: 60,
      objective: {
        id: "first-profit",
        text: "Buy at least 1 share and sell it for a profit",
        check: (stats) => stats.totalTrades >= 2 && stats.returnPct > 0,
      },
      hintLevel: "heavy",
      hints: [],
      scriptedEvents: [],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "Great job! You just bought and sold your first stock! See? Nothing to be afraid of. Next, let's learn how to read the market.",
      },
    ],
    badge: { id: "ch1_complete", label: "First Trade", icon: "🏁", desc: "Completed Chapter 1" },
  },
  {
    id: 2,
    title: "Reading the Room",
    subtitle: "How news moves markets",
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "You've got the basics down! You know how to buy and sell.",
        scene: { icon: "📰", headline: "READING THE ROOM", detail: "News → mood → price", accent: "#FF9100" },
      },
      {
        speaker: "sarge",
        text: "But how do we know if a stock's price is going to go up or go down? There's no crystal ball.",
      },
      {
        speaker: "sarge",
        text: "Usually, it's all about the news and how the business is doing in the real world.",
      },
      {
        speaker: "sarge",
        text: "When a company announces an amazing new product or record profits, people get excited and buy. We call this a 'Bullish' sign.",
        scene: { icon: "📈", headline: "BULL VS BEAR", detail: "Words you’ll hear nonstop", accent: "#00E5FF" },
      },
      {
        speaker: "sarge",
        text: "If the company announces bad news, people panic and sell their shares to get out. That's a 'Bearish' sign.",
      },
    ],
    learnDialog: [
      {
        speaker: "sarge",
        text: "Let's see if you can read the room. I'm going to show you a few real-world headlines.",
        scene: { icon: "🎯", headline: "YOUR TURN", detail: "Three headlines · pick a side", accent: "#FFD600" },
      },
      {
        speaker: "sarge",
        text: "Read each one carefully and tell me if you think it's Bullish (good news) or Bearish (bad news). Here we go!",
      },
    ],
    situationDialog: [],
    miniGame: {
      type: "headline-quiz",
      config: {
        headlines: [
          { text: "Government announces massive new subsidies for renewable energy", answer: "bullish", stock: "ECO", explanation: "More funding → cheaper operating costs → often 📈" },
          { text: "Supply chain delays causing nationwide food shortages", answer: "bearish", stock: "CART", explanation: "Less inventory to sell → lower revenue → often 📉" },
          { text: "NextGen Tech secures $2B government AI defense contract", answer: "bullish", stock: "NXT", explanation: "Big revenue growth → brighter outlook → often 📈" },
        ],
        successText: "Clean reads—that’s how you build headline reflexes.",
        partialText: "Good start. Remember: helps the business = bullish; hurts it = bearish. You’ll get faster with reps.",
      },
    },
    gameplay: {
      skipGameplay: true,
      availableStocks: [0, 2],
      durationSeconds: 90,
      objective: {
        id: "news-trade",
        text: "Identify whether headlines are good or bad news",
        check: () => true,
      },
      hintLevel: "moderate",
      hints: [],
      scriptedEvents: [],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "Nailed it! Understanding how the real world affects the market is your biggest edge. Next up: how to protect yourself on a bad day.",
      },
    ],
    badge: { id: "ch2_complete", label: "News Reader", icon: "📰", desc: "Completed Chapter 2" },
  },
  {
    id: 3,
    title: "Don't Bet It All",
    subtitle: "The power of diversification",
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "Imagine putting all your money into one company, and they have a terrible year. Ouch! That's what we call Concentration Risk.",
        scene: { icon: "⚠️", headline: "CONCENTRATION RISK", detail: "Why “all in one” stings", accent: "#FF3D71" },
      },
      {
        speaker: "sarge",
        text: "Smart investors spread their money around so a single drop doesn't wipe them out. This is called 'Diversification'. Don't keep all your eggs in one basket!",
        scene: { icon: "🧺", headline: "DIVERSIFY", detail: "Many eggs, many baskets", accent: "#76FF03" },
      },
      {
        speaker: "sarge",
        text: "Let's test this in the lab. You're going to split $100 across four stocks, and we'll throw a market crash at it to see what happens.",
        scene: { icon: "🧪", headline: "NEXT UP", detail: "Allocation lab", accent: "#00E5FF" },
      },
    ],
    learnDialog: [
      {
        speaker: "sarge",
        text: "Try leaning hard into a single investment first and running the crash. Then spread it out smoothly and run it again to see the cushion!",
        scene: { icon: "🧪", headline: "YOUR TURN", detail: "Allocation · then simulate", accent: "#00E5FF" },
      },
    ],
    situationDialog: [],
    miniGame: {
      type: "portfolio-builder",
      config: {
        budget: 100,
        stocks: STOCKS.map((s) => ({
          symbol: s.symbol,
          name: s.name,
          color: s.color,
          risk: s.volatility > 0.04 ? "High Risk" : s.volatility > 0.02 ? "Medium" : "Low Risk",
        })),
        crashStockIdx: 1,
        crashPct: -55,
        instructions: "Split $100 across the stocks, then simulate a crash and compare the outcome.",
        diversifiedMessage: "Because you spread the money, one stock’s crash didn’t erase the whole hundred.",
        concentratedMessage: "When everything sat in one name, that single drop took most of the portfolio with it.",
      },
    },
    gameplay: {
      availableStocks: [0, 1, 2, 3],
      durationSeconds: 45,
      newsEngineOptions: { bullishPickProbability: 0.78 },
      objective: {
        id: "diversified",
        text: "End the round holding shares in at least 3 different stocks",
        check: (stats) => stats.uniqueStocks >= 3,
      },
      hintLevel: "moderate",
      hints: [
        { trigger: "single-stock-15s", text: "Try opening a second and third position—one line shouldn’t carry the whole round.", position: "stock-card" },
        { trigger: "crash-event", text: "Rough patch—if you’re spread out, you’ll usually feel less of a single-stock punch.", position: "center" },
      ],
      scriptedEvents: [
        {
          atSecond: 20,
          stockIdx: -1,
          headline: "MARKET BRIEF: Profit-taking after a strong run — volatility ticks up",
          sentiment: "bearish",
          driftMod: -0.028,
          durationSec: 8,
        },
      ],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "See how diversifying protected your portfolio? That's how you stay in the game for the long haul.",
      },
      {
        speaker: "sarge",
        text: "You're getting really good at this. Next, I'm going to show you the secret to building real wealth. Trust me, you'll want to see this.",
      },
    ],
    badge: { id: "ch3_complete", label: "Diversified", icon: "🎯", desc: "Completed Chapter 3" },
  },
  {
    id: 4,
    title: "Snowball Effect",
    subtitle: "How compounding works",
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "Time for my favorite topic! What if I told you your money could make its own money? That's what we call Compound Growth.",
        scene: { icon: "📈", headline: "CHAPTER 4", detail: "Time × return", accent: "#76FF03" },
      },
      {
        speaker: "sarge",
        text: "Your money earns interest, and then that interest earns interest. Small numbers turn into massive mountains if you give them enough years to snowball.",
      },
    ],
    learnDialog: [
      {
        speaker: "sarge",
        text: "Jump into the lab and play with the numbers. Watch what happens if you just leave the money alone for 10 or 20 years. Give it a shot!",
        scene: { icon: "🧮", headline: "YOUR TURN", detail: "Compound toy", accent: "#00E5FF" },
      },
    ],
    situationDialog: [],
    miniGame: {
      type: "compound-growth",
      config: {
        title: "COMPOUND GROWTH LAB",
        initialPrincipal: 1500,
        initialYears: 25,
        initialApr: 7,
      },
    },
    gameplay: {
      skipGameplay: true,
      availableStocks: [0],
      durationSeconds: 60,
      objective: { id: "compound", text: "Explore the compound growth mini-game", check: () => true },
      hintLevel: "heavy",
      hints: [],
      scriptedEvents: [],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "Mind-blowing, right? The secret ingredient isn't a hot stock tip—it's simply giving it enough time. Start early, and your money does the hard work for you.",
      },
    ],
    badge: { id: "ch4_complete", label: "Compounder", icon: "📊", desc: "Completed Chapter 4" },
  },
  {
    id: 5,
    title: "Split the Check",
    subtitle: "Pay yourself first",
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "Before you can invest, you need cash. Let's talk about splitting up your paycheck so you're never scrambling.",
        scene: { icon: "💸", headline: "CHAPTER 5", detail: "Budget buckets · % only", accent: "#FFD600" },
      },
      {
        speaker: "sarge",
        text: "You should always cover your needs, and you deserve to put some away for fun. But the most important part is paying your 'future self' by investing.",
      },
    ],
    learnDialog: [
      {
        speaker: "sarge",
        text: "Let's try balancing a budget. Slide the bars to divide up your paycheck. Try to cover your needs while keeping those long-term investments fueled!",
        scene: { icon: "🪣", headline: "YOUR TURN", detail: "Must sum to 100%", accent: "#00E5FF" },
      },
    ],
    situationDialog: [],
    miniGame: {
      type: "budget-buckets",
      config: {
        title: "PAYCHECK SPLITS",
        budget: 100,
        buckets: [
          { id: "needs", label: "Needs (rent, food, bills)", emoji: "🏠", color: "#00E5FF" },
          { id: "grow", label: "Save & invest (future you)", emoji: "📈", color: "#76FF03" },
          { id: "flex", label: "Fun & flexible", emoji: "🎮", color: "#FFD600" },
        ],
        footnote: "Irregular life happens—this is practice for the habit, not a stricter budget app.",
      },
    },
    gameplay: {
      skipGameplay: true,
      availableStocks: [0],
      durationSeconds: 60,
      objective: { id: "budget", text: "Balance buckets to 100%", check: () => true },
      hintLevel: "heavy",
      hints: [],
      scriptedEvents: [],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "Perfect! By automating those buckets every month, you are building real wealth without having to stress about every dollar.",
      },
    ],
    badge: { id: "ch5_complete", label: "Balanced", icon: "⚖️", desc: "Completed Chapter 5" },
  },
  {
    id: 6,
    title: "Speak Like a Market",
    subtitle: "Core vocabulary",
    storyBackdrop: "/story/ch1-office-bg.jpg",
    storyDialog: [
      {
        speaker: "sarge",
        text: "You've come so far! By now, you're really starting to think like an investor.",
        scene: { icon: "📖", headline: "CHAPTER 6", detail: "Tap term → meaning", accent: "#FF9100" },
      },
      {
        speaker: "sarge",
        text: "Let's do a quick victory lap. I'll test you on some of the slang we've covered, plus a couple new terms. Ready?",
      },
    ],
    learnDialog: [
      {
        speaker: "sarge",
        text: "Match the term on the left to its definition on the right. You've got this!",
        scene: { icon: "🔗", headline: "YOUR TURN", detail: "Four pairs", accent: "#FFD600" },
      },
    ],
    situationDialog: [],
    miniGame: {
      type: "term-match",
      config: {
        title: "TERM MATCH",
        instructions: "Select a term, then its definition. Wrong pairs reset—keep going.",
        pairs: [
          { id: "bull", term: "Bull market", definition: "Broad uptrend—prices generally rising and mood optimistic." },
          { id: "bear", term: "Bear market", definition: "Broad downtrend—prices falling and caution rules." },
          { id: "div", term: "Dividend", definition: "Cash a company pays shareholders, usually per share, on a schedule." },
          { id: "etf", term: "ETF", definition: "Basket of assets you buy like one stock—often tracks an index." },
        ],
      },
    },
    gameplay: {
      skipGameplay: true,
      availableStocks: [0],
      durationSeconds: 60,
      objective: { id: "terms", text: "Match all vocabulary pairs", check: () => true },
      hintLevel: "heavy",
      hints: [],
      scriptedEvents: [],
    },
    reflectDialog: [
      {
        speaker: "sarge",
        text: "You did it! You've learned how to trade, read the news, diversify, compound, and budget. You've got the foundation. Now get out there and make it happen!",
      },
    ],
    badge: { id: "ch6_complete", label: "Fluent", icon: "💬", desc: "Completed Chapter 6" },
  },
];
