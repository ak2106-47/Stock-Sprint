import { STOCKS, STARTING_CASH, DEFAULT_DURATION, TICK_MS, MAX_HISTORY, BADGES } from "../shared/constants.js";
import { NewsEngine } from "../shared/newsEngine.js";

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function getPortfolioValue(cash, holdings, prices) {
  let val = cash;
  for (const [idx, qty] of Object.entries(holdings)) {
    val += qty * prices[parseInt(idx)];
  }
  return val;
}

export class GameRoom {
  constructor(hostSocketId) {
    this.code = generateRoomCode();
    this.hostId = hostSocketId;
    this.state = "lobby";
    this.players = new Map();
    this.prices = STOCKS.map((s) => s.basePrice);
    this.histories = STOCKS.map((s) => [s.basePrice]);
    this.duration = DEFAULT_DURATION;
    this.timeLeft = DEFAULT_DURATION;
    this.demand = STOCKS.map(() => 0);
    this.newsEngine = null;
    this.tickInterval = null;
    this.timerInterval = null;
    this.onTick = null;
    this.onTimer = null;
    this.onEnd = null;
    this.onNews = null;
    this.onDay = null;
    this.onDayWarning = null;
    this.dayNumber = 1;
  }

  setDuration(seconds) {
    const s = parseInt(seconds, 10);
    if (!isNaN(s) && s >= 30 && s <= 1800) {
      this.duration = s;
      this.timeLeft = s;
    }
  }

  addPlayer(socketId, name) {
    if (this.state !== "lobby") return { ok: false, error: "Game already started" };
    if (this.players.size >= 50) return { ok: false, error: "Room is full" };

    const existing = [...this.players.values()].find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) return { ok: false, error: "Name already taken" };

    this.players.set(socketId, {
      id: socketId,
      name,
      cash: STARTING_CASH,
      holdings: {},
      stats: {
        totalTrades: 0,
        uniqueStocks: new Set(),
        holdTicks: {},
        longestHold: 0,
        biggestPosition: 0,
      },
    });
    return { ok: true };
  }

  removePlayer(socketId) {
    this.players.delete(socketId);
  }

  start() {
    if (this.state !== "lobby") return;
    this.state = "playing";
    this.timeLeft = this.duration;
    this.dayNumber = 1;
    this.prices = STOCKS.map((s) => s.basePrice);
    this.histories = STOCKS.map((s) => [s.basePrice]);
    this.demand = STOCKS.map(() => 0);
    this.newsEngine = new NewsEngine();

    for (const player of this.players.values()) {
      player.cash = STARTING_CASH;
      player.holdings = {};
      player.stats = {
        totalTrades: 0,
        uniqueStocks: new Set(),
        holdTicks: {},
        longestHold: 0,
        biggestPosition: 0,
      };
    }

    // Start trading after 12-second Day 1 intro screen
    setTimeout(() => {
      if (this.state === "playing") {
        this.tickInterval = setInterval(() => this._tick(), TICK_MS);
        this.timerInterval = setInterval(() => this._timer(), 1000);
      }
    }, 12000);
  }

  _tick() {
    const newEvent = this.newsEngine.tick();

    this.prices = this.prices.map((p, i) => {
      const newsPrice = this.newsEngine.generatePrice(p, i);
      // Inject player sentiment/demand drift
      const demandDrift = this.demand[i] * 0.00015;
      
      this.demand[i] *= 0.80; // decay 20% momentum per tick
      if (Math.abs(this.demand[i]) < 0.1) this.demand[i] = 0;
      
      return Math.max(0.01, parseFloat((newsPrice * (1 + demandDrift)).toFixed(2)));
    });

    this.histories = this.histories.map((h, i) => {
      const next = [...h, this.prices[i]];
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
    });

    for (const player of this.players.values()) {
      for (const idx of Object.keys(player.holdings)) {
        player.stats.holdTicks[idx] = (player.stats.holdTicks[idx] || 0) + 1;
        player.stats.longestHold = Math.max(player.stats.longestHold, player.stats.holdTicks[idx]);
      }
    }

    if (newEvent) {
      this.onNews?.(newEvent);
    }
    this.onTick?.();
  }

  _timer() {
    this.timeLeft--;
    this.onTimer?.();

    const elapsed = this.duration - this.timeLeft;

    // Warn 5 seconds before each day ends
    if (elapsed > 0 && elapsed % 30 === 25 && this.timeLeft > 0) {
      this.onDayWarning?.();
    }

    if (elapsed > 0 && elapsed % 30 === 0 && this.timeLeft > 0) {
      this.dayNumber++;
      this._pauseForDay();
      return;
    }

    if (this.timeLeft <= 0) {
      this._endGame();
    }
  }

  _pauseForDay() {
    clearInterval(this.tickInterval);
    clearInterval(this.timerInterval);
    this.tickInterval = null;
    this.timerInterval = null;
    this.onDay?.(this.dayNumber, this.getLeaderboard());
    setTimeout(() => {
      if (this.state === "playing") {
        // Fire the first news event immediately when the new day starts
        this.newsEngine.nextEventTick = this.newsEngine.tickCount + 1;
        this.tickInterval = setInterval(() => this._tick(), TICK_MS);
        this.timerInterval = setInterval(() => this._timer(), 1000);
      }
    }, 10000);
  }

  _endGame() {
    clearInterval(this.tickInterval);
    clearInterval(this.timerInterval);
    this.state = "results";
    this.onEnd?.();
  }

  executeTrade(socketId, stockIdx, qty, type) {
    if (this.state !== "playing") return { ok: false, error: "Game not active" };
    const player = this.players.get(socketId);
    if (!player) return { ok: false, error: "Player not found" };
    if (stockIdx < 0 || stockIdx >= STOCKS.length) return { ok: false, error: "Invalid stock" };
    if (qty <= 0 || !Number.isInteger(qty)) return { ok: false, error: "Invalid quantity" };

    const price = this.prices[stockIdx];

    if (type === "buy") {
      const cost = price * qty;
      if (cost > player.cash) return { ok: false, error: "Not enough cash" };
      player.cash -= cost;
      player.holdings[stockIdx] = (player.holdings[stockIdx] || 0) + qty;
      player.stats.totalTrades++;
      player.stats.uniqueStocks.add(stockIdx);
      const posVal = player.holdings[stockIdx] * price;
      player.stats.biggestPosition = Math.max(player.stats.biggestPosition, posVal);
      if (!player.stats.holdTicks[stockIdx]) player.stats.holdTicks[stockIdx] = 0;

      // Affect market demand
      this.demand[stockIdx] += qty;

      return { ok: true, action: "buy", symbol: STOCKS[stockIdx].symbol, qty, price, cash: player.cash };
    }

    if (type === "sell") {
      const held = player.holdings[stockIdx] || 0;
      if (held < qty) return { ok: false, error: "Not enough shares" };
      player.cash += price * qty;
      player.holdings[stockIdx] = held - qty;
      if (player.holdings[stockIdx] === 0) {
        delete player.holdings[stockIdx];
        delete player.stats.holdTicks[stockIdx];
      }
      player.stats.totalTrades++;

      // Affect market demand
      this.demand[stockIdx] -= qty;

      return { ok: true, action: "sell", symbol: STOCKS[stockIdx].symbol, qty, price, cash: player.cash };
    }

    return { ok: false, error: "Invalid trade type" };
  }

  getLeaderboard() {
    const entries = [];
    for (const player of this.players.values()) {
      const value = getPortfolioValue(player.cash, player.holdings, this.prices);
      const returnPct = ((value - STARTING_CASH) / STARTING_CASH) * 100;
      entries.push({
        id: player.id,
        name: player.name,
        value: parseFloat(value.toFixed(2)),
        returnPct: parseFloat(returnPct.toFixed(1)),
        trades: player.stats.totalTrades,
      });
    }
    entries.sort((a, b) => b.value - a.value);
    return entries.map((e, i) => ({ ...e, rank: i + 1 }));
  }

  getPlayerState(socketId) {
    const player = this.players.get(socketId);
    if (!player) return null;
    return {
      cash: player.cash,
      holdings: { ...player.holdings },
      portfolioValue: parseFloat(getPortfolioValue(player.cash, player.holdings, this.prices).toFixed(2)),
    };
  }

  getFinalResults() {
    const leaderboard = this.getLeaderboard();
    return leaderboard.map((entry) => {
      const player = this.players.get(entry.id);
      const earnedBadges = BADGES.filter((b) => {
        const stats = {
          totalTrades: player.stats.totalTrades,
          uniqueStocks: player.stats.uniqueStocks.size,
          longestHold: player.stats.longestHold,
          biggestPosition: player.stats.biggestPosition,
          returnPct: entry.returnPct,
          finalValue: entry.value,
        };
        if (b.min !== undefined) return stats[b.key] >= b.min;
        if (b.max !== undefined) return stats[b.key] <= b.max;
        return false;
      });

      const grade =
        entry.value >= STARTING_CASH * 2 ? "S" :
        entry.value >= STARTING_CASH * 1.5 ? "A" :
        entry.value >= STARTING_CASH * 1.2 ? "B" :
        entry.value >= STARTING_CASH ? "C" :
        entry.value >= STARTING_CASH * 0.7 ? "D" : "F";

      return {
        ...entry,
        grade,
        badges: earnedBadges.map((b) => ({ id: b.id, label: b.label, icon: b.icon })),
      };
    });
  }

  getMarketState() {
    return {
      prices: [...this.prices],
      histories: this.histories.map((h) => [...h]),
      timeLeft: this.timeLeft,
      duration: this.duration,
      news: this.newsEngine ? this.newsEngine.serialize() : { recentEvents: [], activeModifiers: [] },
    };
  }

  getPlayerList() {
    return [...this.players.values()].map((p) => ({ id: p.id, name: p.name }));
  }

  destroy() {
    clearInterval(this.tickInterval);
    clearInterval(this.timerInterval);
  }
}

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.playerRooms = new Map();
  }

  createRoom(hostSocketId) {
    const room = new GameRoom(hostSocketId);
    while (this.rooms.has(room.code)) {
      room.code = generateRoomCode();
    }
    this.rooms.set(room.code, room);
    return room;
  }

  getRoom(code) {
    return this.rooms.get(code?.toUpperCase()) || null;
  }

  getRoomByPlayer(socketId) {
    const code = this.playerRooms.get(socketId);
    return code ? this.rooms.get(code) : null;
  }

  joinRoom(code, socketId, name) {
    const room = this.getRoom(code);
    if (!room) return { ok: false, error: "Room not found" };
    const result = room.addPlayer(socketId, name);
    if (result.ok) {
      this.playerRooms.set(socketId, room.code);
    }
    return result;
  }

  handleDisconnect(socketId) {
    const code = this.playerRooms.get(socketId);
    if (code) {
      const room = this.rooms.get(code);
      if (room) {
        room.removePlayer(socketId);
      }
      this.playerRooms.delete(socketId);
    }

    for (const [roomCode, room] of this.rooms) {
      if (room.hostId === socketId) {
        room.destroy();
        for (const playerId of room.players.keys()) {
          this.playerRooms.delete(playerId);
        }
        this.rooms.delete(roomCode);
        return { wasHost: true, roomCode };
      }
    }
    return { wasHost: false, roomCode: code };
  }

  destroyRoom(code) {
    const room = this.rooms.get(code);
    if (room) {
      room.destroy();
      for (const playerId of room.players.keys()) {
        this.playerRooms.delete(playerId);
      }
      this.rooms.delete(code);
    }
  }
}
