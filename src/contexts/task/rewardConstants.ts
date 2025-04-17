
import { RewardTier } from "@/types";

// Default reward tiers
export const DEFAULT_REWARD_TIERS: RewardTier[] = [
  {
    id: "tier-1",
    points: 300,
    reward: "$50 cash bonus"
  },
  {
    id: "tier-2",
    points: 500,
    reward: "$100 cash bonus"
  },
  {
    id: "tier-3",
    points: 1000,
    reward: "$200 cash bonus + extra day off"
  }
];

// Default monthly target
export const DEFAULT_MONTHLY_TARGET = 500;
