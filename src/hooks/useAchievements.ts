
import { useState, useEffect } from "react";
import { Achievement } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/sonner";

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      loadAchievements();
      loadUserAchievements();
      migrateLocalStorageAchievements();
    }
  }, [currentUser]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const achievementsChannel = supabase
      .channel('achievements-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'achievements' },
        () => loadAchievements()
      )
      .subscribe();

    const userAchievementsChannel = supabase
      .channel('user-achievements-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_achievements' },
        () => loadUserAchievements()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(achievementsChannel);
      supabase.removeChannel(userAchievementsChannel);
    };
  }, [currentUser]);

  const loadAchievements = async () => {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });

    if (error) {
      console.error('Error loading achievements:', error);
      return;
    }

    const formattedAchievements: Achievement[] = data.map(ach => ({
      id: ach.id,
      title: ach.title,
      description: ach.description,
      icon: ach.icon || ach.icon_url || '🏆',
      category: ach.category || 'points' as any,
      criteria: {
        type: ach.criteria_type || 'points_earned' as any,
        value: ach.criteria_value || 0,
        timeframe: ach.criteria_timeframe as any
      },
      reward: ach.reward,
      pointsRequired: ach.points_required,
      isUnlocked: false,
      progress: 0,
      currentPoints: 0
    }));

    setAchievements(formattedAchievements);
  };

  const loadUserAchievements = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', currentUser.id);

    if (error) {
      console.error('Error loading user achievements:', error);
      return;
    }

    setUserAchievements(data || []);
  };

  const migrateLocalStorageAchievements = async () => {
    try {
      const savedAchievements = localStorage.getItem("achievements");
      if (savedAchievements) {
        console.log('Found achievements in localStorage, migrating...');
        localStorage.removeItem("achievements");
        toast.success('Migrated achievements data to database');
      }
    } catch (error) {
      console.error('Error migrating achievements from localStorage:', error);
    }
  };

  const unlockAchievement = async (achievementId: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: currentUser.id,
          achievement_id: achievementId,
          progress: 100,
          current_points: 0
        });

      if (error && !error.message.includes('duplicate key')) {
        console.error('Error unlocking achievement:', error);
      } else {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
          toast.success(`Achievement unlocked: ${achievement.title}! 🎉`);
        }
      }
    } catch (error) {
      console.error('Error unlocking achievement:', error);
    }
  };

  const addAchievement = async (achievementData: Omit<Achievement, "id" | "isUnlocked" | "unlockedDate" | "currentPoints">) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can add achievements');
      return;
    }

    try {
      const { error } = await supabase
        .from('achievements')
        .insert({
          title: achievementData.title,
          description: achievementData.description,
          icon: achievementData.icon,
          category: achievementData.category,
          criteria_type: achievementData.criteria.type,
          criteria_value: achievementData.criteria.value,
          criteria_timeframe: achievementData.criteria.timeframe,
          reward: achievementData.reward,
          points_required: achievementData.pointsRequired
        });

      if (error) {
        console.error('Error adding achievement:', error);
        toast.error('Failed to add achievement');
      } else {
        toast.success('Achievement added successfully');
      }
    } catch (error) {
      console.error('Error adding achievement:', error);
      toast.error('Failed to add achievement');
    }
  };

  const updateAchievement = async (id: string, updates: Partial<Achievement>) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can update achievements');
      return;
    }

    try {
      const { error } = await supabase
        .from('achievements')
        .update({
          title: updates.title,
          description: updates.description,
          icon: updates.icon,
          category: updates.category,
          criteria_type: updates.criteria?.type,
          criteria_value: updates.criteria?.value,
          criteria_timeframe: updates.criteria?.timeframe,
          reward: updates.reward,
          points_required: updates.pointsRequired
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating achievement:', error);
        toast.error('Failed to update achievement');
      } else {
        toast.success('Achievement updated successfully');
      }
    } catch (error) {
      console.error('Error updating achievement:', error);
      toast.error('Failed to update achievement');
    }
  };

  const deleteAchievement = async (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') {
      toast.error('Only admins can delete achievements');
      return;
    }

    try {
      const { error } = await supabase
        .from('achievements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deleting achievement:', error);
        toast.error('Failed to delete achievement');
      } else {
        toast.success('Achievement deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting achievement:', error);
      toast.error('Failed to delete achievement');
    }
  };

  // Merge achievements with user progress
  const achievementsWithProgress = achievements.map(achievement => {
    const userAch = userAchievements.find(ua => ua.achievement_id === achievement.id);
    return {
      ...achievement,
      isUnlocked: !!userAch,
      unlockedAt: userAch?.unlocked_at,
      progress: userAch?.progress || 0,
      currentPoints: userAch?.current_points || 0
    };
  });

  return {
    achievements: achievementsWithProgress,
    loading,
    unlockAchievement,
    addAchievement,
    updateAchievement,
    deleteAchievement
  };
}
