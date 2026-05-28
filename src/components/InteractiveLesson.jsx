import FirstBuyGame from "./minigames/FirstBuyGame.jsx";
import HeadlineQuizGame from "./minigames/HeadlineQuizGame.jsx";
import PortfolioBuilderGame from "./minigames/PortfolioBuilderGame.jsx";
import CompoundGrowthGame from "./minigames/CompoundGrowthGame.jsx";
import BudgetBucketsGame from "./minigames/BudgetBucketsGame.jsx";
import TermMatchGame from "./minigames/TermMatchGame.jsx";

const MINI_GAMES = {
  "first-buy": FirstBuyGame,
  "headline-quiz": HeadlineQuizGame,
  "portfolio-builder": PortfolioBuilderGame,
  "compound-growth": CompoundGrowthGame,
  "budget-buckets": BudgetBucketsGame,
  "term-match": TermMatchGame,
};

export default function InteractiveLesson({ miniGame, onComplete }) {
  const GameComponent = MINI_GAMES[miniGame.type];
  if (!GameComponent) return null;
  return <GameComponent config={miniGame.config} onComplete={onComplete} />;
}
