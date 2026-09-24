import React, { useState, useEffect, useRef } from 'react';
import { 
  GameState, 
  GameStats, 
  CustomerOrder, 
  PizzaState, 
  OrderEvaluation 
} from './types';
import { INITIAL_ORDERS, ASSET_PATHS } from './data/orders';
import { evaluatePizza } from './utils/evaluator';
import { playSound, setSoundMuted, getSoundMuted } from './utils/audio';

import { TitleScreen } from './components/TitleScreen';
import { HeaderHUD } from './components/HeaderHUD';
import { CustomerStation } from './components/CustomerStation';
import { KitchenStation } from './components/KitchenStation';
import { OrderResultModal } from './components/OrderResultModal';
import { GameOverModal } from './components/GameOverModal';
import { TutorialModal } from './components/TutorialModal';

const INITIAL_PIZZA: PizzaState = {
  hasSauce: false,
  sauceAmount: 0,
  hasCheese: false,
  cheeseAmount: 0,
  toppings: [],
  bakeState: 'raw',
  bakeProgress: 0,
  slices: 0,
};

const DEFAULT_TARGET_ORDERS = 4;

export default function App() {
  // Navigation & Game State
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);
  const [soundMuted, setSoundMutedState] = useState<boolean>(false);

  // Career stats in localStorage
  const [careerSold, setCareerSold] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('gp_career_sold') || '0');
    } catch {
      return 0;
    }
  });
  const [careerRevenue, setCareerRevenue] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('gp_career_revenue') || '0');
    } catch {
      return 0;
    }
  });

  // Current Shift & Game Stats
  const [stats, setStats] = useState<GameStats>({
    day: 1,
    money: 0,
    score: 0,
    ordersCompletedToday: 0,
    targetOrdersToday: DEFAULT_TARGET_ORDERS,
    strikes: 0,
    maxStrikes: 3,
    totalPizzasSold: 0,
    totalRevenue: 0,
  });

  // Active Customer & Order Management
  const [orderQueue, setOrderQueue] = useState<CustomerOrder[]>(INITIAL_ORDERS);
  const [currentOrderIndex, setCurrentOrderIndex] = useState<number>(0);
  const currentOrder = orderQueue[currentOrderIndex % orderQueue.length] || INITIAL_ORDERS[0];

  // Active Customer Patience Timer
  const [timeRemaining, setTimeRemaining] = useState<number>(currentOrder.patienceSeconds);
  const timerRef = useRef<number | null>(null);

  // Workbench Pizza State
  const [pizza, setPizza] = useState<PizzaState>(INITIAL_PIZZA);

  // Last Order Evaluation for Feedback Modal
  const [lastEvaluation, setLastEvaluation] = useState<OrderEvaluation | null>(null);

  // Start new customer order: reset workbench & timer
  const setupCustomerOrder = (order: CustomerOrder) => {
    setTimeRemaining(order.patienceSeconds);
    setPizza(INITIAL_PIZZA);
  };

  // Timer countdown loop when in PLAYING state
  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Customer walked away out of impatience
            handleCustomerImpatience();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, currentOrderIndex, stats.strikes]);

  // Handle when customer runs out of patience
  const handleCustomerImpatience = () => {
    playSound.lose();
    const newStrikes = stats.strikes + 1;
    const isGameOver = newStrikes >= stats.maxStrikes;

    setStats((prev) => ({
      ...prev,
      strikes: newStrikes,
    }));

    if (isGameOver) {
      setGameState('GAME_OVER');
    } else {
      // Proceed to next customer with strike warning
      const nextIdx = currentOrderIndex + 1;
      setCurrentOrderIndex(nextIdx);
      const nextOrder = orderQueue[nextIdx % orderQueue.length];
      setupCustomerOrder(nextOrder);
    }
  };

  // Start Game from Title
  const handleStartGame = () => {
    // Shuffle orders for variety
    const shuffled = [...INITIAL_ORDERS].sort(() => Math.random() - 0.5);
    setOrderQueue(shuffled);
    setCurrentOrderIndex(0);

    setStats({
      day: 1,
      money: 0,
      score: 0,
      ordersCompletedToday: 0,
      targetOrdersToday: DEFAULT_TARGET_ORDERS,
      strikes: 0,
      maxStrikes: 3,
      totalPizzasSold: 0,
      totalRevenue: 0,
    });

    setupCustomerOrder(shuffled[0]);
    setGameState('PLAYING');
  };

  // Serve Pizza to Customer
  const handleServePizza = () => {
    const timeRatio = Math.max(0, timeRemaining / currentOrder.patienceSeconds);
    const evaluation = evaluatePizza(currentOrder, pizza, timeRatio);
    setLastEvaluation(evaluation);

    if (evaluation.isSuccess) {
      playSound.cash();
    } else {
      playSound.lose();
    }

    // Update stats
    setStats((prev) => {
      const nextOrdersCount = evaluation.isSuccess ? prev.ordersCompletedToday + 1 : prev.ordersCompletedToday;
      const nextStrikes = evaluation.isSuccess ? prev.strikes : prev.strikes + 1;
      const nextMoney = prev.money + evaluation.totalMoney;
      const nextSold = prev.totalPizzasSold + (evaluation.isSuccess ? 1 : 0);
      const nextRevenue = prev.totalRevenue + evaluation.totalMoney;

      // Update career stats
      try {
        localStorage.setItem('gp_career_sold', String(careerSold + (evaluation.isSuccess ? 1 : 0)));
        localStorage.setItem('gp_career_revenue', String(careerRevenue + evaluation.totalMoney));
        setCareerSold((c) => c + (evaluation.isSuccess ? 1 : 0));
        setCareerRevenue((r) => r + evaluation.totalMoney);
      } catch {
        // ignore storage errors
      }

      return {
        ...prev,
        money: nextMoney,
        score: prev.score + evaluation.accuracyPercent * 10,
        ordersCompletedToday: nextOrdersCount,
        strikes: nextStrikes,
        totalPizzasSold: nextSold,
        totalRevenue: nextRevenue,
      };
    });

    setGameState('ORDER_RESULT');
  };

  // Continue after viewing order evaluation receipt
  const handleContinueAfterOrder = () => {
    if (!lastEvaluation) return;

    // 1. Check game over condition: 3 strikes
    if (stats.strikes >= stats.maxStrikes) {
      playSound.lose();
      setGameState('GAME_OVER');
      return;
    }

    // 2. Check victory condition: completed day's target orders
    if (stats.ordersCompletedToday >= stats.targetOrdersToday) {
      playSound.win();
      setGameState('DAY_VICTORY');
      return;
    }

    // 3. Move to next customer
    const nextIdx = currentOrderIndex + 1;
    setCurrentOrderIndex(nextIdx);
    const nextOrder = orderQueue[nextIdx % orderQueue.length];
    setupCustomerOrder(nextOrder);
    setGameState('PLAYING');
  };

  // Continue to Next Day (Shift Victory)
  const handleNextDay = () => {
    playSound.click();
    const nextDay = stats.day + 1;
    const nextTarget = Math.min(8, DEFAULT_TARGET_ORDERS + nextDay - 1);

    // Re-shuffle order queue
    const shuffled = [...INITIAL_ORDERS].sort(() => Math.random() - 0.5);
    setOrderQueue(shuffled);
    setCurrentOrderIndex(0);

    setStats((prev) => ({
      ...prev,
      day: nextDay,
      ordersCompletedToday: 0,
      targetOrdersToday: nextTarget,
      strikes: 0,
    }));

    setupCustomerOrder(shuffled[0]);
    setGameState('PLAYING');
  };

  // Restart Game
  const handleRestart = () => {
    playSound.click();
    handleStartGame();
  };

  return (
    <div className="min-h-screen bg-amber-950 text-amber-50 flex flex-col font-sans select-none antialiased">
      {/* 1. Title Screen View */}
      {gameState === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenTutorial={() => setIsTutorialOpen(true)}
          soundMuted={soundMuted}
          onToggleSound={() => {
            const next = !soundMuted;
            setSoundMuted(next);
            setSoundMutedState(next);
          }}
          totalPizzasSold={careerSold}
          totalMoneyEarned={careerRevenue}
        />
      )}

      {/* 2. Main Gameplay Hub */}
      {gameState !== 'TITLE' && (
        <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950">
          {/* Top Bar HUD */}
          <HeaderHUD
            stats={stats}
            onOpenTutorial={() => setIsTutorialOpen(true)}
            onRestart={handleRestart}
            soundMuted={soundMuted}
            setSoundMutedState={setSoundMutedState}
          />

          {/* Active Work Area */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-5">
            {/* Customer Order Station (Top) */}
            <CustomerStation
              order={currentOrder}
              timeRemaining={timeRemaining}
              totalTime={currentOrder.patienceSeconds}
            />

            {/* Kitchen Prep & Oven Workbench (Bottom) */}
            <KitchenStation
              pizza={pizza}
              setPizza={setPizza}
              onServePizza={handleServePizza}
              targetSlices={currentOrder.reqSlices}
            />
          </main>
        </div>
      )}

      {/* Modals & Overlays */}
      {/* 1. Order Result Feedback Receipt */}
      {gameState === 'ORDER_RESULT' && lastEvaluation && (
        <OrderResultModal
          order={currentOrder}
          evaluation={lastEvaluation}
          stats={stats}
          onContinue={handleContinueAfterOrder}
        />
      )}

      {/* 2. Victory Modal (Shift Done) */}
      {gameState === 'DAY_VICTORY' && (
        <GameOverModal
          type="VICTORY"
          stats={stats}
          onRestart={handleRestart}
          onNextDay={handleNextDay}
        />
      )}

      {/* 3. Defeat Modal (Game Over) */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          type="DEFEAT"
          stats={stats}
          onRestart={handleRestart}
        />
      )}

      {/* 4. Tutorial & How-To-Play Guide */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
      />
    </div>
  );
}
