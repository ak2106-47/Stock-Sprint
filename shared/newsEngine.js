import { STOCKS, NEWS_EVENTS, TICK_MS } from "./constants.js";

/**
 * NewsEngine manages event scheduling, active modifiers, and price generation.
 * Shared between server (multiplayer) and client (solo) — pure logic, no I/O.
 *
 * Events fire on a schedule: first at ~8s, then every 10–18s.
 * Each event temporarily adds a drift modifier to the affected stock(s).
 * Active modifiers decay and expire after their duration.
 */
export class NewsEngine {
  /** @param {object} [options] See `bullishPickProbability` on gameplay config (story chapters). */
  constructor(options = {}) {
    this.options = options;
    this.activeModifiers = [];
    this.firedEvents = [];
    this.usedIndices = new Set();
    this.tickCount = 0;
    this.nextEventTick = 1; // Fire the first news event immediately when trading starts
    this._modIdCounter = 0;
  }

  tick() {
    this.tickCount++;
    this._decayModifiers();

    if (this.tickCount >= this.nextEventTick) {
      const event = this._pickEvent();
      if (event) {
        const tickDuration = Math.round((event.durationSec * 1000) / TICK_MS);
        this.activeModifiers.push({
          stockIdx: event.stockIdx,
          driftMod: event.driftMod,
          ticksLeft: tickDuration,
          id: ++this._modIdCounter,
        });

        const firedEvent = {
          headline: event.headline,
          sentiment: event.sentiment,
          stockIdx: event.stockIdx,
          symbol: event.stockIdx >= 0 ? STOCKS[event.stockIdx].symbol : "MARKET",
          timestamp: this.tickCount,
        };
        this.firedEvents.push(firedEvent);

        // 10–18 second gap between events
        this.nextEventTick = this.tickCount + this._randomTickBetween(40, 72);
        return firedEvent;
      }
    }
    return null;
  }

  generatePrice(prevPrice, stockIdx) {
    const stock = STOCKS[stockIdx];
    const shock = (Math.random() - 0.5) * 2 * stock.volatility;

    let newsDrift = 0;
    for (const mod of this.activeModifiers) {
      if (mod.stockIdx === -1 || mod.stockIdx === stockIdx) {
        newsDrift += mod.driftMod;
      }
    }

    const crash = Math.random() < 0.002 ? (Math.random() > 0.5 ? 0.08 : -0.08) : 0;
    const next = prevPrice * (1 + shock + stock.drift + newsDrift + crash);
    return Math.max(0.01, parseFloat(next.toFixed(2)));
  }

  getRecentEvents(count = 5) {
    return this.firedEvents.slice(-count);
  }

  getActiveModifiers() {
    return this.activeModifiers.map((m) => ({
      stockIdx: m.stockIdx,
      symbol: m.stockIdx >= 0 ? STOCKS[m.stockIdx].symbol : "ALL",
      direction: m.driftMod > 0 ? "up" : "down",
      strength: Math.abs(m.driftMod),
      ticksLeft: m.ticksLeft,
    }));
  }

  _decayModifiers() {
    for (const mod of this.activeModifiers) {
      mod.ticksLeft--;
    }
    this.activeModifiers = this.activeModifiers.filter((m) => m.ticksLeft > 0);
  }

  _pickEvent() {
    const available = NEWS_EVENTS.map((ev, i) => ({ ev, i })).filter(({ i }) => !this.usedIndices.has(i));

    if (available.length === 0) {
      this.usedIndices.clear();
      return this._pickEvent();
    }

    const p = this.options.bullishPickProbability;
    if (typeof p === "number" && p >= 0 && p <= 1) {
      const wantBullish = Math.random() < p;
      const sentimentMatch = available.filter(({ ev }) => (wantBullish ? ev.sentiment === "bullish" : ev.sentiment === "bearish"));
      const pool = sentimentMatch.length > 0 ? sentimentMatch : available;
      const pick = pool[Math.floor(Math.random() * pool.length)];
      this.usedIndices.add(pick.i);
      return pick.ev;
    }

    const pick = available[Math.floor(Math.random() * available.length)];
    this.usedIndices.add(pick.i);
    return pick.ev;
  }

  _randomTickBetween(minTicks, maxTicks) {
    return minTicks + Math.floor(Math.random() * (maxTicks - minTicks));
  }

  serialize() {
    return {
      recentEvents: this.getRecentEvents(5),
      activeModifiers: this.getActiveModifiers(),
    };
  }
}
