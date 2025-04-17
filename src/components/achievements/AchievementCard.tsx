
import { useState } from "react";
import { Achievement } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Info, Share2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
  className?: string;
}

const AchievementCard = ({ achievement, className }: AchievementCardProps) => {
  const [showShare, setShowShare] = useState(false);
  
  const isUnlocked = achievement.isUnlocked;
  const progress = isUnlocked ? 100 : ((achievement.currentPoints || 0) / achievement.pointsRequired) * 100;
  
  const handleShare = () => {
    // This would be implemented with a real sharing API in production
    alert(`Achievement "${achievement.title}" shared!`);
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border group hover:shadow-md transition-all",
        isUnlocked ? "bg-card" : "bg-muted/50",
        className
      )}
      onMouseEnter={() => isUnlocked && setShowShare(true)}
      onMouseLeave={() => setShowShare(false)}
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn(
            "text-4xl mb-3",
            !isUnlocked && "opacity-50"
          )}>
            {achievement.icon}
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Achievement details</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>{achievement.description}</p>
                <p className="text-xs mt-1 text-muted-foreground">{achievement.pointsRequired} points required</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <h3 className={cn(
          "text-base font-semibold",
          !isUnlocked && "text-muted-foreground"
        )}>
          {achievement.title}
        </h3>
        
        {isUnlocked ? (
          <p className="text-xs text-muted-foreground mt-1">
            Unlocked: {format(new Date(achievement.unlockedDate!), "MMM d, yyyy")}
          </p>
        ) : (
          <div className="mt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{achievement.currentPoints || 0} pts</span>
              <span>{achievement.pointsRequired} pts</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}
      </div>

      {isUnlocked && showShare && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-background"
            onClick={handleShare}
          >
            <Share2 className="mr-1 h-3 w-3" />
            Share
          </Button>
        </div>
      )}
    </Card>
  );
};

export default AchievementCard;
