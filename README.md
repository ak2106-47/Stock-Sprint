# Stock Sprint

A real-time multiplayer stock trading game for the classroom. Players compete to grow a virtual $10,000 portfolio by buying and selling stocks as live news events move the market — all from their phones while a host projects the game on screen.

---

## How It Works

1. A **host** creates a room and displays the room code (+ QR code) on a projector
2. **Players** join on their phones by entering the code at `/play`
3. The host starts the game — a simulated stock market runs in real time
4. **Breaking news headlines** fire every few seconds, moving specific stocks up or down
5. Players buy and sell across 4 stocks to maximise their portfolio value
6. When time runs out, the leaderboard is revealed with grades, badges, and trader titles

---

## Stocks

| Symbol | Company | Risk | Character |
|--------|---------|------|-----------|
| **NXT** | NextGen Tech | HIGH | AI/semiconductor — huge swings on news |
| **ECO** | EcoPower Solar | MED | Green energy — reacts to policy headlines |
| **CART** | FreshCart Retail | LOW-MED | Consumer retail — slow and steady |
| **SAFE** | SafeHaven Bonds | LOW | Government bonds — barely moves |

---

## Features

- **Real-time market** — prices tick every 250 ms driven by drift + volatility + active news events
- **Live news feed** — 25 curated headlines across all 4 stocks and macro events
- **Day system** — game is split into 30-second trading days with transition screens
- **Leaderboard** — live rankings update every tick on the host screen
- **Badges** — 8 earnable badges (First Trade, Diamond Hands, Whale, Got REKT, etc.)
- **Trader titles** — rank up from INTERN to PARTNER based on return %
- **Day-end warning** — screen flashes red 5 seconds before each new day
- **Story mode** — solo tutorial teaching trading basics through interactive lessons
- **QR code join** — players scan to join instantly, no app install needed
- **Custom game duration** — preset (1/3/5 min) or custom (0.5–30 min)

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Routing | React Router v7 |
| Charts | Custom canvas-based mini/big charts |
| Fonts | Press Start 2P (pixel), IBM Plex Mono |
| Confetti | canvas-confetti |
| QR codes | qrcode.react |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
git clone https://github.com/ak2106-47/Stock-Sprint
cd Stock-Sprint
npm install
```

### Run (development)

```bash
npm run dev
```

This starts both the Express/Socket.io server and the Vite dev server concurrently.

| Service | URL |
|---------|-----|
| Game | https://stocksprint.onrender.com |
| Server | https://stocksprint.onrender.com (same origin) |

### Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
stock-sprint/
├── server/
│   ├── index.js        # Express + Socket.io server, room management
│   └── game.js         # Game engine: market simulation, news, days, badges
├── shared/
│   └── constants.js    # Stocks, news events, badges, trader titles
├── src/
│   ├── screens/
│   │   ├── HomeScreen.jsx       # Landing page
│   │   ├── HostPage.jsx         # Host view: lobby, live market, results
│   │   ├── PlayerPage.jsx       # Player view: join, trading UI, results
│   │   ├── StoryPage.jsx        # Story mode chapters
│   │   └── SoloPage.jsx         # Solo practice mode
│   ├── components/
│   │   ├── DayTransitionScreen  # Between-day countdown screen
│   │   ├── Leaderboard          # Live ranking table
│   │   ├── NewsTicker           # Scrolling news feed panel
│   │   ├── StockCard            # Individual stock price card
│   │   ├── TradeControls        # Buy/sell quantity controls
│   │   ├── Timer                # Countdown progress bar
│   │   ├── ArcadeTitle          # Animated glitch title
│   │   └── ...
│   └── hooks/
│       ├── useSocket.js         # Socket.io connection hook
│       └── useSoundEngine.js    # Sound effects engine
├── public/                      # Static assets (GIFs, favicon)
└── index.html
```

---

## Socket Events

### Host → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `host:create` | — | Create a new room |
| `host:start` | — | Start the game |
| `host:setDuration` | `{ seconds }` | Set game length (30–1800s) |
| `host:kick` | `{ playerId }` | Remove a player |

### Player → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `player:join` | `{ code, name }` | Join a room |
| `player:trade` | `{ stockIdx, qty, type }` | Buy or sell shares |

### Server → Clients
| Event | Description |
|-------|-------------|
| `lobby:update` | Player list changed |
| `game:start` | Game has begun |
| `game:tick` | Market prices + leaderboard update (4× per second) |
| `game:timer` | Seconds remaining |
| `game:news` | New headline fired |
| `game:day` | New trading day started (with leaderboard snapshot) |
| `game:dayWarning` | Day ending in 5 seconds |
| `game:end` | Game over with final results |

---

## Badges

| Badge | Condition |
|-------|-----------|
| 🏁 First Trade | Execute at least 1 trade |
| 💚 In The Green | Finish with a positive return |
| 🚀 Doubled Up | Achieve +100% return |
| 💎 Diamond Hands | Hold a position for 20+ ticks |
| 📈 Day Trader | Make 15+ trades |
| 🎯 Diversified | Trade 3+ different stocks |
| 🐋 Whale | Build a $5,000+ single position |
| 💀 Got REKT | Lose more than 50% of your portfolio |

---

## Environment

The server reads from `.env` if present. No required variables for basic local play.

---

## License

MIT
