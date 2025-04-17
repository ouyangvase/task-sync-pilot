
import { useState } from "react";
import { useTasks } from "@/contexts/TaskContext";
import { RewardTier } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Plus, Trash2, Save } from "lucide-react";

const RewardsManager = () => {
  const { rewardTiers, updateRewardTiers, monthlyTarget, updateMonthlyTarget } = useTasks();
  const [tiers, setTiers] = useState<RewardTier[]>(rewardTiers);
  const [target, setTarget] = useState(monthlyTarget);

  const handleAddTier = () => {
    const newTier: RewardTier = {
      id: `tier-${Date.now()}`,
      points: 100,
      reward: "New reward"
    };
    setTiers([...tiers, newTier]);
  };

  const handleRemoveTier = (id: string) => {
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  const handleTierChange = (id: string, field: keyof RewardTier, value: string | number) => {
    setTiers(tiers.map(tier => {
      if (tier.id === id) {
        return { ...tier, [field]: value };
      }
      return tier;
    }));
  };

  const handleSave = () => {
    // Sort tiers by points (ascending)
    const sortedTiers = [...tiers].sort((a, b) => a.points - b.points);
    updateRewardTiers(sortedTiers);
    updateMonthlyTarget(target);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium">Monthly Target</CardTitle>
            <Trophy className="h-5 w-5 text-purple-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="monthlyTarget" className="text-sm font-medium mb-1 block">
                Points target per month
              </label>
              <Input 
                id="monthlyTarget"
                type="number" 
                min="1" 
                value={target}
                onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-medium">Reward Tiers</CardTitle>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tiers.map((tier, index) => (
              <div key={tier.id} className="flex gap-3 items-center">
                <div className="w-24">
                  <Input 
                    type="number"
                    value={tier.points}
                    onChange={(e) => handleTierChange(tier.id, 'points', parseInt(e.target.value) || 0)}
                    className="w-full"
                    placeholder="Points"
                  />
                </div>
                <div className="flex-grow">
                  <Input 
                    value={tier.reward}
                    onChange={(e) => handleTierChange(tier.id, 'reward', e.target.value)}
                    className="w-full"
                    placeholder="Reward description"
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveTier(tier.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            
            <div className="flex justify-between gap-4 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleAddTier}
                className="flex gap-1 items-center"
              >
                <Plus className="h-4 w-4" /> Add Tier
              </Button>
              
              <Button 
                onClick={handleSave}
                size="sm"
                className="flex gap-1 items-center"
              >
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsManager;
