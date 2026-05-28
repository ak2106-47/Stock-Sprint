# Dollar Dash — Story Mode Design

## Overview

Transform the solo experience from a free-play trading sim into a **narrative-driven, educational game** guided by **Dollar Guy** (pixel-art Wall Street character). The story follows a young person who just got their first job and first paycheck — they know nothing about finance, and Dollar Guy teaches them through interactive chapters.

**Solo = Story Mode (education + gameplay). Multiplayer = Competitive (apply what you learned).**

The game must feel like a *game* — interactive, snappy, rewarding — not a lecture. Every teaching moment is woven into gameplay and narrative, never presented as a wall of text.

---

## Target Audience

Students and young people learning about markets for the first time. Assume zero financial knowledge. Tone is casual, encouraging, and fun — Dollar Guy talks like a cool mentor, not a textbook.

---

## The Story

You just got your first real job and your first paycheck. You're staring at your bank account thinking "now what?" **Dollar Guy** appears — a pixel-art animated Wall Street character — and becomes your guide. Over 3 chapters he takes you from "what even is a stock?" to "I can compete with real traders."

---

## Chapter Structure

Every chapter follows a **4-phase pattern** that keeps the pace game-like:

### Phase 1: Story Beat
- Dollar Guy narrates via **speech bubbles** over a scene
- Short, punchy dialog — 3-5 bubbles max per story beat
- Player clicks/taps through at their own pace
- Sets up the real-life situation that motivates the lesson

### Phase 2: Learn (Mini-Game)
- Dollar Guy explains the concept in plain language via speech bubbles
- Each chapter has a **mini-game** that makes the concept tangible and fun:
  - Ch1: Guided first-buy — tap to purchase, watch price animate, tap to sell
  - Ch2: Headline quiz — 3 headlines slide in, player swipes/taps bullish or bearish, scored with sound effects and reactions
  - Ch3: Portfolio builder — drag sliders to allocate money, then watch a crash simulation play out showing who survived
- Mini-games are **self-contained interactive moments** (15-30 seconds), not reading — they feel like game levels
- Dollar Guy reacts live to the player's choices with encouragement, correction, or humor

### Phase 3: Play
- A **guided trading round** using the existing sim engine (NewsEngine, price generation, StockCard, TradeControls, etc.)
- Each chapter has a **specific objective** tied to the concept taught:
  - Objectives give purpose beyond "maximize score"
  - Success = demonstrated understanding, not just high returns
- **Dollar Guy gives live hints** during the round:
  - Chapter 1: Heavy hints ("Price is going up — try selling now!")
  - Chapter 2: Moderate hints ("See that headline? Think about what it means for TechCorp...")
  - Chapter 3: Minimal hints ("You've got this. Remember: diversify.")
- Hints appear as small speech bubbles near the relevant UI element
- Round duration, available stocks, and events are configured per chapter

### Phase 4: Reflect
- Results screen showing: did you meet the objective? Portfolio performance stats
- Dollar Guy delivers the **takeaway** — one memorable sentence summarizing the concept
- Badge earned for completing the chapter
- "Next Chapter" button (or "Go to Multiplayer" after Chapter 3)

---

## The 3 Chapters

### Chapter 1 — "First Paycheck"

| Aspect | Detail |
|--------|--------|
| **Story** | You got your first paycheck. Dollar Guy pops up: "Congrats on the first check! Wanna make that money actually do something? Let me show you." |
| **Concept** | **What is a stock?** Buying a share = owning a piece of a company. Price up → profit. Price down → loss. |
| **Interactive moment** | Tap to "buy your first share" — a guided single-stock purchase with Dollar Guy walking through each step. |
| **Gameplay round** | **1 stock, 60 seconds.** Objective: *"Buy at least 1 share and sell it for a profit."* Heavy hints from Dollar Guy. |
| **Takeaway** | "You just made your first trade! A stock is a piece of a company. When it does well, so do you." |

### Chapter 2 — "Reading the Room"

| Aspect | Detail |
|--------|--------|
| **Story** | A coworker brags about making money because they read a headline before anyone else. Dollar Guy: "Markets react to information. The trick is knowing what to look for." |
| **Concept** | **News moves markets.** Bullish = good news = price up. Bearish = bad news = price down. Headlines are your edge. |
| **Interactive moment** | Shown 3 headlines — player taps whether each is bullish 📈 or bearish 📉. Dollar Guy confirms/corrects with a one-liner. |
| **Gameplay round** | **2 stocks, 90 seconds, news ticker active.** Objective: *"Make a profitable trade based on a news headline."* Moderate hints — Dollar Guy highlights relevant headlines. |
| **Takeaway** | "Information is power. The news isn't noise — it's your cheat code." |

### Chapter 3 — "Don't Bet It All"

| Aspect | Detail |
|--------|--------|
| **Story** | Dollar Guy tells a cautionary tale: "I knew a guy who put everything into one stock. It crashed. He lost it all. Don't be that guy." |
| **Concept** | **Diversification.** Spread risk across multiple stocks with different risk profiles. Volatile vs. stable. |
| **Interactive moment** | Allocation mini-game: given $100, drag sliders to split across 4 stocks. See a simulated before/after showing how diversified vs. concentrated portfolios survive a crash. |
| **Gameplay round** | **All 4 stocks, 2 minutes, scripted crash event mid-round.** Objective: *"End the round with shares in at least 3 different stocks."* Minimal hints. |
| **Takeaway** | "Diversification isn't exciting — it keeps you alive. You're ready for the real thing." |

---

## Post-Story → Multiplayer

After completing Chapter 3, Dollar Guy says: *"You've graduated from training. Think you can beat real people? Let's find out."*

Player is routed to the Home Screen with multiplayer emphasized. No hard gate — anyone can still join multiplayer via room code — but the story creates a natural "earn your way there" progression.

---

## Extensibility

The chapter system is **data-driven**. Adding a new chapter means adding a config object, not restructuring code. Future chapters could cover:
- Bonds and safer investments
- Market crashes and recession survival
- Compound growth and long-term thinking
- Crypto and speculative assets
- Budgeting and saving before investing

---

## Technical Architecture

### New Files

| File | Purpose |
|------|---------|
| `shared/chapters.js` | Array of chapter config objects. Each defines: id, title, story dialog, concept text, interactive type + data, gameplay config (stocks, duration, objectives, hint frequency, scripted events), takeaway text. |
| `src/screens/StoryPage.jsx` | Main story mode screen. State machine cycling through chapters and phases (story → learn → play → reflect). Renders phase-specific components. |
| `src/components/DollarGuy.jsx` | Dollar Guy character component. Renders the pixel-art sprite + speech bubble. Handles click-through dialog sequences. Supports positioning (left, right, center). |
| `src/components/DialogBubble.jsx` | Speech bubble UI. Styled to match the retro theme. Shows text with a typewriter effect. Click/tap to advance. |
| `src/components/HintOverlay.jsx` | In-game hint system for play phase. Dollar Guy's small speech bubble positioned near relevant UI elements. Driven by chapter config hint triggers. |
| `src/components/ObjectiveTracker.jsx` | Displays current chapter objective at top of play screen. Tracks completion conditions. Shows checkmark when met. |
| `src/components/ChapterSelect.jsx` | Chapter selection screen showing progress (locked/completed/current). Shown when entering `/story`. |
| `src/components/InteractiveLesson.jsx` | Renders the interactive moment for each chapter's learn phase. Switches on interaction type (tap-to-buy, quiz, drag-allocate). |

### Modified Files

| File | Change |
|------|--------|
| `src/App.jsx` | Add `/story` route pointing to `StoryPage`. |
| `src/screens/HomeScreen.jsx` | Replace "SOLO" button with "STORY MODE" button routing to `/story`. Show chapter progress indicator (e.g., "Chapter 2/3"). |
| `src/index.css` | Add styles for dialog bubbles, hint overlays, chapter transitions, and interactive lesson elements. |
| `shared/constants.js` | Add any new badges for story completion, chapter-specific news events if needed. |

### Scope: DO NOT MODIFY

The following files and features are **out of scope** and must not be changed:

- `server/index.js` — Express server, TTS endpoint
- `server/game.js` — GameRoom, RoomManager, multiplayer logic
- `src/screens/HostPage.jsx` — Host dashboard
- `src/screens/PlayerPage.jsx` — Player join/trade terminal
- `src/hooks/useSocket.js` — Socket.IO client
- All multiplayer socket events and flows

### Reused Without Changes (in Story Mode)

- `shared/newsEngine.js` — price generation, news scheduling, drift modifiers
- `src/components/StockCard.jsx` — stock display cards
- `src/components/TradeControls.jsx` — buy/sell interface
- `src/components/MiniChart.jsx` / `BigChart.jsx` — price charts
- `src/components/NewsTicker.jsx` — news feed display
- `src/components/Timer.jsx` — countdown timer
- `src/hooks/useSoundEngine.js` — sound effects

### State & Progress

- Chapter progress saved to **localStorage** (which chapters completed, current chapter)
- No backend changes needed — story mode runs entirely client-side using the existing `NewsEngine`
- Progress format: `{ currentChapter: 2, completed: [1], badges: ["first-trade", "news-reader"] }`

---

## Hackathon Demo Flow (under 5 minutes)

| Time | What to show |
|------|-------------|
| 0:00–0:30 | Open app, show home screen. "This is Dollar Dash — a game that teaches you finance through a story." |
| 0:30–2:30 | Play through Chapter 1 live. Show Dollar Guy, the lesson, the guided trade, the results. Quick peek at Chapter 2/3 setup to show depth. |
| 2:30–4:00 | Host a multiplayer game, have 2-3 people join on phones. 60-second competitive round. Show live leaderboard. |
| 4:00–5:00 | Show results. Wrap: "Story mode teaches the concepts, multiplayer lets you compete. More chapters planned for bonds, crypto, budgeting..." |

---

## Design Principles

1. **Game first, lecture never.** Every concept is taught through interaction, not reading. If Dollar Guy talks for more than 5 bubbles in a row, something is wrong.
2. **Progressive disclosure.** Start simple (1 stock), add complexity (news, 4 stocks, crashes). Never overwhelm.
3. **Objectives over scores.** "Buy and sell for a profit" is more educational than "maximize returns." The objective frames what the player should focus on.
4. **Hints that fade.** Heavy guidance early, independence later. By Chapter 3 the player should feel competent.
5. **Snappy pacing.** Each chapter should take 2-3 minutes to complete. No phase should drag. Story beats are short. Lessons are interactive. Rounds are timed.
6. **Data-driven chapters.** The chapter config array is the single source of truth. Adding a chapter is adding an object, not writing new components.
7. **Mini-games are the heart.** Each chapter's learn phase is a mini-game, not a slideshow. The player should be tapping, swiping, dragging — never just reading.
8. **Multiplayer is untouched.** Story mode is additive. Zero changes to host, join, player, or server code.
