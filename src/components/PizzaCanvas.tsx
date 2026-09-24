import React from 'react';
import { PizzaState, ToppingType } from '../types';

interface PizzaCanvasProps {
  pizza: PizzaState;
  selectedTool: 'none' | 'sauce' | 'cheese' | ToppingType;
  onPizzaClick: (xPercent: number, yPercent: number) => void;
  isBaking?: boolean;
}

export const PizzaCanvas: React.FC<PizzaCanvasProps> = ({
  pizza,
  selectedTool,
  onPizzaClick,
  isBaking = false,
}) => {
  const handleBoardClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isBaking) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Check if click is inside the pizza radius (approx 150px out of 190px)
    const dx = clickX - centerX;
    const dy = clickY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = rect.width * 0.42;

    if (dist <= radius) {
      // Calculate normalized percentage coordinates from -40 to 40
      const xPercent = Math.round((dx / radius) * 36);
      const yPercent = Math.round((dy / radius) * 36);
      onPizzaClick(xPercent, yPercent);
    }
  };

  // Dynamic dough colors based on bake state
  let doughFill = '#fcd34d'; // raw-ish pale golden
  let crustFill = '#d97706'; // crust ring
  let cheeseColor = '#fef08a'; // pale mozzarella
  let sauceColor = '#dc2626'; // vibrant tomato

  if (pizza.bakeState === 'baking') {
    doughFill = '#f59e0b';
    crustFill = '#b45309';
    cheeseColor = '#fde047';
    sauceColor = '#b91c1c';
  } else if (pizza.bakeState === 'perfect') {
    doughFill = '#d97706';
    crustFill = '#92400e';
    cheeseColor = '#facc15';
    sauceColor = '#991b1b';
  } else if (pizza.bakeState === 'burnt') {
    doughFill = '#451a03';
    crustFill = '#292524';
    cheeseColor = '#78350f';
    sauceColor = '#450a0a';
  }

  return (
    <div className="relative w-full max-w-[380px] aspect-square mx-auto flex items-center justify-center select-none">
      <svg
        viewBox="0 0 400 400"
        className={`w-full h-full filter drop-shadow-2xl transition-transform duration-200 ${
          isBaking ? 'animate-sizzle' : 'cursor-crosshair active:scale-[0.99]'
        }`}
        onClick={handleBoardClick}
      >
        <defs>
          {/* Wood Board Texture Gradient */}
          <radialGradient id="boardGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#854d0e" />
            <stop offset="90%" stopColor="#713f12" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>

          {/* Pizza Dough Gradient */}
          <radialGradient id="doughGrad" cx="45%" cy="45%" r="50%">
            <stop offset="0%" stopColor={doughFill} />
            <stop offset="85%" stopColor={crustFill} />
            <stop offset="100%" stopColor={crustFill} />
          </radialGradient>

          {/* Cheese Melt Gradient */}
          <radialGradient id="cheeseGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={cheeseColor} />
            <stop offset="80%" stopColor={pizza.bakeState === 'perfect' ? '#eab308' : '#fef9c3'} />
            <stop offset="100%" stopColor={pizza.bakeState === 'perfect' ? '#ca8a04' : '#fef08a'} />
          </radialGradient>

          {/* Burnt overlay */}
          <filter id="crispGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* 1. Wooden Cutting Board / Peel */}
        <circle cx="200" cy="200" r="192" fill="url(#boardGrad)" stroke="#3e2723" strokeWidth="6" />
        {/* Wood grain rings */}
        <circle cx="200" cy="200" r="160" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" strokeDasharray="6 8" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="3" />

        {/* 2. Pizza Dough Base (Crust) */}
        <circle
          cx="200"
          cy="200"
          r="165"
          fill="url(#doughGrad)"
          stroke={crustFill}
          strokeWidth="10"
          filter="url(#crispGlow)"
        />
        {/* Crust blister spots */}
        <circle cx="120" cy="80" r="6" fill="rgba(69, 26, 3, 0.25)" />
        <circle cx="280" cy="90" r="8" fill="rgba(69, 26, 3, 0.2)" />
        <circle cx="330" cy="210" r="7" fill="rgba(69, 26, 3, 0.25)" />
        <circle cx="160" cy="340" r="6" fill="rgba(69, 26, 3, 0.2)" />
        <circle cx="80" cy="250" r="7" fill="rgba(69, 26, 3, 0.25)" />

        {/* 3. Tomato Sauce Layer */}
        {pizza.hasSauce && (
          <g>
            <circle
              cx="200"
              cy="200"
              r="142"
              fill={sauceColor}
              className="transition-all duration-300"
            />
            {/* Swirl spots in sauce */}
            <path
              d="M 170 160 Q 200 140 230 170 T 190 230"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="5"
              opacity="0.3"
            />
            <circle cx="160" cy="180" r="18" fill="#991b1b" opacity="0.4" />
            <circle cx="240" cy="210" r="22" fill="#991b1b" opacity="0.4" />
            <circle cx="190" cy="240" r="15" fill="#991b1b" opacity="0.4" />
          </g>
        )}

        {/* 4. Mozzarella Cheese Layer */}
        {pizza.hasCheese && (
          <g>
            <circle
              cx="200"
              cy="200"
              r="134"
              fill="url(#cheeseGrad)"
              className="transition-all duration-300"
              opacity="0.94"
            />
            {/* Melted Cheese Toast Bubbles */}
            {pizza.bakeState === 'perfect' && (
              <g fill="#a16207" opacity="0.75">
                <circle cx="170" cy="150" r="7" />
                <circle cx="230" cy="165" r="9" />
                <circle cx="195" cy="215" r="8" />
                <circle cx="150" cy="225" r="6" />
                <circle cx="240" cy="240" r="7" />
                <circle cx="210" cy="120" r="5" />
              </g>
            )}
            {pizza.bakeState === 'burnt' && (
              <circle cx="200" cy="200" r="130" fill="rgba(0,0,0,0.5)" />
            )}
          </g>
        )}

        {/* 5. Placed Toppings */}
        {pizza.toppings.map((item) => {
          // Convert percentage coordinates (-40 to 40) into absolute SVG coords
          const topX = 200 + (item.x / 40) * 125;
          const topY = 200 + (item.y / 40) * 125;
          const rot = item.rotation;

          return (
            <g
              key={item.id}
              transform={`translate(${topX}, ${topY}) rotate(${rot})`}
              className="transition-transform duration-150"
            >
              {item.type === 'pepperoni' && (
                <g filter="url(#crispGlow)">
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill={pizza.bakeState === 'burnt' ? '#1c1917' : '#dc2626'}
                    stroke={pizza.bakeState === 'burnt' ? '#0c0a09' : '#991b1b'}
                    strokeWidth="2.5"
                  />
                  {/* Pepperoni seasoning specks */}
                  <circle cx="-5" cy="-4" r="1.5" fill="#fef08a" opacity="0.7" />
                  <circle cx="4" cy="-3" r="1.2" fill="#450a0a" opacity="0.6" />
                  <circle cx="-2" cy="5" r="1.5" fill="#fef08a" opacity="0.7" />
                  <circle cx="5" cy="4" r="1" fill="#450a0a" opacity="0.6" />
                </g>
              )}

              {item.type === 'mushroom' && (
                <g filter="url(#crispGlow)">
                  {/* Mushroom stem */}
                  <rect
                    x="-3"
                    y="0"
                    width="6"
                    height="9"
                    rx="2"
                    fill={pizza.bakeState === 'burnt' ? '#292524' : '#e7e5e4'}
                    stroke={pizza.bakeState === 'burnt' ? '#0c0a09' : '#a8a29e'}
                    strokeWidth="1.5"
                  />
                  {/* Mushroom cap */}
                  <path
                    d="M -13 0 C -13 -12, 13 -12, 13 0 Z"
                    fill={pizza.bakeState === 'burnt' ? '#1c1917' : '#78350f'}
                    stroke={pizza.bakeState === 'burnt' ? '#0c0a09' : '#451a03'}
                    strokeWidth="2"
                  />
                </g>
              )}

              {item.type === 'sausage' && (
                <g filter="url(#crispGlow)">
                  <path
                    d="M -8 -6 Q 0 -9 8 -6 Q 10 0 6 6 Q -2 9 -8 6 Z"
                    fill={pizza.bakeState === 'burnt' ? '#1c1917' : '#92400e'}
                    stroke={pizza.bakeState === 'burnt' ? '#0c0a09' : '#713f12'}
                    strokeWidth="2"
                  />
                  <circle cx="-2" cy="-1" r="1.5" fill="#451a03" />
                  <circle cx="3" cy="2" r="1.5" fill="#fef3c7" opacity="0.6" />
                </g>
              )}

              {item.type === 'onion' && (
                <g filter="url(#crispGlow)">
                  <path
                    d="M -11 -6 A 14 14 0 0 1 11 -6"
                    fill="none"
                    stroke={pizza.bakeState === 'burnt' ? '#1c1917' : '#9333ea'}
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                  <path
                    d="M -9 -4 A 11 11 0 0 1 9 -4"
                    fill="none"
                    stroke={pizza.bakeState === 'burnt' ? '#292524' : '#f3e8ff'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {item.type === 'pepper' && (
                <g filter="url(#crispGlow)">
                  <path
                    d="M -12 -5 Q 0 -12 12 -5 Q 10 2 0 5 Q -10 2 -12 -5 Z"
                    fill={pizza.bakeState === 'burnt' ? '#1c1917' : '#16a34a'}
                    stroke={pizza.bakeState === 'burnt' ? '#0c0a09' : '#14532d'}
                    strokeWidth="2"
                  />
                  <path
                    d="M -8 -4 Q 0 -8 8 -4"
                    fill="none"
                    stroke="#86efac"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* 6. Pizza Slice Cut Lines */}
        {pizza.slices > 0 && (
          <g stroke="#3e2723" strokeWidth="3.5" strokeDasharray="3 3" opacity="0.85">
            {/* Cut 1 (Horizontal) */}
            <line x1="45" y1="200" x2="355" y2="200" />
            {/* Cut 2 (Vertical) */}
            <line x1="200" y1="45" x2="200" y2="355" />
            {/* Cut 3 & 4 (Diagonal for 6 slices) */}
            {pizza.slices === 6 && (
              <>
                <line x1="75" y1="90" x2="325" y2="310" />
                <line x1="75" y1="310" x2="325" y2="90" />
              </>
            )}
          </g>
        )}

        {/* Oven Smoke / Steam effect when baking */}
        {isBaking && (
          <g className="animate-pulse" opacity="0.6">
            <path
              d="M 160 160 Q 150 120 170 80"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 200 180 Q 210 130 190 70"
              fill="none"
              stroke="#fff"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 240 160 Q 250 110 230 80"
              fill="none"
              stroke="#fff"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Guide hint when empty */}
      {!pizza.hasSauce && !pizza.hasCheese && pizza.toppings.length === 0 && !isBaking && (
        <div className="absolute pointer-events-none bg-amber-950/80 backdrop-blur-xs text-amber-100 px-3 py-1.5 rounded-lg text-xs font-medium text-center shadow-lg animate-bounce">
          Pilih saus tomat lalu klik adonan!
        </div>
      )}
    </div>
  );
};
