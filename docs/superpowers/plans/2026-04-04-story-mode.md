# Story Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a narrative-driven Story Mode to the solo experience with 3 chapters teaching stocks, news, and diversification through Dollar Guy's guided storyline, mini-games, and objective-based trading rounds.

**Architecture:** Data-driven chapter system. A single `StoryPage` screen acts as a state machine cycling through chapter phases. Chapter configs define all content (dialog, mini-games, gameplay constraints, objectives, hints). Existing sim components (StockCard, TradeControls, NewsEngine, etc.) are reused in the Play phase. Multiplayer code is not touched.

**Tech Stack:** React 19, Vite 6, Tailwind 4, existing NewsEngine, localStorage for progress.

**Scope boundary:** DO NOT modify `server/`, `src/screens/HostPage.jsx`, `src/screens/PlayerPage.jsx`, `src/hooks/useSocket.js`, or any multiplayer logic.

---

### Task 1: Chapter Data Configuration

**Files:**
- Create: `shared/chapters.js`

This is the single source of truth for all story content. Every other component reads from this.

- [ ] **Step 1: Create `shared/chapters.js` with chapter configs**

```js
// shared/chapters.js
import { STOCKS } from "./constants.js";

export const CHAPTERS = [
  {
    id: 1,
    title: "First Paycheck",
    subtitle: "What is a stock?",
    storyDialog: [
      { speaker: "dollar-guy", text: "Hey! Congrats on the first paycheck! Most people just let their money sit there doing nothing." },
      { speaker: "dollar-guy", text: "But you're smarter than that. Let me show you how to make your money work for you." },
      { speaker: "dollar-guy", text: "See that company? When you buy a stock, you own a tiny piece of it. If the company does well, your piece becomes worth more." },
    ],
    learnDialog: [
      { speaker: "dollar-guy", text: "Let's try it. I'll walk you through buying your very first stock." },
      { speaker: "dollar-guy", text: "Tap the BUY button to grab a share. Then watch the price move. When you're ready, sell it!" },
    ],
    miniGame: {
      type: "first-buy",
      config: {
        stockIdx: 0,
        instructions: "Tap BUY to purchase your first share, then sell it for a profit!",
        successText: "Nice! You just made your first trade!",
        failText: "No worries — try again! Buy a share, then sell when the price goes up.",
      },
    },
    gameplay: {
      availableStocks: [0],
      durationSeconds: 60,
      objective: {
        id: "first-profit",
        text: "Buy at least 1 share and sell it for a profit",
        check: (stats) => stats.totalTrades >= 2 && stats.returnPct > 0,
      },
      hintLevel: "heavy",
      hints: [
        { trigger: "price-up-5", text: "Price is going up! Might be a good time to sell.", position: "trade-controls" },
        { trigger: "no-trades-10s", text: "Don't be shy — tap a stock and hit BUY!", position: "stock-card" },
        { trigger: "holding-profit", text: "You're in the green! Try selling to lock in your profit.", position: "trade-controls" },
      ],
      scriptedEvents: [],
    },
    reflectDialog: [
      { speaker: "dollar-guy", text: "You just made your first trade! A stock is a piece of a company." },
      { speaker: "dollar-guy", text: "When the company does well, your stock goes up. That's how people grow their money." },
      { speaker: "dollar-guy", text: "But here's the thing — prices don't just move randomly. Let me show you what drives them..." },
    ],
    badge: { id: "ch1_complete", label: "First Trade", icon: "🏁", desc: "Completed Chapter 1" },
  },
  {
    id: 2,
    title: "Reading the Room",
    subtitle: "How news moves markets",
    storyDialog: [
      { speaker: "dollar-guy", text: "So your coworker just made a bunch of money. Know how? They read the news before everyone else." },
      { speaker: "dollar-guy", text: "Here's the secret: markets react to information. Good news pushes prices UP. Bad news drags them DOWN." },
      { speaker: "dollar-guy", text: "If you can read the headlines and act fast, you've got an edge over everyone else." },
    ],
    learnDialog: [
      { speaker: "dollar-guy", text: "Let me test you. I'll show you some headlines — tell me if they're good or bad for the stock." },
    ],
    miniGame: {
      type: "headline-quiz",
      config: {
        headlines: [
          { text: "Banana Inc. smashes earnings — revenue up 40%", answer: "bullish", stock: "BNNA", explanation: "Great earnings = company is doing well = stock goes UP" },
          { text: "SEC investigation into RektCoin for securities fraud", answer: "bearish", stock: "REKT", explanation: "Legal trouble = bad news = stock goes DOWN" },
          { text: "MoonShot AI lands $2B government defense contract", answer: "bullish", stock: "MOON", explanation: "Huge new deal = more money coming in = stock goes UP" },
        ],
        successText: "You're a natural! Now let's put that skill to work.",
        partialText: "Not bad! Remember: good news = 📈, bad news = 📉. Let's practice for real.",
      },
    },
    gameplay: {
      availableStocks: [0, 2],
      durationSeconds: 90,
      objective: {
        id: "news-trade",
        text: "Make a profitable trade after a news headline drops",
        check: (stats) => stats.newsBasedTrades >= 1 && stats.returnPct > -5,
      },
      hintLevel: "moderate",
      hints: [
        { trigger: "news-fired", text: "Breaking news! Read the headline — is it bullish or bearish?", position: "news-ticker" },
        { trigger: "news-bullish-no-action", text: "That was good news for {stock}. Could be a buying opportunity!", position: "stock-card" },
        { trigger: "news-bearish-holding", text: "Bad news just hit. If you're holding {stock}, think about selling.", position: "trade-controls" },
      ],
      scriptedEvents: [
        { atSecond: 15, stockIdx: 0, headline: "Banana Inc. announces record-breaking quarter", sentiment: "bullish", driftMod: 0.035, durationSec: 10 },
        { atSecond: 45, stockIdx: 2, headline: "EU proposes strict AI regulation — MOON under pressure", sentiment: "bearish", driftMod: -0.03, durationSec: 10 },
      ],
    },
    reflectDialog: [
      { speaker: "dollar-guy", text: "See? Information is power. The news feed isn't just noise — it's your cheat code." },
      { speaker: "dollar-guy", text: "Smart traders read the headlines and act before the crowd catches on." },
      { speaker: "dollar-guy", text: "But there's one more thing you need to learn before you're ready for the real deal..." },
    ],
    badge: { id: "ch2_complete", label: "News Reader", icon: "📰", desc: "Completed Chapter 2" },
  },
  {
    id: 3,
    title: "Don't Bet It All",
    subtitle: "The power of diversification",
    storyDialog: [
      { speaker: "dollar-guy", text: "Let me tell you about my buddy Steve. Steve put ALL his money into one stock." },
      { speaker: "dollar-guy", text: "The stock crashed 60% in one day. Steve lost almost everything." },
      { speaker: "dollar-guy", text: "Don't be like Steve. The smart move? Spread your money across different stocks." },
      { speaker: "dollar-guy", text: "That way, if one crashes, the others can save you. It's called DIVERSIFICATION." },
    ],
    learnDialog: [
      { speaker: "dollar-guy", text: "Let me show you what I mean. Try splitting your money across these stocks and see what happens when a crash hits." },
    ],
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
        instructions: "Drag the sliders to split $100 across stocks. Then watch what happens in a crash!",
        diversifiedMessage: "Smart! Because you spread your money around, the crash only hurt a little.",
        concentratedMessage: "Ouch! All your eggs were in one basket. Diversification would have saved you.",
      },
    },
    gameplay: {
      availableStocks: [0, 1, 2, 3],
      durationSeconds: 120,
      objective: {
        id: "diversified",
        text: "End the round holding shares in at least 3 different stocks",
        check: (stats) => stats.uniqueStocks >= 3,
      },
      hintLevel: "light",
      hints: [
        { trigger: "single-stock-30s", text: "You're only in one stock. Remember what happened to Steve!", position: "stock-card" },
        { trigger: "crash-event", text: "Market crash! If you diversified, you'll be fine.", position: "center" },
      ],
      scriptedEvents: [
        { atSecond: 60, stockIdx: -1, headline: "BREAKING: Major bank collapses — markets in panic", sentiment: "bearish", driftMod: -0.05, durationSec: 12 },
      ],
    },
    reflectDialog: [
      { speaker: "dollar-guy", text: "Diversification isn't the most exciting strategy, but it keeps you alive." },
      { speaker: "dollar-guy", text: "You've learned the basics: what stocks are, how news moves them, and why you don't put all your eggs in one basket." },
      { speaker: "dollar-guy", text: "I think you're ready. Time to go up against real traders. Good luck out there!" },
    ],
    badge: { id: "ch3_complete", label: "Diversified", icon: "🎯", desc: "Completed Chapter 3" },
  },
];
```

- [ ] **Step 2: Verify import works**

Run: `node -e "import('./shared/chapters.js').then(m => console.log(m.CHAPTERS.length + ' chapters loaded'))"`

Expected: `3 chapters loaded`

- [ ] **Step 3: Commit**

```bash
git add shared/chapters.js
git commit -m "feat: add chapter configs for story mode"
```

---

### Task 2: DialogBubble Component

**Files:**
- Create: `src/components/DialogBubble.jsx`

Speech bubble with typewriter effect. Used in story beats, learn phases, hints, and reflections.

- [ ] **Step 1: Create `src/components/DialogBubble.jsx`**

```jsx
import { useState, useEffect, useRef } from "react";

export default function DialogBubble({ text, speaker, onComplete, autoAdvance = false, typingSpeed = 30 }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    indexRef.current = 0;

    intervalRef.current = setInterval(() => {
      indexRef.current++;
      if (indexRef.current >= text.length) {
        clearInterval(intervalRef.current);
        setDisplayedText(text);
        setIsTyping(false);
        if (autoAdvance) {
          setTimeout(() => onComplete?.(), 1200);
        }
        return;
      }
      setDisplayedText(text.slice(0, indexRef.current + 1));
    }, typingSpeed);

    return () => clearInterval(intervalRef.current);
  }, [text, typingSpeed, autoAdvance, onComplete]);

  const handleClick = () => {
    if (isTyping) {
      clearInterval(intervalRef.current);
      setDisplayedText(text);
      setIsTyping(false);
    } else {
      onComplete?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left rounded-2xl p-5 cursor-pointer border-2 transition-all relative"
      style={{
        background: "rgba(255,255,255,0.06)",
        borderColor: "rgba(255,214,0,0.3)",
        fontFamily: "var(--font-mono)",
        fontSize: "clamp(13px, 2.5vw, 15px)",
        lineHeight: 1.7,
        color: "#e0e0e0",
      }}
    >
      {speaker === "dollar-guy" && (
        <div
          className="text-xs font-bold mb-2 tracking-wider"
          style={{ fontFamily: "var(--font-pixel)", color: "#FFD600", fontSize: "10px" }}
        >
          DOLLAR GUY
        </div>
      )}
      <div style={{ minHeight: "1.7em" }}>
        {displayedText}
        {isTyping && (
          <span className="inline-block w-2 h-4 ml-1 animate-pulse" style={{ background: "#FFD600", verticalAlign: "text-bottom" }} />
        )}
      </div>
      {!isTyping && (
        <div className="text-xs mt-3 text-right" style={{ color: "#555", fontFamily: "var(--font-pixel)", fontSize: "8px" }}>
          TAP TO CONTINUE ▶
        </div>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DialogBubble.jsx
git commit -m "feat: add DialogBubble component with typewriter effect"
```

---

### Task 3: DollarGuy Character Component

**Files:**
- Create: `src/components/DollarGuy.jsx`

Renders Dollar Guy sprite + manages dialog sequences. The user has their own pixel art asset — this component provides a placeholder that can be swapped.

- [ ] **Step 1: Create `src/components/DollarGuy.jsx`**

```jsx
import { useState, useCallback } from "react";
import DialogBubble from "./DialogBubble.jsx";

export default function DollarGuy({ dialog, onDialogComplete, size = "large" }) {
  const [currentLine, setCurrentLine] = useState(0);

  const handleAdvance = useCallback(() => {
    if (currentLine >= dialog.length - 1) {
      onDialogComplete?.();
    } else {
      setCurrentLine((prev) => prev + 1);
    }
  }, [currentLine, dialog.length, onDialogComplete]);

  const line = dialog[currentLine];
  if (!line) return null;

  const spriteSize = size === "large" ? "w-24 h-24" : "w-14 h-14";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg mx-auto animate-slide-up">
      {/* Dollar Guy sprite placeholder — swap with actual pixel art asset */}
      <div className={`${spriteSize} rounded-full flex items-center justify-center shrink-0`}
        style={{
          background: "linear-gradient(135deg, #FFD600 0%, #FF9100 100%)",
          boxShadow: "0 0 30px rgba(255,214,0,0.3)",
          fontSize: size === "large" ? "48px" : "28px",
        }}
      >
        💰
      </div>

      <div className="w-full">
        <DialogBubble
          key={currentLine}
          text={line.text}
          speaker={line.speaker}
          onComplete={handleAdvance}
        />
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {dialog.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all"
            style={{
              background: i <= currentLine ? "#FFD600" : "rgba(255,255,255,0.15)",
              transform: i === currentLine ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/DollarGuy.jsx
git commit -m "feat: add DollarGuy character component with dialog system"
```

---

### Task 4: Mini-Game — First Buy (Chapter 1)

**Files:**
- Create: `src/components/minigames/FirstBuyGame.jsx`

Guided single-stock buy/sell with animated feedback.

- [ ] **Step 1: Create directory and component**

```bash
mkdir -p src/components/minigames
```

```jsx
// src/components/minigames/FirstBuyGame.jsx
import { useState, useEffect, useRef } from "react";
import { STOCKS, TICK_MS } from "../../../shared/constants.js";

export default function FirstBuyGame({ config, onComplete }) {
  const stock = STOCKS[config.stockIdx];
  const [price, setPrice] = useState(stock.basePrice);
  const [phase, setPhase] = useState("ready"); // ready | bought | sold | done
  const [buyPrice, setBuyPrice] = useState(null);
  const [profit, setProfit] = useState(null);
  const tickRef = useRef(null);

  useEffect(() => {
    tickRef.current = setInterval(() => {
      setPrice((prev) => {
        const shock = (Math.random() - 0.5) * 2 * 0.015;
        const drift = 0.002;
        return Math.max(0.01, parseFloat((prev * (1 + shock + drift)).toFixed(2)));
      });
    }, TICK_MS);
    return () => clearInterval(tickRef.current);
  }, []);

  const handleBuy = () => {
    setBuyPrice(price);
    setPhase("bought");
  };

  const handleSell = () => {
    const pnl = price - buyPrice;
    setProfit(pnl);
    setPhase("sold");
    clearInterval(tickRef.current);
    setTimeout(() => {
      setPhase("done");
      onComplete?.(pnl > 0);
    }, 2000);
  };

  const pnlColor = profit !== null ? (profit >= 0 ? "#76FF03" : "#FF3D71") : "#fff";

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto animate-slide-up">
      <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        MINI-GAME: YOUR FIRST TRADE
      </div>

      <div className="text-sm text-center" style={{ color: "#aaa" }}>
        {config.instructions}
      </div>

      {/* Stock display */}
      <div className="rounded-xl p-5 w-full text-center" style={{ background: "rgba(255,255,255,0.06)", border: `2px solid ${stock.color}44` }}>
        <div className="text-lg font-bold" style={{ color: stock.color }}>{stock.symbol}</div>
        <div className="text-sm" style={{ color: "#888" }}>{stock.name}</div>
        <div className="text-3xl font-bold my-3 transition-all" style={{ fontFamily: "var(--font-mono)" }}>
          ${price.toFixed(2)}
        </div>
        {phase === "bought" && buyPrice && (
          <div className="text-sm" style={{ color: price >= buyPrice ? "#76FF03" : "#FF3D71" }}>
            {price >= buyPrice ? "▲" : "▼"} {((price - buyPrice) / buyPrice * 100).toFixed(1)}% since you bought
          </div>
        )}
      </div>

      {/* Action buttons */}
      {phase === "ready" && (
        <button
          onClick={handleBuy}
          className="rounded-xl py-4 px-12 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105 animate-pulse-border border-2"
          style={{ fontFamily: "var(--font-pixel)", background: "#76FF03", color: "#0a0e1a", borderColor: "#76FF03" }}
        >
          BUY 1 SHARE
        </button>
      )}

      {phase === "bought" && (
        <button
          onClick={handleSell}
          className="rounded-xl py-4 px-12 font-bold text-lg cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
          style={{ fontFamily: "var(--font-pixel)", background: "#FF3D71", color: "#fff" }}
        >
          SELL
        </button>
      )}

      {phase === "sold" && profit !== null && (
        <div className="text-center animate-slide-up">
          <div className="text-2xl font-bold mb-2" style={{ color: pnlColor }}>
            {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
          </div>
          <div className="text-sm" style={{ color: "#aaa" }}>
            {profit >= 0 ? config.successText : config.failText}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/minigames/FirstBuyGame.jsx
git commit -m "feat: add FirstBuyGame mini-game for Chapter 1"
```

---

### Task 5: Mini-Game — Headline Quiz (Chapter 2)

**Files:**
- Create: `src/components/minigames/HeadlineQuizGame.jsx`

Player swipes/taps bullish or bearish on headlines.

- [ ] **Step 1: Create `src/components/minigames/HeadlineQuizGame.jsx`**

```jsx
import { useState } from "react";

export default function HeadlineQuizGame({ config, onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [phase, setPhase] = useState("playing"); // playing | result

  const headline = config.headlines[currentIdx];

  const handleAnswer = (answer) => {
    const correct = answer === headline.answer;
    const newScore = correct ? score + 1 : score;
    const newAnswers = [...answers, { ...headline, playerAnswer: answer, correct }];

    setScore(newScore);
    setAnswers(newAnswers);
    setFeedback({ correct, explanation: headline.explanation });

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx >= config.headlines.length - 1) {
        setPhase("result");
        setTimeout(() => {
          onComplete?.(newScore === config.headlines.length);
        }, 2500);
      } else {
        setCurrentIdx((prev) => prev + 1);
      }
    }, 2000);
  };

  if (phase === "result") {
    const allCorrect = score === config.headlines.length;
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-slide-up">
        <div className="text-4xl mb-2">{allCorrect ? "🎯" : "📊"}</div>
        <div className="text-xl font-bold" style={{ fontFamily: "var(--font-pixel)", color: allCorrect ? "#76FF03" : "#FFD600" }}>
          {score}/{config.headlines.length} CORRECT
        </div>
        <div className="text-sm text-center" style={{ color: "#aaa" }}>
          {allCorrect ? config.successText : config.partialText}
        </div>
        {/* Answer review */}
        <div className="w-full flex flex-col gap-2 mt-2">
          {answers.map((a, i) => (
            <div key={i} className="rounded-lg p-3 text-xs" style={{ background: a.correct ? "rgba(118,255,3,0.1)" : "rgba(255,61,113,0.1)", border: `1px solid ${a.correct ? "#76FF0333" : "#FF3D7133"}` }}>
              <div style={{ color: "#ddd" }}>{a.text}</div>
              <div className="mt-1" style={{ color: a.correct ? "#76FF03" : "#FF3D71" }}>
                {a.correct ? "✓" : "✗"} {a.answer === "bullish" ? "📈 Bullish" : "📉 Bearish"}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        MINI-GAME: READ THE HEADLINES
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {config.headlines.map((_, i) => (
          <div key={i} className="w-8 h-1 rounded-full" style={{ background: i < currentIdx ? "#76FF03" : i === currentIdx ? "#FFD600" : "rgba(255,255,255,0.15)" }} />
        ))}
      </div>

      {/* Headline card */}
      {!feedback && (
        <div className="rounded-xl p-5 w-full text-center animate-slide-up" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-xs mb-3" style={{ color: "#888" }}>
            About: <span className="font-bold" style={{ color: "#FFD600" }}>{headline.stock}</span>
          </div>
          <div className="text-sm leading-relaxed font-semibold" style={{ color: "#e0e0e0" }}>
            "{headline.text}"
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="rounded-xl p-5 w-full text-center animate-slide-up" style={{ background: feedback.correct ? "rgba(118,255,3,0.08)" : "rgba(255,61,113,0.08)", border: `2px solid ${feedback.correct ? "#76FF03" : "#FF3D71"}44` }}>
          <div className="text-2xl mb-2">{feedback.correct ? "✅" : "❌"}</div>
          <div className="text-sm font-bold mb-1" style={{ color: feedback.correct ? "#76FF03" : "#FF3D71" }}>
            {feedback.correct ? "Correct!" : "Not quite!"}
          </div>
          <div className="text-xs" style={{ color: "#aaa" }}>{feedback.explanation}</div>
        </div>
      )}

      {/* Answer buttons */}
      {!feedback && (
        <div className="flex gap-3 w-full">
          <button
            onClick={() => handleAnswer("bullish")}
            className="flex-1 rounded-xl py-4 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
            style={{ fontFamily: "var(--font-pixel)", background: "#76FF03", color: "#0a0e1a" }}
          >
            📈 BULLISH
          </button>
          <button
            onClick={() => handleAnswer("bearish")}
            className="flex-1 rounded-xl py-4 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
            style={{ fontFamily: "var(--font-pixel)", background: "#FF3D71", color: "#fff" }}
          >
            📉 BEARISH
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/minigames/HeadlineQuizGame.jsx
git commit -m "feat: add HeadlineQuizGame mini-game for Chapter 2"
```

---

### Task 6: Mini-Game — Portfolio Builder (Chapter 3)

**Files:**
- Create: `src/components/minigames/PortfolioBuilderGame.jsx`

Slider allocation + crash simulation.

- [ ] **Step 1: Create `src/components/minigames/PortfolioBuilderGame.jsx`**

```jsx
import { useState } from "react";

export default function PortfolioBuilderGame({ config, onComplete }) {
  const [allocations, setAllocations] = useState(config.stocks.map(() => Math.floor(config.budget / config.stocks.length)));
  const [phase, setPhase] = useState("allocate"); // allocate | crash | result
  const [crashResult, setCrashResult] = useState(null);

  const total = allocations.reduce((sum, a) => sum + a, 0);
  const remaining = config.budget - total;

  const handleSlider = (idx, value) => {
    const newAlloc = [...allocations];
    const oldVal = newAlloc[idx];
    const diff = value - oldVal;
    if (remaining - diff < 0 && diff > 0) return;
    newAlloc[idx] = value;
    setAllocations(newAlloc);
  };

  const handleSimulate = () => {
    setPhase("crash");
    const crashIdx = config.crashStockIdx;
    const results = allocations.map((amount, i) => {
      if (i === crashIdx) {
        return { before: amount, after: Math.max(0, Math.round(amount * (1 + config.crashPct / 100))), change: config.crashPct };
      }
      const change = Math.round((Math.random() * 10) - 2);
      return { before: amount, after: Math.round(amount * (1 + change / 100)), change };
    });
    const totalBefore = results.reduce((s, r) => s + r.before, 0);
    const totalAfter = results.reduce((s, r) => s + r.after, 0);
    const diversified = allocations.filter((a) => a > 0).length >= 3;

    setCrashResult({ results, totalBefore, totalAfter, diversified });

    setTimeout(() => {
      setPhase("result");
      setTimeout(() => onComplete?.(diversified), 3000);
    }, 2000);
  };

  if (phase === "crash" || phase === "result") {
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto animate-slide-up">
        <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FF3D71" }}>
          💥 MARKET CRASH!
        </div>

        <div className="w-full flex flex-col gap-2">
          {config.stocks.map((stock, i) => (
            <div key={stock.symbol} className="flex items-center gap-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <span className="font-bold text-sm w-12" style={{ color: stock.color }}>{stock.symbol}</span>
              <span className="text-sm" style={{ color: "#888" }}>${crashResult.results[i].before}</span>
              <span style={{ color: "#555" }}>→</span>
              <span className="text-sm font-bold" style={{ color: crashResult.results[i].change >= 0 ? "#76FF03" : "#FF3D71" }}>
                ${crashResult.results[i].after}
              </span>
              <span className="text-xs ml-auto" style={{ color: crashResult.results[i].change >= 0 ? "#76FF03" : "#FF3D71" }}>
                {crashResult.results[i].change >= 0 ? "+" : ""}{crashResult.results[i].change}%
              </span>
            </div>
          ))}
        </div>

        {phase === "result" && (
          <div className="text-center animate-slide-up">
            <div className="text-lg font-bold mb-2" style={{ color: crashResult.diversified ? "#76FF03" : "#FF3D71" }}>
              ${crashResult.totalBefore} → ${crashResult.totalAfter}
            </div>
            <div className="text-sm" style={{ color: "#aaa" }}>
              {crashResult.diversified ? config.diversifiedMessage : config.concentratedMessage}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
        MINI-GAME: BUILD YOUR PORTFOLIO
      </div>
      <div className="text-sm text-center" style={{ color: "#aaa" }}>{config.instructions}</div>

      <div className="text-sm font-bold" style={{ color: remaining === 0 ? "#76FF03" : "#FFD600" }}>
        ${remaining} remaining
      </div>

      <div className="w-full flex flex-col gap-4">
        {config.stocks.map((stock, i) => (
          <div key={stock.symbol}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm" style={{ color: stock.color }}>{stock.symbol}</span>
              <span className="text-xs" style={{ color: "#888" }}>{stock.risk}</span>
              <span className="text-sm font-bold" style={{ color: "#fff" }}>${allocations[i]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={config.budget}
              value={allocations[i]}
              onChange={(e) => handleSlider(i, parseInt(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{ accentColor: stock.color, background: "rgba(255,255,255,0.1)" }}
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSimulate}
        disabled={total === 0}
        className="rounded-xl py-4 px-12 font-bold text-base cursor-pointer border-none tracking-wider transition-transform hover:scale-105"
        style={{
          fontFamily: "var(--font-pixel)",
          background: total > 0 ? "#FFD600" : "#333",
          color: "#0a0e1a",
          opacity: total > 0 ? 1 : 0.5,
        }}
      >
        SIMULATE CRASH 💥
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/minigames/PortfolioBuilderGame.jsx
git commit -m "feat: add PortfolioBuilderGame mini-game for Chapter 3"
```

---

### Task 7: InteractiveLesson Component (Mini-Game Router)

**Files:**
- Create: `src/components/InteractiveLesson.jsx`

Routes to the correct mini-game based on chapter config.

- [ ] **Step 1: Create `src/components/InteractiveLesson.jsx`**

```jsx
import FirstBuyGame from "./minigames/FirstBuyGame.jsx";
import HeadlineQuizGame from "./minigames/HeadlineQuizGame.jsx";
import PortfolioBuilderGame from "./minigames/PortfolioBuilderGame.jsx";

const MINI_GAMES = {
  "first-buy": FirstBuyGame,
  "headline-quiz": HeadlineQuizGame,
  "portfolio-builder": PortfolioBuilderGame,
};

export default function InteractiveLesson({ miniGame, onComplete }) {
  const GameComponent = MINI_GAMES[miniGame.type];
  if (!GameComponent) return null;
  return <GameComponent config={miniGame.config} onComplete={onComplete} />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/InteractiveLesson.jsx
git commit -m "feat: add InteractiveLesson mini-game router"
```

---

### Task 8: ObjectiveTracker Component

**Files:**
- Create: `src/components/ObjectiveTracker.jsx`

Shows current objective during gameplay with live completion status.

- [ ] **Step 1: Create `src/components/ObjectiveTracker.jsx`**

```jsx
export default function ObjectiveTracker({ text, completed }) {
  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: completed ? "rgba(118,255,3,0.1)" : "rgba(255,214,0,0.08)",
        border: `1px solid ${completed ? "#76FF0344" : "#FFD60044"}`,
      }}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-sm transition-all"
        style={{
          background: completed ? "#76FF03" : "transparent",
          border: completed ? "none" : "2px solid #FFD60066",
          color: "#0a0e1a",
        }}
      >
        {completed ? "✓" : ""}
      </div>
      <div>
        <div className="text-[10px] tracking-wider mb-0.5" style={{ fontFamily: "var(--font-pixel)", color: completed ? "#76FF03" : "#FFD600" }}>
          {completed ? "OBJECTIVE COMPLETE" : "OBJECTIVE"}
        </div>
        <div className="text-xs" style={{ color: completed ? "#76FF03" : "#ccc" }}>{text}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ObjectiveTracker.jsx
git commit -m "feat: add ObjectiveTracker component"
```

---

### Task 9: HintOverlay Component

**Files:**
- Create: `src/components/HintOverlay.jsx`

Dollar Guy's in-game hints during play phase.

- [ ] **Step 1: Create `src/components/HintOverlay.jsx`**

```jsx
import { useState, useEffect } from "react";

export default function HintOverlay({ text, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!text) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [text, onDismiss]);

  if (!text || !visible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 flex justify-center pointer-events-none animate-slide-up">
      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        className="pointer-events-auto rounded-2xl px-5 py-3 flex items-center gap-3 cursor-pointer border-none max-w-md"
        style={{
          background: "rgba(10,14,26,0.95)",
          border: "2px solid rgba(255,214,0,0.4)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.5), 0 0 20px rgba(255,214,0,0.1)",
        }}
      >
        <span className="text-xl shrink-0">💰</span>
        <span className="text-xs leading-relaxed" style={{ color: "#e0e0e0", fontFamily: "var(--font-mono)" }}>
          {text}
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/HintOverlay.jsx
git commit -m "feat: add HintOverlay component for in-game hints"
```

---

### Task 10: ChapterSelect Component

**Files:**
- Create: `src/components/ChapterSelect.jsx`

Chapter selection screen with progress (locked/current/completed).

- [ ] **Step 1: Create `src/components/ChapterSelect.jsx`**

```jsx
import { CHAPTERS } from "../../shared/chapters.js";

export default function ChapterSelect({ progress, onSelect, onBack }) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-xl mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600", textShadow: "0 0 30px rgba(255,214,0,0.25)" }}>
        STORY MODE
      </div>
      <div className="text-sm mb-8" style={{ color: "#888" }}>
        Dollar Guy's Guide to Finance
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        {CHAPTERS.map((ch) => {
          const completed = progress.completed.includes(ch.id);
          const current = ch.id === progress.currentChapter;
          const locked = ch.id > progress.currentChapter && !completed;

          return (
            <button
              key={ch.id}
              onClick={() => !locked && onSelect(ch.id)}
              disabled={locked}
              className="rounded-xl p-5 text-left transition-all cursor-pointer border-2"
              style={{
                background: current ? "rgba(255,214,0,0.08)" : completed ? "rgba(118,255,3,0.05)" : "rgba(255,255,255,0.02)",
                borderColor: current ? "#FFD60066" : completed ? "#76FF0333" : "transparent",
                opacity: locked ? 0.4 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-lg font-bold"
                  style={{
                    background: completed ? "#76FF03" : current ? "#FFD600" : "#333",
                    color: completed || current ? "#0a0e1a" : "#666",
                    fontFamily: "var(--font-pixel)",
                    fontSize: "14px",
                  }}
                >
                  {completed ? "✓" : locked ? "🔒" : ch.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold" style={{ color: locked ? "#555" : "#fff", fontFamily: "var(--font-pixel)", fontSize: "11px" }}>
                    {ch.title}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: locked ? "#444" : "#888" }}>
                    {ch.subtitle}
                  </div>
                </div>
                {completed && <span className="text-sm">{ch.badge.icon}</span>}
              </div>
            </button>
          );
        })}
      </div>

      {progress.completed.length === CHAPTERS.length && (
        <div className="mt-8 rounded-xl p-4" style={{ background: "rgba(118,255,3,0.08)", border: "1px solid #76FF0333" }}>
          <div className="text-xs mb-1" style={{ fontFamily: "var(--font-pixel)", color: "#76FF03" }}>ALL CHAPTERS COMPLETE</div>
          <div className="text-xs" style={{ color: "#aaa" }}>You're ready for multiplayer!</div>
        </div>
      )}

      <button onClick={onBack} className="mt-8 text-xs border-none bg-transparent cursor-pointer" style={{ color: "#444" }}>
        ← Back to home
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChapterSelect.jsx
git commit -m "feat: add ChapterSelect component with progress tracking"
```

---

### Task 11: StoryPage Screen (Main State Machine)

**Files:**
- Create: `src/screens/StoryPage.jsx`

The central orchestrator. State machine cycling: `select → story → learn → play → reflect → select`.

- [ ] **Step 1: Create `src/screens/StoryPage.jsx`**

This is the largest component. It wires together DollarGuy, InteractiveLesson, the gameplay round (reusing existing sim components), ObjectiveTracker, HintOverlay, and ChapterSelect.

```jsx
// src/screens/StoryPage.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { STOCKS, STARTING_CASH, TICK_MS, MAX_HISTORY } from "../../shared/constants.js";
import { CHAPTERS } from "../../shared/chapters.js";
import { NewsEngine } from "../../shared/newsEngine.js";
import DollarGuy from "../components/DollarGuy.jsx";
import InteractiveLesson from "../components/InteractiveLesson.jsx";
import ChapterSelect from "../components/ChapterSelect.jsx";
import ObjectiveTracker from "../components/ObjectiveTracker.jsx";
import HintOverlay from "../components/HintOverlay.jsx";
import BigChart from "../components/BigChart.jsx";
import StockCard from "../components/StockCard.jsx";
import TradeControls from "../components/TradeControls.jsx";
import FlashMessage from "../components/FlashMessage.jsx";
import Timer from "../components/Timer.jsx";
import NewsTicker from "../components/NewsTicker.jsx";
import UrgencyOverlay from "../components/UrgencyOverlay.jsx";
import useSoundEngine from "../hooks/useSoundEngine.js";

const INITIAL_PROGRESS = { currentChapter: 1, completed: [], badges: [] };

function loadProgress() {
  try {
    const raw = localStorage.getItem("dollardash_story_progress");
    return raw ? JSON.parse(raw) : INITIAL_PROGRESS;
  } catch {
    return INITIAL_PROGRESS;
  }
}

function saveProgress(progress) {
  localStorage.setItem("dollardash_story_progress", JSON.stringify(progress));
}

function getPortfolioValue(cash, holdings, prices) {
  let val = cash;
  for (const [idx, qty] of Object.entries(holdings)) {
    val += qty * prices[parseInt(idx)];
  }
  return val;
}

export default function StoryPage() {
  const navigate = useNavigate();
  const sound = useSoundEngine();
  const [progress, setProgress] = useState(loadProgress);

  // Phase: select | story | learn | minigame | play | reflect
  const [phase, setPhase] = useState("select");
  const [activeChapter, setActiveChapter] = useState(null);

  // Gameplay state (play phase)
  const [cash, setCash] = useState(STARTING_CASH);
  const [holdings, setHoldings] = useState({});
  const [prices, setPrices] = useState(STOCKS.map((s) => s.basePrice));
  const [histories, setHistories] = useState(STOCKS.map((s) => [s.basePrice]));
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedStock, setSelectedStock] = useState(0);
  const [flash, setFlash] = useState(null);
  const [newsEvents, setNewsEvents] = useState([]);
  const [objectiveMet, setObjectiveMet] = useState(false);
  const [activeHint, setActiveHint] = useState(null);

  const gameRef = useRef(null);
  const newsRef = useRef(null);
  const timerRef = useRef(null);
  const tickRef = useRef(null);
  const hintTimerRef = useRef(null);
  const scriptedEventsRef = useRef([]);

  const selectChapter = useCallback((chapterId) => {
    const ch = CHAPTERS.find((c) => c.id === chapterId);
    if (!ch) return;
    setActiveChapter(ch);
    setPhase("story");
    sound.unlock();
  }, [sound]);

  const startPlayPhase = useCallback(() => {
    const ch = activeChapter;
    if (!ch) return;
    const cfg = ch.gameplay;
    const available = cfg.availableStocks;
    const initPrices = STOCKS.map((s) => s.basePrice);

    setCash(STARTING_CASH);
    setHoldings({});
    setPrices(initPrices);
    setHistories(STOCKS.map((s) => [s.basePrice]));
    setTimeLeft(cfg.durationSeconds);
    setSelectedStock(available[0]);
    setFlash(null);
    setNewsEvents([]);
    setObjectiveMet(false);
    setActiveHint(null);
    newsRef.current = new NewsEngine();
    scriptedEventsRef.current = [...(cfg.scriptedEvents || [])];

    gameRef.current = {
      cash: STARTING_CASH,
      holdings: {},
      prices: initPrices,
      trades: 0,
      uniqueStocks: new Set(),
      holdTicks: {},
      longestHold: 0,
      biggestPosition: 0,
      newsBasedTrades: 0,
      lastNewsTime: 0,
    };
    setPhase("play");
    sound.bell();
    sound.startAmbient();
  }, [activeChapter, sound]);

  // Gameplay tick + timer
  useEffect(() => {
    if (phase !== "play" || !activeChapter) {
      clearInterval(timerRef.current);
      clearInterval(tickRef.current);
      return;
    }

    const cfg = activeChapter.gameplay;
    const elapsed = { seconds: 0 };

    timerRef.current = setInterval(() => {
      elapsed.seconds++;
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(tickRef.current);
          clearTimeout(hintTimerRef.current);
          sound.stopAmbient();
          sound.bell();
          setPhase("reflect");
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.4 }, colors: ["#FFD600", "#76FF03", "#00E5FF"] });
          return 0;
        }
        return t - 1;
      });

      // Fire scripted events
      const due = scriptedEventsRef.current.filter((e) => e.atSecond === elapsed.seconds);
      for (const ev of due) {
        const engine = newsRef.current;
        const tickDuration = Math.round((ev.durationSec * 1000) / TICK_MS);
        engine.activeModifiers.push({
          stockIdx: ev.stockIdx,
          driftMod: ev.driftMod,
          ticksLeft: tickDuration,
          id: ++engine._modIdCounter,
        });
        const firedEvent = {
          headline: ev.headline,
          sentiment: ev.sentiment,
          stockIdx: ev.stockIdx,
          symbol: ev.stockIdx >= 0 ? STOCKS[ev.stockIdx].symbol : "MARKET",
          timestamp: engine.tickCount,
        };
        engine.firedEvents.push(firedEvent);
        setNewsEvents((prev) => [...prev.slice(-9), firedEvent]);
        sound.news();
        gameRef.current.lastNewsTime = elapsed.seconds;
      }
      scriptedEventsRef.current = scriptedEventsRef.current.filter((e) => e.atSecond !== elapsed.seconds);

      // Hint triggers
      const g = gameRef.current;
      if (cfg.hintLevel === "heavy" && g.trades === 0 && elapsed.seconds >= 10) {
        setActiveHint("Don't be shy — tap a stock and hit BUY!");
      }
      if (cfg.hintLevel !== "light" && due.length > 0) {
        const ev = due[0];
        const verb = ev.sentiment === "bullish" ? "good" : "bad";
        const sym = ev.stockIdx >= 0 ? STOCKS[ev.stockIdx].symbol : "the market";
        setActiveHint(`Breaking news! That's ${verb} for ${sym}. Think about your next move!`);
      }
    }, 1000);

    tickRef.current = setInterval(() => {
      const engine = newsRef.current;
      const newEvent = engine.tick();

      setPrices((prev) => {
        const next = prev.map((p, i) => engine.generatePrice(p, i));
        gameRef.current.prices = next;
        return next;
      });
      setHistories((prev) =>
        prev.map((h, i) => {
          const newH = [...h, gameRef.current.prices[i]];
          return newH.length > MAX_HISTORY ? newH.slice(-MAX_HISTORY) : newH;
        }),
      );

      if (newEvent) {
        setNewsEvents((prev) => [...prev.slice(-9), newEvent]);
        sound.news();
        gameRef.current.lastNewsTime = Math.round(engine.tickCount * TICK_MS / 1000);
      }

      const g = gameRef.current;
      for (const idx of Object.keys(g.holdings)) {
        g.holdTicks[idx] = (g.holdTicks[idx] || 0) + 1;
        g.longestHold = Math.max(g.longestHold, g.holdTicks[idx]);
      }

      // Check objective
      const fv = getPortfolioValue(g.cash, g.holdings, g.prices);
      const returnPct = ((fv - STARTING_CASH) / STARTING_CASH) * 100;
      const stats = {
        totalTrades: g.trades,
        uniqueStocks: g.uniqueStocks.size,
        returnPct,
        newsBasedTrades: g.newsBasedTrades,
        longestHold: g.longestHold,
        biggestPosition: g.biggestPosition,
      };
      if (cfg.objective.check(stats)) {
        setObjectiveMet(true);
      }
    }, TICK_MS);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(tickRef.current);
    };
  }, [phase, activeChapter, sound]);

  const handleTrade = useCallback(
    ({ stockIdx, qty, type }) => {
      const g = gameRef.current;
      const price = prices[stockIdx];

      if (type === "buy") {
        const cost = price * qty;
        if (cost > cash) { showFlash("NOT ENOUGH CASH", "#FF3D71"); sound.error(); return; }
        const newCash = cash - cost;
        const newHoldings = { ...holdings, [stockIdx]: (holdings[stockIdx] || 0) + qty };
        setCash(newCash); setHoldings(newHoldings);
        g.cash = newCash; g.holdings = newHoldings; g.trades++;
        g.uniqueStocks.add(stockIdx);
        g.biggestPosition = Math.max(g.biggestPosition, newHoldings[stockIdx] * price);
        if (!g.holdTicks[stockIdx]) g.holdTicks[stockIdx] = 0;
        const timeSinceNews = Math.round(newsRef.current.tickCount * TICK_MS / 1000) - g.lastNewsTime;
        if (timeSinceNews <= 15) g.newsBasedTrades++;
        showFlash(`BOUGHT ${qty} ${STOCKS[stockIdx].symbol}`, "#76FF03");
        sound.buy();
      } else {
        const held = holdings[stockIdx] || 0;
        if (held < qty) { showFlash("NOT ENOUGH SHARES", "#FF3D71"); sound.error(); return; }
        const newCash = cash + price * qty;
        const newHoldings = { ...holdings };
        newHoldings[stockIdx] = held - qty;
        if (newHoldings[stockIdx] === 0) { delete newHoldings[stockIdx]; delete g.holdTicks[stockIdx]; }
        setCash(newCash); setHoldings(newHoldings);
        g.cash = newCash; g.holdings = newHoldings; g.trades++;
        const timeSinceNews = Math.round(newsRef.current.tickCount * TICK_MS / 1000) - g.lastNewsTime;
        if (timeSinceNews <= 15) g.newsBasedTrades++;
        showFlash(`SOLD ${qty} ${STOCKS[stockIdx].symbol}`, "#FFD600");
        sound.sell();
      }
    },
    [cash, holdings, prices, sound],
  );

  const showFlash = (msg, color) => {
    setFlash({ msg, color });
    setTimeout(() => setFlash(null), 1200);
  };

  const handleChapterComplete = useCallback(() => {
    if (!activeChapter) return;
    const newProgress = {
      ...progress,
      completed: [...new Set([...progress.completed, activeChapter.id])],
      badges: [...new Set([...progress.badges, activeChapter.badge.id])],
      currentChapter: Math.min(activeChapter.id + 1, CHAPTERS.length + 1),
    };
    setProgress(newProgress);
    saveProgress(newProgress);
    setPhase("select");
    setActiveChapter(null);
  }, [activeChapter, progress]);

  // ─── RENDER: Chapter Select ────────────────────────────
  if (phase === "select") {
    return (
      <ChapterSelect
        progress={progress}
        onSelect={selectChapter}
        onBack={() => navigate("/")}
      />
    );
  }

  // ─── RENDER: Story Beat ────────────────────────────────
  if (phase === "story" && activeChapter) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <div className="text-xs tracking-wider mb-6" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
          CHAPTER {activeChapter.id}: {activeChapter.title.toUpperCase()}
        </div>
        <DollarGuy
          dialog={activeChapter.storyDialog}
          onDialogComplete={() => setPhase("learn")}
        />
      </div>
    );
  }

  // ─── RENDER: Learn Phase ───────────────────────────────
  if (phase === "learn" && activeChapter) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <div className="text-xs tracking-wider mb-6" style={{ fontFamily: "var(--font-pixel)", color: "#00E5FF" }}>
          {activeChapter.subtitle.toUpperCase()}
        </div>
        <DollarGuy
          dialog={activeChapter.learnDialog}
          onDialogComplete={() => setPhase("minigame")}
        />
      </div>
    );
  }

  // ─── RENDER: Mini-Game ─────────────────────────────────
  if (phase === "minigame" && activeChapter) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
        <InteractiveLesson
          miniGame={activeChapter.miniGame}
          onComplete={() => startPlayPhase()}
        />
      </div>
    );
  }

  // ─── RENDER: Play Phase ────────────────────────────────
  if (phase === "play" && activeChapter) {
    const cfg = activeChapter.gameplay;
    const portfolioValue = getPortfolioValue(cash, holdings, prices);
    const pnl = portfolioValue - STARTING_CASH;

    return (
      <div className="min-h-dvh flex flex-col px-3 py-3 gap-2 max-w-6xl mx-auto pb-28">
        <UrgencyOverlay timeLeft={timeLeft} />
        <FlashMessage message={flash?.msg} color={flash?.color} />
        <HintOverlay text={activeHint} onDismiss={() => setActiveHint(null)} />

        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
            CH{activeChapter.id}: {activeChapter.title.toUpperCase()}
          </div>
          <span className="font-bold text-sm" style={{ color: pnl >= 0 ? "#76FF03" : "#FF3D71" }}>
            P&L: {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
          </span>
        </div>

        <ObjectiveTracker text={cfg.objective.text} completed={objectiveMet} />
        <Timer timeLeft={timeLeft} total={cfg.durationSeconds} />

        <div className="flex justify-between items-center rounded-lg px-4 py-2.5 text-sm" style={{ background: "rgba(255,255,255,0.04)" }}>
          <span>💵 <b style={{ color: "#76FF03" }}>${cash.toFixed(2)}</b></span>
          <span>📊 <b style={{ color: "#00E5FF" }}>${portfolioValue.toFixed(2)}</b></span>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 flex-1">
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            <BigChart histories={histories} selectedIdx={selectedStock} />

            <div className="grid grid-cols-2 gap-2">
              {cfg.availableStocks.map((i) => (
                <StockCard
                  key={STOCKS[i].symbol}
                  index={i}
                  price={prices[i]}
                  history={histories[i]}
                  holdings={holdings[i] || 0}
                  selected={selectedStock === i}
                  onSelect={setSelectedStock}
                />
              ))}
            </div>

            <TradeControls
              selectedStock={selectedStock}
              price={prices[selectedStock]}
              cash={cash}
              onTrade={handleTrade}
              disabled={false}
            />
          </div>

          {cfg.availableStocks.length > 1 && (
            <div className="lg:w-80 xl:w-96 shrink-0 flex flex-col">
              <NewsTicker events={newsEvents} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER: Reflect Phase ─────────────────────────────
  if (phase === "reflect" && activeChapter) {
    const g = gameRef.current;
    const fv = getPortfolioValue(g.cash, g.holdings, g.prices);
    const returnPct = ((fv - STARTING_CASH) / STARTING_CASH) * 100;

    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="text-xs tracking-wider mb-2" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
          CHAPTER {activeChapter.id} COMPLETE
        </div>

        {objectiveMet ? (
          <div className="text-4xl mb-3">🎉</div>
        ) : (
          <div className="text-4xl mb-3">📝</div>
        )}

        <div className="rounded-xl p-4 mb-6 w-full max-w-xs" style={{ background: objectiveMet ? "rgba(118,255,3,0.08)" : "rgba(255,214,0,0.08)", border: `1px solid ${objectiveMet ? "#76FF0333" : "#FFD60033"}` }}>
          <div className="text-xs mb-1" style={{ fontFamily: "var(--font-pixel)", color: objectiveMet ? "#76FF03" : "#FFD600", fontSize: "10px" }}>
            {objectiveMet ? "OBJECTIVE MET ✓" : "OBJECTIVE NOT MET"}
          </div>
          <div className="text-xs" style={{ color: "#aaa" }}>{activeChapter.gameplay.objective.text}</div>
          <div className="text-lg font-bold mt-2" style={{ color: returnPct >= 0 ? "#76FF03" : "#FF3D71" }}>
            {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(1)}% return
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <span className="text-xl">{activeChapter.badge.icon}</span>
            <span className="text-xs font-bold" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
              {activeChapter.badge.label.toUpperCase()}
            </span>
          </div>
        </div>

        <DollarGuy
          dialog={activeChapter.reflectDialog}
          onDialogComplete={handleChapterComplete}
          size="small"
        />
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/screens/StoryPage.jsx
git commit -m "feat: add StoryPage state machine with all chapter phases"
```

---

### Task 12: Wire Up Routes & HomeScreen

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/screens/HomeScreen.jsx`

- [ ] **Step 1: Add `/story` route to `src/App.jsx`**

Add the import and route. The file currently has 5 routes. Add `StoryPage` import after `SoloPage` import, and add the route after the `/solo` route.

In `src/App.jsx`, add after line 4 (`import SoloPage from "./screens/SoloPage.jsx";`):

```jsx
import StoryPage from "./screens/StoryPage.jsx";
```

Add after line 11 (`<Route path="/solo" element={<SoloPage />} />`):

```jsx
      <Route path="/story" element={<StoryPage />} />
```

- [ ] **Step 2: Update HomeScreen "SOLO PLAY" button to "STORY MODE"**

In `src/screens/HomeScreen.jsx`, change the solo button (around line 119-130):

Change `onClick={() => navigate("/solo")}` to `onClick={() => navigate("/story")}`

Change the button text from `SOLO PLAY` to `STORY MODE`

Change the subtitle text from `"A real-time stock trading game.\nPlay solo or compete with friends. Highest portfolio wins."` to `"Learn to trade through Dollar Guy's story — then compete with friends."`

Change `"Solo mode works offline. Multiplayer needs a server."` to `"Story mode teaches the basics. Multiplayer lets you compete."`

- [ ] **Step 3: Verify the app builds**

Run: `cd /Users/williamcblair/Desktop/finance_game && npm run build`

Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/screens/HomeScreen.jsx
git commit -m "feat: wire story mode route and update home screen"
```

---

### Task 13: Final Integration Test

- [ ] **Step 1: Start dev server and verify**

Run: `cd /Users/williamcblair/Desktop/finance_game && npm run dev`

Open `http://localhost:5173` in browser. Verify:
1. Home screen shows "STORY MODE" button instead of "SOLO PLAY"
2. Clicking "STORY MODE" navigates to `/story`
3. Chapter select shows Chapter 1 unlocked, Chapters 2-3 locked
4. Starting Chapter 1 shows Dollar Guy dialog with typewriter effect
5. Tapping through story leads to learn phase, then mini-game (first buy)
6. Mini-game works — buy and sell a stock
7. After mini-game, gameplay round starts with 1 stock, 60 seconds, objective visible
8. After round ends, reflect phase shows results and Dollar Guy takeaway
9. Chapter 2 unlocks after completing Chapter 1
10. HOST and JOIN buttons still work and route to multiplayer (unchanged)

- [ ] **Step 2: Verify multiplayer is untouched**

Run: `git diff server/ src/screens/HostPage.jsx src/screens/PlayerPage.jsx src/hooks/useSocket.js`

Expected: No changes to any of these files.

- [ ] **Step 3: Commit any fixes**

If any issues found during testing, fix and commit.
