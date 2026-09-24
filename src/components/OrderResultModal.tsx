import React from 'react';
import { CustomerOrder, OrderEvaluation, GameStats } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Coins, Award, ArrowRight } from 'lucide-react';

interface OrderResultModalProps {
  order: CustomerOrder;
  evaluation: OrderEvaluation;
  stats: GameStats;
  onContinue: () => void;
}

export const OrderResultModal: React.FC<OrderResultModalProps> = ({
  order,
  evaluation,
  stats,
  onContinue,
}) => {
  const isSuccess = evaluation.isSuccess;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-amber-950 border-2 border-amber-700 rounded-3xl p-6 shadow-2xl text-amber-100 flex flex-col space-y-4">
        {/* Customer Header & Avatar */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-amber-800/80">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-600 bg-amber-900 shrink-0">
            <img
              src={order.avatar}
              alt={order.customerName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-amber-200">{order.customerName}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                isSuccess ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'bg-rose-950 text-rose-300 border border-rose-600'
              }`}>
                {isSuccess ? 'Puas 😊' : 'Kecewa 😠'}
              </span>
            </div>
            <p className="text-xs text-amber-300/80 italic mt-0.5">
              &ldquo;{evaluation.feedbackComment}&rdquo;
            </p>
          </div>
        </div>

        {/* Score & Rating Badge */}
        <div className="bg-amber-900/60 border border-amber-800/80 rounded-2xl p-4 text-center">
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Tingkat Ketepatan Pesanan
          </span>
          <div className="text-4xl font-extrabold text-amber-200 tabular-nums my-1 font-display">
            {evaluation.accuracyPercent}%
          </div>
          <div className="text-sm font-bold text-amber-400">
            {evaluation.feedbackTitle}
          </div>
        </div>

        {/* Breakdown Items */}
        <div className="space-y-1.5 text-xs bg-amber-950/70 p-3 rounded-xl border border-amber-900">
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Saus Tomat:</span>
            <span className="font-semibold text-amber-100">{evaluation.sauceScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Keju Mozzarella:</span>
            <span className="font-semibold text-amber-100">{evaluation.cheeseScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Topping:</span>
            <span className="font-semibold text-amber-100">{evaluation.toppingsScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Kematangan Oven:</span>
            <span className="font-semibold text-amber-100">{evaluation.bakeScore}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-amber-300">Ketepatan Potongan:</span>
            <span className="font-semibold text-amber-100">{evaluation.sliceScore}%</span>
          </div>
        </div>

        {/* Financial Earnings Receipt */}
        <div className="p-3 bg-amber-900/40 rounded-xl border border-amber-800/60 space-y-1 text-xs">
          <div className="flex items-center justify-between text-amber-300">
            <span>Harga Dasar:</span>
            <span className="tabular-nums font-semibold">+${evaluation.baseReward}</span>
          </div>
          {evaluation.tip > 0 && (
            <div className="flex items-center justify-between text-emerald-400">
              <span>Tips Kecepatan & Kerapian:</span>
              <span className="tabular-nums font-semibold">+${evaluation.tip}</span>
            </div>
          )}
          {evaluation.penalty > 0 && (
            <div className="flex items-center justify-between text-rose-400">
              <span>Potongan Kesalahan:</span>
              <span className="tabular-nums font-semibold">-${evaluation.penalty}</span>
            </div>
          )}
          <div className="pt-2 border-t border-amber-800 flex items-center justify-between text-sm font-bold text-amber-200">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Pendapatan Diterima:</span>
            </span>
            <span className="text-base text-emerald-300 tabular-nums">
              +${evaluation.totalMoney}
            </span>
          </div>
        </div>

        {/* Warning if order failed */}
        {!isSuccess && (
          <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-xl flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Pesanan dianggap gagal! Kamu mendapat 1 teguran ({stats.strikes}/{stats.maxStrikes}).
            </span>
          </div>
        )}

        {/* Next Button */}
        <button
          type="button"
          onClick={onContinue}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] cursor-pointer"
        >
          <span>Lanjut ke Pelanggan Berikutnya</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
