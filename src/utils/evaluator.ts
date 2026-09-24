import { CustomerOrder, PizzaState, OrderEvaluation, ToppingType } from '../types';

export function evaluatePizza(
  order: CustomerOrder,
  pizza: PizzaState,
  timeRemainingRatio: number // 0 to 1
): OrderEvaluation {
  let sauceScore = 100;
  let cheeseScore = 100;
  let toppingsScore = 100;
  let bakeScore = 100;
  let sliceScore = 100;

  const mistakes: string[] = [];

  // 1. Sauce Evaluation
  if (order.reqSauce && !pizza.hasSauce) {
    sauceScore = 0;
    mistakes.push('Kurang saus tomat');
  } else if (!order.reqSauce && pizza.hasSauce) {
    sauceScore = 20;
    mistakes.push('Tidak minta saus tapi diberi saus');
  }

  // 2. Cheese Evaluation
  if (order.reqCheese && !pizza.hasCheese) {
    cheeseScore = 0;
    mistakes.push('Kurang keju mozzarella');
  } else if (!order.reqCheese && pizza.hasCheese) {
    cheeseScore = 20;
    mistakes.push('Tidak minta keju tapi diberi keju');
  }

  // 3. Topping Counts & Disallowed
  const counts: Record<ToppingType, number> = {
    pepperoni: 0,
    mushroom: 0,
    sausage: 0,
    onion: 0,
    pepper: 0,
  };

  pizza.toppings.forEach((t) => {
    counts[t.type] = (counts[t.type] || 0) + 1;
  });

  // Check disallowed toppings (e.g. vegetarian got meat)
  let disallowedCount = 0;
  if (order.disallowedToppings) {
    order.disallowedToppings.forEach((dt) => {
      if (counts[dt] > 0) {
        disallowedCount += counts[dt];
        mistakes.push(`Topping tidak diinginkan: ${dt}`);
      }
    });
  }

  // Check requested toppings
  let reqToppingScoreSum = 0;
  const reqKeys = Object.keys(order.reqToppings) as ToppingType[];
  
  if (reqKeys.length === 0) {
    // Expected no toppings
    const totalToppingsOnPizza = pizza.toppings.length;
    if (totalToppingsOnPizza === 0) {
      reqToppingScoreSum = 100;
    } else {
      reqToppingScoreSum = Math.max(0, 100 - totalToppingsOnPizza * 12);
      mistakes.push('Pesanan minta polos, tapi ada topping tambahan');
    }
  } else {
    reqKeys.forEach((key) => {
      const target = order.reqToppings[key] || 0;
      const actual = counts[key] || 0;
      if (target > 0) {
        if (actual === 0) {
          mistakes.push(`Tidak ada topping ${key}`);
        } else if (actual < Math.ceil(target * 0.7)) {
          mistakes.push(`Topping ${key} kurang banyak (${actual}/${target})`);
          reqToppingScoreSum += (actual / target) * 80;
        } else {
          reqToppingScoreSum += 100;
        }
      }
    });
    reqToppingScoreSum = reqToppingScoreSum / reqKeys.length;
  }

  // Penalty for unrequested extra toppings
  const allToppingTypes: ToppingType[] = ['pepperoni', 'mushroom', 'sausage', 'onion', 'pepper'];
  let unrequestedPenalty = 0;
  allToppingTypes.forEach((type) => {
    if (!order.reqToppings[type] && !order.disallowedToppings?.includes(type)) {
      if (counts[type] > 0) {
        unrequestedPenalty += 10;
        mistakes.push(`Topping ekstra yang tidak dipesan: ${type}`);
      }
    }
  });

  toppingsScore = Math.max(0, Math.min(100, reqToppingScoreSum - unrequestedPenalty - disallowedCount * 25));

  // 4. Bake Score
  if (pizza.bakeState === 'perfect') {
    bakeScore = 100;
  } else if (pizza.bakeState === 'burnt') {
    bakeScore = 0;
    mistakes.push('Pizza gosong terbakar!');
  } else if (pizza.bakeState === 'raw') {
    bakeScore = 10;
    mistakes.push('Pizza belum dipanggang / mentah!');
  } else {
    bakeScore = 50;
    mistakes.push('Pizza kurang matang');
  }

  // 5. Slice Score
  if (pizza.slices === order.reqSlices) {
    sliceScore = 100;
  } else if (pizza.slices > 0) {
    sliceScore = 70;
    mistakes.push(`Salah jumlah potongan (${pizza.slices} bukan ${order.reqSlices})`);
  } else {
    sliceScore = 40;
    mistakes.push('Pizza lupa dipotong');
  }

  // Weighted Total Accuracy
  const accuracyPercent = Math.round(
    sauceScore * 0.2 +
    cheeseScore * 0.2 +
    toppingsScore * 0.35 +
    bakeScore * 0.15 +
    sliceScore * 0.1
  );

  const isSuccess = accuracyPercent >= 65 && pizza.bakeState !== 'burnt' && pizza.bakeState !== 'raw';

  // Calculate Money & Tips
  const baseReward = order.rewardBase;
  let tip = 0;
  let penalty = 0;

  if (isSuccess) {
    if (accuracyPercent >= 90) {
      tip += 3;
    }
    if (timeRemainingRatio > 0.4) {
      tip += Math.round(timeRemainingRatio * 3);
    }
  } else {
    penalty = Math.round(baseReward * 0.5);
  }

  const earned = isSuccess ? Math.round((baseReward * accuracyPercent) / 100 + tip) : Math.max(0, Math.round(baseReward * 0.3) - penalty);

  let feedbackTitle = 'Luar Biasa!';
  let feedbackComment = 'Pelanggan sangat senang dengan rasa dan ketepatan pizza ini!';

  if (accuracyPercent >= 90) {
    feedbackTitle = 'Sempurna! ⭐⭐⭐';
    feedbackComment = 'Wah, pizza ini luar biasa lezat! Tepat seperti yang saya inginkan!';
  } else if (accuracyPercent >= 75) {
    feedbackTitle = 'Cukup Bagus! ⭐⭐';
    feedbackComment = 'Rasanya enak, meski ada sedikit detail yang bisa diperbaiki.';
  } else if (accuracyPercent >= 60) {
    feedbackTitle = 'Biasa Saja ⭐';
    feedbackComment = 'Pizzanya lumayan, tapi tolong perhatikan instruksi pesanan saya lain kali.';
  } else {
    feedbackTitle = 'Kecewa Berat! ❌';
    feedbackComment = mistakes.length > 0 
      ? `Aduh, kenapa seperti ini? ${mistakes.slice(0, 2).join(', ')}!` 
      : 'Pesanan saya tidak sesuai harapan sama sekali!';
  }

  return {
    accuracyPercent,
    sauceScore,
    cheeseScore,
    toppingsScore,
    bakeScore,
    sliceScore,
    baseReward,
    tip,
    penalty,
    totalMoney: earned,
    feedbackTitle,
    feedbackComment,
    isSuccess,
  };
}
