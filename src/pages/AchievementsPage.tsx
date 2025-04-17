
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import AchievementsList from "@/components/achievements/AchievementsList";
import ManageAchievements from "@/components/admin/ManageAchievements";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Achievement } from "@/types";
import { rolePermissions } from "@/components/employees/employee-details/role-permissions/constants";
import { Trophy } from "lucide-react";

const AchievementsPage = () => {
  const [achievements, setAchievements] = useLocalStorage<Achievement[]>("achievements", [
    {
      id: "1",
      title: "Task Master",
      description: "Complete 10 tasks in a month",
      icon: "🏆",
      pointsRequired: 200,
      isUnlocked: false,
      currentPoints: 40
    },
    {
      id: "2",
      title: "Consistent Contributor",
      description: "Complete tasks on 5 consecutive days",
      icon: "🔥",
      pointsRequired: 100,
      isUnlocked: false,
      currentPoints: 60
    },
    {
      id: "3",
      title: "Efficiency Expert",
      description: "Complete 5 high-priority tasks before their deadline",
      icon: "⚡",
      pointsRequired: 150,
      isUnlocked: false,
      currentPoints: 90
    },
    {
      id: "4",
      title: "Team Player",
      description: "Assist colleagues with 3 different projects",
      icon: "👥",
      pointsRequired: 120,
      isUnlocked: true,
      unlockedDate: "2023-05-15"
    },
    {
      id: "5",
      title: "First Steps",
      description: "Complete your first task",
      icon: "🌱",
      pointsRequired: 10,
      isUnlocked: true,
      unlockedDate: "2023-04-01"
    }
  ]);
  
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("my-achievements");
  
  document.title = "Achievements | TaskSync Pilot";
  
  // Check role-based permissions
  const userRole = currentUser?.role || "employee";
  const userPermissions = rolePermissions[userRole] || [];
  
  const canViewAchievements = userPermissions.includes("view_achievements");
  const canManageAchievements = userPermissions.includes("manage_achievements");
  
  const handleAddAchievement = (achievement: Omit<Achievement, "id" | "isUnlocked" | "unlockedDate" | "currentPoints">) => {
    const newAchievement: Achievement = {
      ...achievement,
      id: Math.random().toString(36).substring(2, 9),
      isUnlocked: false,
      currentPoints: 0
    };
    setAchievements([...achievements, newAchievement]);
  };

  const handleUpdateAchievement = (id: string, updatedFields: Partial<Achievement>) => {
    setAchievements(
      achievements.map(achievement =>
        achievement.id === id
          ? { ...achievement, ...updatedFields }
          : achievement
      )
    );
  };

  const handleDeleteAchievement = (id: string) => {
    setAchievements(achievements.filter(achievement => achievement.id !== id));
  };

  if (!canViewAchievements) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center p-4">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
        <p className="text-muted-foreground max-w-md">
          You don't have permission to view the achievements page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground">Track your progress and unlock achievements</p>
      </div>
      
      <Tabs defaultValue="my-achievements" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-achievements">My Achievements</TabsTrigger>
          {canManageAchievements && (
            <TabsTrigger value="manage">Manage Achievements</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="my-achievements" className="mt-6">
          <AchievementsList achievements={achievements} />
        </TabsContent>
        
        {canManageAchievements && (
          <TabsContent value="manage" className="mt-6">
            <ManageAchievements 
              achievements={achievements}
              onAdd={handleAddAchievement}
              onUpdate={handleUpdateAchievement}
              onDelete={handleDeleteAchievement}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default AchievementsPage;
