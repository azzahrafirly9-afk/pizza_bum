import React from 'react';
import { GameStats } from '../types';
import { Trophy, Frown, RotateCcw, ArrowRight, Star, DollarSign, Pizza } from 'lucide-react';
import { ASSET_PATHS } from '../data/orders';

interface GameOverModalProps {
  type: 'VICTORY' | 'DEFEAT';
  stats: GameStats;
  onRestart: () => void;
  onNextDay?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  type,
  stats,
  onRestart,
  onNextDay,
}) => {
  const isVictory = type === 'VICTORY';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-amber-950 border-2 border-amber-600 rounded-3xl p-6 md:p-8 shadow-2xl text-amber-100 flex flex-col items-center text-center">
        {/* Decorative Badge Icon */}
        <div className="mb-4">
          {isVictory ? (
            <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400 flex items-center justify-center text-rose-300 shadow-xl">
              <Frown className="w-10 h-10" />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-200 font-display mb-1">
          {isVictory ? 'Shift Selesai! Kamu Menang!' : 'Kedai Tutup Sementara!'}
        </h2>
        <p className="text-sm text-amber-300/80 mb-5">
          {isVictory
            ? `Luar biasa! Target pesanan Hari ke-${stats.day} berhasil dipenuhi dengan sukses!`
            : `Terlalu banyak pesanan yang salah atau pelanggan yang kecewa (${stats.strikes}/${stats.maxStrikes} teguran). Jangan menyerah!`}
        </p>

        {/* Stars for Victory */}
        {isVictory && (
          <div className="flex items-center gap-2 mb-5">
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            <Star className="w-10 h-10 text-amber-400 fill-amber-400 -translate-y-1" />
            <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
          </div>
        )}

        {/* Summary Card */}
        <div className="w-full bg-amber-900/60 border border-amber-800/80 rounded-2xl p-4 mb-6 space-y-2.5 text-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-amber-300 flex items-center gap-1.5">
              <Pizza className="w-4 h-4 text-amber-400" />
              <span>Pizza Terjual Hari Ini:</span>
            </span>
            <span className="font-bold text-amber-100 tabular-nums">
              {stats.ordersCompletedToday} Pesanan
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-amber-300 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Total Kas Terkumpul:</span>
            </span>
            <span className="font-bold text-emerald-300 tabular-nums text-sm">
              ${stats.money}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-amber-300">Total Karier Pizza:</span>
            <span className="font-bold text-amber-100 tabular-nums">
              {stats.totalPizzasSold} Pizza
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-amber-300">Teguran Pelanggan:</span>
            <span className={`font-bold tabular-nums ${stats.strikes > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {stats.strikes} dari {stats.maxStrikes}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          {isVictory && onNextDay && (
            <button
              type="button"
              onClick={onNextDay}
              className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] cursor-pointer"
            >
              <span>Lanjut ke Hari Berikutnya (Hari {stats.day + 1})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onRestart}
            className={`w-full py-3 px-4 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] cursor-pointer ${
              isVictory
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-200 border border-amber-700/80'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Ulang Permainan (Restart)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
