import React, { useState, useEffect, useRef } from 'react';
import { PizzaState, ToppingType, PlacedTopping } from '../types';
import { PizzaCanvas } from './PizzaCanvas';
import { TOPPING_INFO, ASSET_PATHS } from '../data/orders';
import { playSound } from '../utils/audio';
import { 
  Flame, 
  Scissors, 
  Trash2, 
  CheckCircle, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  ChefHat
} from 'lucide-react';

interface KitchenStationProps {
  pizza: PizzaState;
  setPizza: React.Dispatch<React.SetStateAction<PizzaState>>;
  onServePizza: () => void;
  targetSlices: number;
}

export const KitchenStation: React.FC<KitchenStationProps> = ({
  pizza,
  setPizza,
  onServePizza,
  targetSlices,
}) => {
  const [selectedTool, setSelectedTool] = useState<'none' | 'sauce' | 'cheese' | ToppingType>('sauce');
  const [isBaking, setIsBaking] = useState<boolean>(false);
  const bakeIntervalRef = useRef<number | null>(null);

  // Keyboard shortcuts 1-7 for ingredients
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isBaking) return;
      if (e.key === '1') setSelectedTool('sauce');
      if (e.key === '2') setSelectedTool('cheese');
      if (e.key === '3') setSelectedTool('pepperoni');
      if (e.key === '4') setSelectedTool('mushroom');
      if (e.key === '5') setSelectedTool('sausage');
      if (e.key === '6') setSelectedTool('onion');
      if (e.key === '7') setSelectedTool('pepper');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBaking]);

  // Baking timer loop
  useEffect(() => {
    if (isBaking) {
      playSound.ovenStart();
      bakeIntervalRef.current = window.setInterval(() => {
        setPizza((prev) => {
          const nextProgress = prev.bakeProgress + 3.5;
          let nextState = prev.bakeState;

          if (nextProgress >= 100) {
            nextState = 'burnt';
          } else if (nextProgress >= 65) {
            if (nextState !== 'perfect') {
              playSound.ovenBell();
            }
            nextState = 'perfect';
          } else if (nextProgress >= 30) {
            nextState = 'baking';
          }

          return {
            ...prev,
            bakeProgress: nextProgress,
            bakeState: nextState,
          };
        });
      }, 200);
    } else {
      if (bakeIntervalRef.current) {
        clearInterval(bakeIntervalRef.current);
        bakeIntervalRef.current = null;
      }
    }

    return () => {
      if (bakeIntervalRef.current) {
        clearInterval(bakeIntervalRef.current);
      }
    };
  }, [isBaking, setPizza]);

  // Handle clicking on pizza surface
  const handlePizzaClick = (x: number, y: number) => {
    if (isBaking) return;

    if (selectedTool === 'sauce') {
      if (!pizza.hasSauce) {
        playSound.sauce();
        setPizza((prev) => ({ ...prev, hasSauce: true, sauceAmount: 100 }));
      }
      return;
    }

    if (selectedTool === 'cheese') {
      if (!pizza.hasCheese) {
        playSound.cheese();
        setPizza((prev) => ({ ...prev, hasCheese: true, cheeseAmount: 100 }));
      }
      return;
    }

    // Placing a topping
    if (['pepperoni', 'mushroom', 'sausage', 'onion', 'pepper'].includes(selectedTool)) {
      const toppingType = selectedTool as ToppingType;
      playSound.topping();
      const newTopping: PlacedTopping = {
        id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: toppingType,
        x,
        y,
        rotation: Math.round(Math.random() * 360),
      };
      setPizza((prev) => ({
        ...prev,
        toppings: [...prev.toppings, newTopping],
      }));
    }
  };

  // Quick auto-distribute helper for casual play
  const handleQuickScatter = (toppingType: ToppingType) => {
    if (isBaking) return;
    playSound.topping();
    const presetPositions = [
      { x: -18, y: -18 },
      { x: 18, y: -18 },
      { x: 22, y: 12 },
      { x: -22, y: 12 },
      { x: 0, y: -24 },
      { x: 0, y: 22 },
      { x: 0, y: 0 },
    ];

    const newItems: PlacedTopping[] = presetPositions.map((pos) => ({
      id: `t_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: toppingType,
      x: pos.x + (Math.random() * 6 - 3),
      y: pos.y + (Math.random() * 6 - 3),
      rotation: Math.round(Math.random() * 360),
    }));

    setPizza((prev) => ({
      ...prev,
      toppings: [...prev.toppings, ...newItems],
    }));
  };

  // Cut pizza
  const handleCutPizza = (slices: number) => {
    if (isBaking) return;
    playSound.slice();
    setPizza((prev) => ({
      ...prev,
      slices,
    }));
  };

  // Reset current pizza
  const handleResetPizza = () => {
    playSound.trash();
    setPizza({
      hasSauce: false,
      sauceAmount: 0,
      hasCheese: false,
      cheeseAmount: 0,
      toppings: [],
      bakeState: 'raw',
      bakeProgress: 0,
      slices: 0,
    });
    setIsBaking(false);
    setSelectedTool('sauce');
  };

  // Count toppings on current pizza
  const toppingCounts: Record<ToppingType, number> = {
    pepperoni: 0,
    mushroom: 0,
    sausage: 0,
    onion: 0,
    pepper: 0,
  };
  pizza.toppings.forEach((t) => {
    toppingCounts[t.type] = (toppingCounts[t.type] || 0) + 1;
  });

  // Dynamic Chef Advice based on state
  let chefMessage = 'Oleskan saus tomat kaya rempah ke atas adonan!';
  if (pizza.hasSauce && !pizza.hasCheese) {
    chefMessage = 'Bagus! Sekarang taburkan keju mozzarella gurih di atas saus.';
  } else if (pizza.hasCheese && pizza.toppings.length === 0) {
    chefMessage = 'Sekarang tambahkan topping pesanan pelanggan dengan klik pada pizza.';
  } else if (pizza.toppings.length > 0 && pizza.bakeState === 'raw') {
    chefMessage = 'Topping sudah tertata rapi! Masukkan ke oven untuk memanggang.';
  } else if (isBaking) {
    if (pizza.bakeState === 'perfect') {
      chefMessage = '⭐ AROMA WANGI! Pizza sudah matang keemasan, keluarkan SEGERA!';
    } else if (pizza.bakeState === 'burnt') {
      chefMessage = '🔥 Aduh! Pizzanya terlalu lama di oven dan gosong!';
    } else {
      chefMessage = 'Oven sedang bekerja... tunggu hingga warna keemasan sempurna!';
    }
  } else if (pizza.bakeState === 'perfect') {
    if (pizza.slices === 0) {
      chefMessage = `Matang sempurna! Jangan lupa potong menjadi ${targetSlices} slice sebelum disajikan!`;
    } else {
      chefMessage = 'Hebat! Pizza siap diantar. Klik "Sajikan Pizza" sekarang!';
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* LEFT COLUMN: Ingredient Containers & Pantry (4 cols) */}
      <div className="lg:col-span-3 space-y-4">
        {/* Base Ingredients: Sauce & Cheese */}
        <div className="bg-amber-900/60 border border-amber-800/60 rounded-2xl p-4 shadow-lg backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-amber-200">1. Bahan Dasar</h4>
            <span className="text-[11px] text-amber-400 font-medium">Klik untuk memilih</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Tomato Sauce Button */}
            <button
              type="button"
              disabled={isBaking}
              onClick={() => {
                setSelectedTool('sauce');
                if (!pizza.hasSauce) {
                  playSound.sauce();
                  setPizza((prev) => ({ ...prev, hasSauce: true, sauceAmount: 100 }));
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                selectedTool === 'sauce'
                  ? 'bg-rose-950/80 border-rose-500 shadow-md ring-2 ring-rose-500/40'
                  : 'bg-amber-950/70 border-amber-800/70 hover:bg-amber-900/70 text-amber-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🍅</span>
                <span className="text-[10px] font-mono bg-amber-900/80 text-amber-300 px-1.5 py-0.5 rounded">
                  [1]
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-amber-100">Saus Tomat</div>
                <div className="text-[10px] text-amber-300/80">
                  {pizza.hasSauce ? '✓ Sudah Dioles' : 'Belum Ada'}
                </div>
              </div>
            </button>

            {/* Mozzarella Cheese Button */}
            <button
              type="button"
              disabled={isBaking}
              onClick={() => {
                setSelectedTool('cheese');
                if (!pizza.hasCheese) {
                  playSound.cheese();
                  setPizza((prev) => ({ ...prev, hasCheese: true, cheeseAmount: 100 }));
                }
              }}
              className={`p-3 rounded-xl border text-left transition-all duration-150 flex flex-col justify-between ${
                selectedTool === 'cheese'
                  ? 'bg-yellow-950/80 border-yellow-400 shadow-md ring-2 ring-yellow-400/40'
                  : 'bg-amber-950/70 border-amber-800/70 hover:bg-amber-900/70 text-amber-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">🧀</span>
                <span className="text-[10px] font-mono bg-amber-900/80 text-amber-300 px-1.5 py-0.5 rounded">
                  [2]
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xs font-bold text-amber-100">Keju Mozzarella</div>
                <div className="text-[10px] text-amber-300/80">
                  {pizza.hasCheese ? '✓ Sudah Ditabur' : 'Belum Ada'}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Topping Containers */}
        <div className="bg-amber-900/60 border border-amber-800/60 rounded-2xl p-4 shadow-lg backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-amber-200">2. Pilihan Topping</h4>
            <span className="text-[11px] text-amber-400 font-medium">Klik Pizza utk Letak</span>
          </div>

          <div className="space-y-2">
            {(Object.keys(TOPPING_INFO) as ToppingType[]).map((type, idx) => {
              const info = TOPPING_INFO[type];
              const isSelected = selectedTool === type;
              const count = toppingCounts[type];

              return (
                <div
                  key={type}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-amber-800/90 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                      : 'bg-amber-950/60 border-amber-800/50 hover:bg-amber-900/50'
                  }`}
                >
                  <button
                    type="button"
                    disabled={isBaking}
                    onClick={() => {
                      setSelectedTool(type);
                      playSound.click();
                    }}
                    className="flex-1 flex items-center gap-2.5 text-left"
                  >
                    <span className="text-2xl">{info.iconLabel}</span>
                    <div>
                      <div className="text-xs font-bold text-amber-100 flex items-center gap-1.5">
                        <span>{info.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-normal">
                          [{idx + 3}]
                        </span>
                      </div>
                      <div className="text-[10px] text-amber-300/80 tabular-nums">
                        Di pizza: <span className="font-bold text-amber-200">{count} buah</span>
                      </div>
                    </div>
                  </button>

                  {/* Fast Sprinkle shortcut */}
                  <button
                    type="button"
                    title={`Tabur ${info.name} cepat`}
                    disabled={isBaking}
                    onClick={() => handleQuickScatter(type)}
                    className="px-2 py-1 bg-amber-950/80 hover:bg-amber-800 border border-amber-700/60 rounded-lg text-[10px] font-semibold text-amber-200 hover:text-white transition-colors"
                  >
                    + Tabur 7x
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Wooden Prep Table & Interactive Pizza (5 cols) */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <div className="w-full bg-amber-950/50 border border-amber-800/60 rounded-3xl p-4 md:p-6 shadow-2xl relative flex flex-col items-center">
          {/* Tool mode indicator pill */}
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-amber-200 bg-amber-900/80 px-3 py-1.5 rounded-full border border-amber-700/60">
            <span>Alat Aktif:</span>
            <span className="font-bold text-amber-300 uppercase tracking-wider">
              {selectedTool === 'sauce' && '🍅 Sendok Saus Tomat'}
              {selectedTool === 'cheese' && '🧀 Parutan Keju'}
              {selectedTool === 'pepperoni' && '🍕 Pepperoni'}
              {selectedTool === 'mushroom' && '🍄 Jamur'}
              {selectedTool === 'sausage' && '🌭 Sosis'}
              {selectedTool === 'onion' && '🧅 Bawang'}
              {selectedTool === 'pepper' && '🫑 Paprika'}
            </span>
          </div>

          {/* Interactive Pizza Visual Surface */}
          <PizzaCanvas
            pizza={pizza}
            selectedTool={selectedTool}
            onPizzaClick={handlePizzaClick}
            isBaking={isBaking}
          />

          {/* Pizza stats overview */}
          <div className="w-full mt-4 pt-3 border-t border-amber-800/60 flex items-center justify-between text-xs text-amber-300/90">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200">Total Topping:</span>
              <span className="font-bold tabular-nums text-amber-100">{pizza.toppings.length} pcs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-amber-200">Potongan:</span>
              <span className="font-bold tabular-nums text-amber-100">
                {pizza.slices === 0 ? 'Belum dipotong' : `${pizza.slices} Slice`}
              </span>
            </div>
          </div>
        </div>

        {/* Chef Comment Dialogue Card */}
        <div className="w-full mt-4 bg-amber-900/60 border border-amber-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 shadow-md">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-amber-600/60 bg-amber-950 shrink-0">
            <img
              src={ASSET_PATHS.chef}
              alt="Chef"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-0.5">
              <ChefHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Chef Mario:</span>
            </div>
            <p className="text-xs text-amber-100 leading-snug">{chefMessage}</p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Oven, Cutter, and Delivery Hub (4 cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* 1. Brick Oven Station */}
        <div className="bg-amber-900/60 border border-amber-800/60 rounded-2xl p-4 shadow-lg backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              <h4 className="text-sm font-bold text-amber-200">3. Oven Pemanggang</h4>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                pizza.bakeState === 'perfect'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 animate-pulse'
                  : pizza.bakeState === 'burnt'
                  ? 'bg-rose-950 text-rose-300 border border-rose-600/60'
                  : pizza.bakeState === 'baking'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/60'
                  : 'bg-amber-950/60 text-amber-400 border border-amber-800'
              }`}
            >
              {pizza.bakeState === 'raw' && 'Mentah'}
              {pizza.bakeState === 'baking' && 'Memanggang...'}
              {pizza.bakeState === 'perfect' && 'Matang Sempurna! ⭐'}
              {pizza.bakeState === 'burnt' && 'Gosong! 🔥'}
            </span>
          </div>

          {/* Oven Progress Bar */}
          <div className="space-y-1 mb-4">
            <div className="flex justify-between text-[11px] text-amber-300/80 font-medium">
              <span>Suhu & Kematangan</span>
              <span className="tabular-nums font-bold text-amber-200">
                {Math.min(100, Math.round(pizza.bakeProgress))}%
              </span>
            </div>
            <div className="w-full bg-amber-950 h-3 rounded-full overflow-hidden border border-amber-800 relative">
              <div
                className={`h-full transition-all duration-200 ${
                  pizza.bakeState === 'burnt'
                    ? 'bg-zinc-800'
                    : pizza.bakeState === 'perfect'
                    ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                    : 'bg-gradient-to-r from-amber-600 to-orange-500'
                }`}
                style={{ width: `${Math.min(100, pizza.bakeProgress)}%` }}
              />
              {/* Target zone indicator */}
              <div className="absolute top-0 bottom-0 left-[65%] w-[25%] bg-emerald-400/20 border-x border-emerald-400/40 pointer-events-none" />
            </div>
            <div className="flex justify-between text-[9px] text-amber-400/60 px-0.5">
              <span>0% Mentah</span>
              <span className="text-emerald-400 font-bold">65-90% Matang Sempurna</span>
              <span className="text-rose-400 font-bold">&gt;95% Gosong</span>
            </div>
          </div>

          {/* Bake / Pull out Button */}
          {!isBaking ? (
            <button
              type="button"
              disabled={pizza.bakeState === 'burnt'}
              onClick={() => setIsBaking(true)}
              className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
            >
              <Flame className="w-4 h-4" />
              <span>{pizza.bakeState === 'perfect' ? 'Panggang Lagi (Awas Gosong!)' : 'Masukkan ke Oven'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsBaking(false)}
              className={`w-full py-2.5 px-4 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98] ${
                pizza.bakeState === 'perfect'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-bounce ring-4 ring-emerald-500/40'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Keluarkan dari Oven!</span>
            </button>
          )}
        </div>

        {/* 2. Pizza Cutter Station */}
        <div className="bg-amber-900/60 border border-amber-800/60 rounded-2xl p-4 shadow-lg backdrop-blur-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-300" />
              <h4 className="text-sm font-bold text-amber-200">4. Pemotong Pizza</h4>
            </div>
            <span className="text-[11px] text-amber-400">
              Permintaan: {targetSlices} slice
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isBaking}
              onClick={() => handleCutPizza(4)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                pizza.slices === 4
                  ? 'bg-amber-800 border-amber-400 text-amber-100 ring-2 ring-amber-400/40'
                  : 'bg-amber-950/70 border-amber-800 hover:bg-amber-900/70 text-amber-200'
              }`}
            >
              Potong 4 Slice
            </button>

            <button
              type="button"
              disabled={isBaking}
              onClick={() => handleCutPizza(6)}
              className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                pizza.slices === 6
                  ? 'bg-amber-800 border-amber-400 text-amber-100 ring-2 ring-amber-400/40'
                  : 'bg-amber-950/70 border-amber-800 hover:bg-amber-900/70 text-amber-200'
              }`}
            >
              Potong 6 Slice
            </button>
          </div>
        </div>

        {/* 3. Action Buttons: Serve Pizza & Trash Reset */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            disabled={isBaking}
            onClick={onServePizza}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 text-base active:scale-[0.98] border border-emerald-400/50 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <span>Sajikan Pizza ke Pelanggan!</span>
          </button>

          <button
            type="button"
            disabled={isBaking}
            onClick={handleResetPizza}
            className="w-full py-2 px-3 bg-amber-950/80 hover:bg-rose-950/70 text-amber-300/80 hover:text-rose-300 border border-amber-800/60 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Buang & Ganti Adonan Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
