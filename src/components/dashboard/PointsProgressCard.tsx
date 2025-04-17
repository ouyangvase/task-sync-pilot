
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PointsStats, RewardTier } from "@/types";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointsProgressCardProps {
  stats: PointsStats;
  rewards?: RewardTier[];
  title?: string;
}

const PointsProgressCard = ({ stats, rewards = [], title = "Monthly Points Progress" }: PointsProgressCardProps) => {
  const nextReward = rewards.length > 0 ? rewards[0] : null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md font-medium">{title}</CardTitle>
          <Trophy className="h-5 w-5 text-amber-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Points earned this month</span>
            <span className="font-bold text-lg">
              {stats.earned} <span className="text-muted-foreground text-xs">/ {stats.target}</span>
            </span>
          </div>
          <Progress 
            value={stats.percentComplete > 100 ? 100 : stats.percentComplete} 
            className="h-3"
          />
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>0 points</span>
            <span>{stats.target} points</span>
          </div>
        </div>
        
        {nextReward && (
          <div className={cn(
            "p-3 rounded-md border bg-amber-50 border-amber-200",
            stats.earned >= nextReward.points && "bg-green-50 border-green-200"
          )}>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-medium">
                  {stats.earned >= nextReward.points 
                    ? "Reward Unlocked!"
                    : `Next Reward: ${nextReward.points - stats.earned} points away`
                  }
                </h4>
                <p className="text-xs text-muted-foreground">
                  {nextReward.reward}
                </p>
              </div>
              <Trophy 
                className={cn(
                  "h-8 w-8",
                  stats.earned >= nextReward.points 
                    ? "text-green-500" 
                    : "text-amber-300"
                )} 
              />
            </div>
          </div>
        )}

        {rewards.length > 1 && (
          <div className="pt-2">
            <h4 className="text-xs font-medium mb-1">Reward tiers:</h4>
            <div className="space-y-1">
              {rewards.map((reward) => (
                <div key={reward.id} className="flex justify-between items-center text-xs">
                  <span className={cn(
                    stats.earned >= reward.points && "font-medium text-green-700"
                  )}>
                    {reward.points} points
                  </span>
                  <span className="text-muted-foreground">{reward.reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsProgressCard;
