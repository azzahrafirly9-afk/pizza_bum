export type ToppingType = 'pepperoni' | 'mushroom' | 'sausage' | 'onion' | 'pepper';

export interface PlacedTopping {
  id: string;
  type: ToppingType;
  x: number; // percentage from center (-40 to 40)
  y: number; // percentage from center (-40 to 40)
  rotation: number;
}

export type BakeState = 'raw' | 'baking' | 'perfect' | 'burnt';

export interface PizzaState {
  hasSauce: boolean;
  sauceAmount: number; // 0 to 100%
  hasCheese: boolean;
  cheeseAmount: number; // 0 to 100%
  toppings: PlacedTopping[];
  bakeState: BakeState;
  bakeProgress: number; // 0 to 100+
  slices: number; // 0, 4, 6
}

export interface CustomerOrder {
  id: string;
  customerName: string;
  customerTitle: string;
  avatar: string;
  dialogue: string;
  hint: string;
  reqSauce: boolean;
  reqCheese: boolean;
  reqToppings: {
    [key in ToppingType]?: number; // target count (approx 6-10)
  };
  disallowedToppings?: ToppingType[];
  reqSlices: number; // 4 or 6
  patienceSeconds: number;
  rewardBase: number;
}

export type GameState = 'TITLE' | 'PLAYING' | 'ORDER_RESULT' | 'DAY_VICTORY' | 'GAME_OVER';

export interface GameStats {
  day: number;
  money: number;
  score: number;
  ordersCompletedToday: number;
  targetOrdersToday: number;
  strikes: number; // 3 strikes = game over
  maxStrikes: number;
  totalPizzasSold: number;
  totalRevenue: number;
}

export interface OrderEvaluation {
  accuracyPercent: number;
  sauceScore: number;
  cheeseScore: number;
  toppingsScore: number;
  bakeScore: number;
  sliceScore: number;
  baseReward: number;
  tip: number;
  penalty: number;
  totalMoney: number;
  feedbackTitle: string;
  feedbackComment: string;
  isSuccess: boolean;
}
