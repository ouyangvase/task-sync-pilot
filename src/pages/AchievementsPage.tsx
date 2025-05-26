
import { useAuth } from "@/contexts/AuthContext";
import AchievementsList from "@/components/achievements/AchievementsList";
import { ManageAchievements } from "@/components/admin/ManageAchievements";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy } from "lucide-react";
import { useAchievements } from "@/hooks/useAchievements";

const AchievementsPage = () => {
  const { currentUser } = useAuth();
  const { achievements, loading, addAchievement, updateAchievement, deleteAchievement } = useAchievements();
  const isAdmin = currentUser?.role === "admin";

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
              onAdd={addAchievement}
              onUpdate={updateAchievement}
              onDelete={deleteAchievement}
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
