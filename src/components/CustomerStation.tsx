import React, { useState } from 'react';
import { CustomerOrder } from '../types';
import { Clock, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { TOPPING_INFO } from '../data/orders';

interface CustomerStationProps {
  order: CustomerOrder;
  timeRemaining: number;
  totalTime: number;
}

export const CustomerStation: React.FC<CustomerStationProps> = ({
  order,
  timeRemaining,
  totalTime,
}) => {
  const [showNoteDetails, setShowNoteDetails] = useState(true);

  const ratio = Math.max(0, timeRemaining / totalTime);
  const percent = Math.round(ratio * 100);

  // Status badge
  let mood = { label: 'Menunggu Sabar', color: 'text-emerald-400', emoji: '😊' };
  if (ratio < 0.3) {
    mood = { label: 'Mulai Kecewa!', color: 'text-rose-400', emoji: '😠' };
  } else if (ratio < 0.6) {
    mood = { label: 'Mulai Lapar...', color: 'text-amber-400', emoji: '🤔' };
  }

  let barColor = 'bg-emerald-500';
  if (ratio < 0.3) {
    barColor = 'bg-rose-500';
  } else if (ratio < 0.6) {
    barColor = 'bg-amber-500';
  }

  return (
    <div className="bg-amber-900/60 border border-amber-800/60 rounded-2xl p-4 md:p-5 backdrop-blur-md text-amber-50 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Customer Avatar */}
        <div className="relative shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-amber-500/50 shadow-md bg-amber-950">
            <img
              src={order.avatar}
              alt={order.customerName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback avatar container
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <span className="absolute -bottom-1 -right-1 text-xl drop-shadow-md bg-amber-950 rounded-full px-1">
            {mood.emoji}
          </span>
        </div>

        {/* Customer Dialogue & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-amber-200 tracking-tight">{order.customerName}</h3>
              <span className="text-xs text-amber-300/80 font-medium">· {order.customerTitle}</span>
            </div>

            {/* Patience Meter HUD */}
            <div className="flex items-center gap-2 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span className="tabular-nums font-semibold text-amber-200">{Math.ceil(timeRemaining)}d</span>
              <span className={`font-semibold ${mood.color}`}>({mood.label})</span>
            </div>
          </div>

          {/* Patience Progress Bar */}
          <div className="w-full bg-amber-950/70 h-2 rounded-full overflow-hidden mb-2.5">
            <div
              className={`h-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Speech Bubble */}
          <div className="relative bg-amber-950/90 border border-amber-700/60 rounded-xl p-3 text-amber-100 text-sm leading-relaxed shadow-inner">
            <div className="font-medium text-amber-100 italic">
              &ldquo;{order.dialogue}&rdquo;
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary Receipt Strip */}
      <div className="mt-3 pt-3 border-t border-amber-800/60">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowNoteDetails(!showNoteDetails)}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tiket Catatan Pesanan</span>
            {showNoteDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <span className="text-xs font-bold text-amber-400 tabular-nums">
            Hadiah Pesanan: ${order.rewardBase} + Tips
          </span>
        </div>

        {showNoteDetails && (
          <div className="mt-2.5 p-2.5 bg-amber-950/60 rounded-xl text-xs flex flex-wrap items-center gap-2 text-amber-200">
            <span className="font-bold text-amber-300">Target Resep:</span>
            <span>{order.hint}</span>
            <span className="text-amber-500">·</span>
            <span className="bg-amber-800/50 px-2 py-0.5 rounded text-amber-200 font-medium">
              Potong {order.reqSlices} Slice
            </span>
            {order.disallowedToppings && order.disallowedToppings.length > 0 && (
              <span className="bg-rose-950/80 text-rose-300 px-2 py-0.5 rounded font-medium">
                Peringatan: Tanpa {order.disallowedToppings.map(t => TOPPING_INFO[t].name).join(', ')}!
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
