
import { RewardTier } from "@/types";

// Default reward tiers
export const DEFAULT_REWARD_TIERS: RewardTier[] = [
  {
    id: "tier-1",
    name: "Bronze Achiever",
    points: 300,
    reward: "$50 cash bonus"
  },
  {
    id: "tier-2", 
    name: "Silver Performer",
    points: 500,
    reward: "$100 cash bonus"
  },
  {
    id: "tier-3",
    name: "Gold Champion",
    points: 1000,
    reward: "$200 cash bonus + extra day off"
  }
];

// Default monthly target
export const DEFAULT_MONTHLY_TARGET = 500;
