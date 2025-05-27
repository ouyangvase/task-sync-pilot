
import { RewardTier } from "@/types";
import { saveRewardTierToDatabase } from "../database/taskOperations";

export const initializeDefaultData = async (currentUser: any) => {
  if (!currentUser || currentUser.role !== 'admin') return;
  
  const { supabase } = await import("@/integrations/supabase/client");
  
  const { data: existingTiers } = await supabase
    .from('reward_tiers')
    .select('id')
    .limit(1);

  if (!existingTiers || existingTiers.length === 0) {
    const defaultTiers: RewardTier[] = [
      { 
        id: "tier-bronze", 
        name: "Bronze Achiever", 
        points: 300, 
        reward: "$50 cash bonus", 
        description: "Complete 300 points worth of tasks" 
      },
      { 
        id: "tier-silver", 
        name: "Silver Performer", 
        points: 500, 
        reward: "$100 cash bonus", 
        description: "Complete 500 points worth of tasks" 
      },
      { 
        id: "tier-gold", 
        name: "Gold Champion", 
        points: 1000, 
        reward: "$200 cash bonus + extra day off", 
        description: "Complete 1000 points worth of tasks" 
      }
    ];

    for (const tier of defaultTiers) {
      await saveRewardTierToDatabase(tier);
    }
  }
};
