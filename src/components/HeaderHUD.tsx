import React from 'react';
import { GameStats } from '../types';
import { Volume2, VolumeX, HelpCircle, RotateCcw } from 'lucide-react';
import { getSoundMuted, setSoundMuted, playSound } from '../utils/audio';

interface HeaderHUDProps {
  stats: GameStats;
  onOpenTutorial: () => void;
  onRestart: () => void;
  soundMuted: boolean;
  setSoundMutedState: (muted: boolean) => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  stats,
  onOpenTutorial,
  onRestart,
  soundMuted,
  setSoundMutedState,
}) => {
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    setSoundMutedState(next);
    if (!next) {
      playSound.click();
    }
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3.5 bg-amber-950/90 border-b border-amber-800/80 backdrop-blur-md sticky top-0 z-40 text-amber-100">
      {/* Zone 1: Brand single text element wordmark */}
      <div className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-bold tracking-tight text-amber-300 font-display">
          Good Pizza
        </span>
        <span className="hidden sm:inline text-xs text-amber-400/80 font-medium">
          · Kedai Pizza Impian
        </span>
      </div>

      {/* Zone 2: Clean unboxed metadata with typographic separators */}
      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-medium text-amber-200">
        <span className="whitespace-nowrap">
          Hari <strong className="text-amber-100 tabular-nums">{stats.day}</strong>
        </span>
        <span aria-hidden="true" className="text-amber-600">·</span>
        <span className="whitespace-nowrap">
          Target: <strong className="text-amber-100 tabular-nums">{stats.ordersCompletedToday}/{stats.targetOrdersToday}</strong>
        </span>
        <span aria-hidden="true" className="text-amber-600">·</span>
        <span className="whitespace-nowrap text-emerald-300">
          Kas: <strong className="font-bold tabular-nums text-emerald-200">${stats.money}</strong>
        </span>
        <span aria-hidden="true" className="text-amber-600">·</span>
        <span className="whitespace-nowrap text-rose-300">
          Teguran: <strong className="font-bold tabular-nums text-rose-200">{stats.strikes}/{stats.maxStrikes}</strong>
        </span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleSound}
          title={soundMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 transition-colors"
        >
          {soundMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={onOpenTutorial}
          title="Panduan Bermain"
          className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <HelpCircle className="w-4 h-4 text-amber-300" />
          <span className="hidden md:inline">Bantuan</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          title="Restart Game"
          className="px-3 py-1.5 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-700/60 text-amber-200 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Ulang</span>
        </button>
      </div>
    </header>
  );
};
