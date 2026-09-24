import React from 'react';
import { ASSET_PATHS } from '../data/orders';
import { Play, HelpCircle, Volume2, VolumeX, Sparkles, Award } from 'lucide-react';
import { playSound } from '../utils/audio';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenTutorial: () => void;
  soundMuted: boolean;
  onToggleSound: () => void;
  totalPizzasSold: number;
  totalMoneyEarned: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenTutorial,
  soundMuted,
  onToggleSound,
  totalPizzasSold,
  totalMoneyEarned,
}) => {
  const handleStart = () => {
    playSound.click();
    onStartGame();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden bg-amber-950">
      {/* Pizzeria Background Image with Warm Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={ASSET_PATHS.shopInterior}
          alt="Good Pizza Restaurant"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] contrast-105"
          onError={(e) => {
            // Fallback gradient
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-950 via-amber-950/70 to-black/60" />
      </div>

      {/* Sound Toggle (Top Right) */}
      <div className="absolute top-5 right-5 z-20">
        <button
          type="button"
          onClick={onToggleSound}
          title={soundMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          className="p-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/80 text-amber-200 transition-colors shadow-lg"
        >
          {soundMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Content Box */}
      <div className="relative z-10 w-full max-w-xl text-center flex flex-col items-center">
        {/* Chef Avatar Badge */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-amber-400 shadow-2xl bg-amber-900">
            <img
              src={ASSET_PATHS.chef}
              alt="Chef Mario"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-md whitespace-nowrap">
            Chef Mario
          </div>
        </div>

        {/* Title Lockup */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-amber-200 tracking-tight font-display drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mt-2">
          Good Pizza
        </h1>
        <p className="text-base md:text-lg text-amber-300/90 font-medium max-w-md mx-auto mt-2 leading-relaxed">
          Racik adonan, tambahkan saus & topping lezat, lalu panggang hingga keemasan untuk pelangganmu!
        </p>

        {/* Action Buttons */}
        <div className="w-full max-w-xs space-y-3 mt-8">
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-4 px-6 bg-amber-500 hover:bg-amber-400 text-amber-950 font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-lg active:scale-[0.98] border-2 border-amber-300 cursor-pointer animate-bubble"
          >
            <Play className="w-6 h-6 fill-amber-950" />
            <span>Mulai Game</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playSound.click();
              onOpenTutorial();
            }}
            className="w-full py-3 px-5 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/80 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer shadow-md"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Cara Bermain</span>
          </button>
        </div>

        {/* Career Record Badge */}
        {(totalPizzasSold > 0 || totalMoneyEarned > 0) && (
          <div className="mt-8 px-4 py-2 bg-amber-950/60 border border-amber-800/80 rounded-2xl flex items-center gap-4 text-xs text-amber-300/80">
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Rekor Karier:</span>
            </span>
            <span className="tabular-nums">
              <strong className="text-amber-100">{totalPizzasSold}</strong> pizza terjual
            </span>
            <span className="text-amber-600">·</span>
            <span className="tabular-nums text-emerald-300">
              Total <strong className="text-emerald-200 font-bold">${totalMoneyEarned}</strong>
            </span>
          </div>
        )}

        {/* Feature Highlights Footer */}
        <div className="mt-10 flex items-center justify-center gap-4 text-[11px] text-amber-400/60 flex-wrap">
          <span>🍕 Adonan Segar</span>
          <span>·</span>
          <span>🍅 Saus Tomat & Keju</span>
          <span>·</span>
          <span>🍄 5 Pilihan Topping</span>
          <span>·</span>
          <span>🔥 Oven Pembakaran 2D</span>
        </div>
      </div>
    </div>
  );
};
