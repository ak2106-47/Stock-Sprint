import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { STOCKS, STARTING_CASH, TICK_MS, MAX_HISTORY } from "../../shared/constants.js";
import { CHAPTERS } from "../../shared/chapters.js";
import { NewsEngine } from "../../shared/newsEngine.js";
import Sarge from "../components/Sarge.jsx";
import StoryPhaseShell from "../components/StoryPhaseShell.jsx";
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
import { useNewsAnnouncer } from "../hooks/useNewsAnnouncer.js";

const INITIAL_PROGRESS = { currentChapter: 1, completed: [], badges: [] };

function loadProgress() {
  try {
    const raw = localStorage.getItem("stocksprint_story_progress");
    return raw ? JSON.parse(raw) : INITIAL_PROGRESS;
  } catch {
    return INITIAL_PROGRESS;
  }
}

function saveProgress(progress) {
  localStorage.setItem("stocksprint_story_progress", JSON.stringify(progress));
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

  const [phase, setPhase] = useState("select");
  const [activeChapter, setActiveChapter] = useState(null);

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

  useNewsAnnouncer(newsEvents, phase === "play");

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
    newsRef.current = new NewsEngine(cfg.newsEngineOptions ?? {});
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

  if (phase === "select") {
    return (
      <ChapterSelect
        progress={progress}
        onSelect={selectChapter}
        onBack={() => navigate("/")}
      />
    );
  }

  if (phase === "story" && activeChapter) {
    return (
      <StoryPhaseShell backdropUrl={activeChapter.storyBackdrop}>
        <div className="min-h-dvh flex w-full flex-col justify-center px-4 py-10 sm:px-6 md:px-8">
          <div
            className="mx-auto mb-5 w-full max-w-[52rem] text-center text-xs tracking-wider"
            style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}
          >
            CHAPTER {activeChapter.id}: {activeChapter.title.toUpperCase()}
          </div>
          <div className="mx-auto w-full max-w-[52rem]">
            <Sarge
              key={`story-${activeChapter.id}`}
              dialog={activeChapter.storyDialog}
              typingSpeed={activeChapter.dialogTypingSpeed ?? 22}
              onDialogComplete={() =>
                setPhase(
                  activeChapter.learnDialog?.length
                    ? "learn"
                    : activeChapter.situationDialog?.length
                      ? "situation"
                      : "minigame",
                )
              }
            />
          </div>
        </div>
      </StoryPhaseShell>
    );
  }

  if (phase === "learn" && activeChapter) {
    return (
      <StoryPhaseShell backdropUrl={activeChapter.storyBackdrop}>
        <div className="min-h-dvh flex w-full flex-col justify-center px-4 py-10 sm:px-6 md:px-8">
          <div
            className="mx-auto mb-5 w-full max-w-[52rem] text-center text-xs tracking-wider"
            style={{ fontFamily: "var(--font-pixel)", color: "#00E5FF" }}
          >
            {activeChapter.subtitle.toUpperCase()}
          </div>
          <div className="mx-auto w-full max-w-[52rem]">
            <Sarge
              key={`learn-${activeChapter.id}`}
              dialog={activeChapter.learnDialog}
              typingSpeed={activeChapter.dialogTypingSpeed ?? 22}
              onDialogComplete={() =>
                setPhase(activeChapter.situationDialog?.length ? "situation" : "minigame")
              }
            />
          </div>
        </div>
      </StoryPhaseShell>
    );
  }

  if (phase === "situation" && activeChapter?.situationDialog?.length) {
    return (
      <StoryPhaseShell backdropUrl={activeChapter.storyBackdrop}>
        <div className="min-h-dvh flex w-full flex-col justify-center px-4 py-10 sm:px-6 md:px-8">
          <div
            className="mx-auto mb-5 w-full max-w-[52rem] text-center text-xs tracking-wider"
            style={{ fontFamily: "var(--font-pixel)", color: "#FF9100" }}
          >
            THE SITUATION
          </div>
          <div className="mx-auto w-full max-w-[52rem]">
            <Sarge
              key={`situation-${activeChapter.id}`}
              dialog={activeChapter.situationDialog}
              typingSpeed={activeChapter.dialogTypingSpeed ?? 22}
              onDialogComplete={() => setPhase("minigame")}
            />
          </div>
        </div>
      </StoryPhaseShell>
    );
  }

  if (phase === "minigame" && activeChapter) {
    return (
      <StoryPhaseShell backdropUrl={activeChapter.storyBackdrop}>
        <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
          <InteractiveLesson
            miniGame={activeChapter.miniGame}
            onComplete={() => {
              if (activeChapter.gameplay.skipGameplay) {
                setPhase("reflect");
              } else {
                startPlayPhase();
              }
            }}
          />
        </div>
      </StoryPhaseShell>
    );
  }

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

  if (phase === "reflect" && activeChapter) {
    const skipped = activeChapter.gameplay.skipGameplay;
    const g = gameRef.current;
    const fv = g ? getPortfolioValue(g.cash, g.holdings, g.prices) : STARTING_CASH;
    const returnPct = ((fv - STARTING_CASH) / STARTING_CASH) * 100;

    return (
      <StoryPhaseShell backdropUrl={activeChapter.storyBackdrop}>
        <div className="min-h-dvh flex w-full flex-col justify-center px-4 py-10 text-center sm:px-6 md:px-8">
          <div className="mx-auto mb-2 w-full max-w-[52rem] text-xs tracking-wider" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
            CHAPTER {activeChapter.id} COMPLETE
          </div>

          <div className="text-4xl mb-3">{skipped || objectiveMet ? "🎉" : "📝"}</div>

          {!skipped && (
            <div className="mx-auto rounded-xl p-4 mb-6 w-full max-w-xs" style={{ background: objectiveMet ? "rgba(118,255,3,0.08)" : "rgba(255,214,0,0.08)", border: `1px solid ${objectiveMet ? "#76FF0333" : "#FFD60033"}` }}>
              <div className="text-xs mb-1" style={{ fontFamily: "var(--font-pixel)", color: objectiveMet ? "#76FF03" : "#FFD600", fontSize: "10px" }}>
                {objectiveMet ? "OBJECTIVE MET ✓" : "OBJECTIVE NOT MET"}
              </div>
              <div className="text-xs" style={{ color: "#aaa" }}>{activeChapter.gameplay.objective.text}</div>
              <div className="text-lg font-bold mt-2" style={{ color: returnPct >= 0 ? "#76FF03" : "#FF3D71" }}>
                {returnPct >= 0 ? "+" : ""}{returnPct.toFixed(1)}% return
              </div>
            </div>
          )}

          <div className="mx-auto mb-6 w-full max-w-[52rem]">
            <div className="flex items-center gap-2 mb-2 justify-center">
              <span className="text-xl">{activeChapter.badge.icon}</span>
              <span className="text-xs font-bold" style={{ fontFamily: "var(--font-pixel)", color: "#FFD600" }}>
                {activeChapter.badge.label.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[52rem]">
            <Sarge
              key={`reflect-${activeChapter.id}`}
              dialog={activeChapter.reflectDialog}
              typingSpeed={activeChapter.dialogTypingSpeed ?? 22}
              onDialogComplete={handleChapterComplete}
              size="small"
            />
          </div>
        </div>
      </StoryPhaseShell>
    );
  }

  return null;
}
