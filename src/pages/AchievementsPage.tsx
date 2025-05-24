
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AchievementsList from "@/components/achievements/AchievementsList";
import { ManageAchievements } from "@/components/admin/ManageAchievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { mockAchievements } from "@/data/mockData";
import { Achievement } from "@/types";

const AchievementsPage = () => {
  const { currentUser } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    // In a real application, we would fetch this data from an API
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

  const handleAddAchievement = (achievement: Omit<Achievement, "id" | "isUnlocked" | "unlockedDate" | "currentPoints">) => {
    // In a real application, we would make an API call to add the achievement
    const newAchievement: Achievement = {
      id: `new-${Date.now()}`,
      ...achievement,
      isUnlocked: false,
      currentPoints: 0,
    };
    setAchievements([...achievements, newAchievement]);
  };

  const handleUpdateAchievement = (id: string, updates: Partial<Achievement>) => {
    // In a real application, we would make an API call to update the achievement
    setAchievements(
      achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, ...updates } : achievement
      )
    );
  };

  const handleDeleteAchievement = (id: string) => {
    // In a real application, we would make an API call to delete the achievement
    setAchievements(achievements.filter((achievement) => achievement.id !== id));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-amber-500" />
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
      </div>

      {isAdmin ? (
        <Tabs defaultValue="view">
          <TabsList className="mb-6">
            <TabsTrigger value="view">View Achievements</TabsTrigger>
            <TabsTrigger value="manage">Manage Achievements</TabsTrigger>
          </TabsList>
          <TabsContent value="view">
            <AchievementsList achievements={achievements} />
          </TabsContent>
          <TabsContent value="manage">
            <ManageAchievements
              achievements={achievements}
              onAdd={handleAddAchievement}
              onUpdate={handleUpdateAchievement}
              onDelete={handleDeleteAchievement}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <AchievementsList achievements={achievements} />
      )}
    </div>
  );
};

export default AchievementsPage;
