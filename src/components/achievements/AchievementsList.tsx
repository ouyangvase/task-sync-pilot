
import { useState } from "react";
import { Achievement } from "@/types";
import AchievementCard from "./AchievementCard";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface AchievementsListProps {
  achievements: Achievement[];
}

type Filter = "all" | "unlocked" | "locked";

const AchievementsList = ({ achievements }: AchievementsListProps) => {
  const [filter, setFilter] = useState<Filter>("all");
  
  const filteredAchievements = achievements.filter((achievement) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return achievement.isUnlocked;
    if (filter === "locked") return !achievement.isUnlocked;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Your Achievements</h2>
        <div className="flex flex-wrap gap-2">
          <RadioGroup
            value={filter}
            onValueChange={(value) => setFilter(value as Filter)}
            className="flex gap-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="all" />
              <Label htmlFor="all">All</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unlocked" id="unlocked" />
              <Label htmlFor="unlocked">Unlocked</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="locked" id="locked" />
              <Label htmlFor="locked">Locked</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No achievements found</p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;
