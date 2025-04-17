
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AchievementsList from "@/components/achievements/AchievementsList";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { mockAchievements } from "@/data/mockData";
import { Achievement } from "@/types";

const AchievementsSection = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real application, we would fetch this data from an API
    // based on the current user's ID
    const loadAchievements = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAchievements(mockAchievements);
      } catch (error) {
        console.error("Error loading achievements:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadAchievements();
    }
  }, [currentUser]);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-pulse">Loading achievements...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <CardTitle>Achievements</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href="/achievements">View All</a>
          </Button>
        </div>
        <CardDescription>
          You've unlocked {unlockedCount} of {achievements.length} achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AchievementsList achievements={achievements} />
      </CardContent>
    </Card>
  );
};

export default AchievementsSection;
