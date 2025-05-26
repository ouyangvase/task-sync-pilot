
import { useState, useEffect } from "react";
import { Task, RewardTier } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";

export function useSupabaseTaskStorage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(500);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Load data from Supabase on mount
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        () => loadTasks()
      )
      .subscribe();

    const rewardsChannel = supabase
      .channel('rewards-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reward_tiers' },
        () => loadRewardTiers()
      )
      .subscribe();

    const pointsChannel = supabase
      .channel('points-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_points' },
        () => loadUserPoints()
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        () => loadMonthlyTarget()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(rewardsChannel);
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [currentUser]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadRewardTiers(),
        loadUserPoints(),
        loadMonthlyTarget(),
        migrateLocalStorageData()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!currentUser) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`assignee.eq.${currentUser.id},assigned_by.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    const formattedTasks: Task[] = data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      assignee: task.assignee || task.assigned_to,
      assignedBy: task.assigned_by,
      dueDate: task.due_date,
      status: task.status as any,
      priority: (task.priority || 'medium') as any,
      category: (task.category || 'custom') as any,
      recurrence: (task.recurrence || 'once') as any,
      points: task.points,
      createdAt: task.created_at,
      startedAt: task.started_at,
      completedAt: task.completed_at,
      isRecurringInstance: task.is_recurring_instance || false,
      parentTaskId: task.parent_task_id,
      nextOccurrenceDate: task.next_occurrence_date
    }));

    setTasks(formattedTasks);
  };

  const loadRewardTiers = async () => {
    const { data, error } = await supabase
      .from('reward_tiers')
      .select('*')
      .order('points', { ascending: true });

    if (error) {
      console.error('Error loading reward tiers:', error);
      return;
    }

    setRewardTiers(data || []);
  };

  const loadUserPoints = async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (error) {
      console.error('Error loading user points:', error);
      return;
    }

    const pointsMap: Record<string, number> = {};
    data?.forEach(point => {
      pointsMap[point.user_id] = point.points;
    });

    setUserPoints(pointsMap);
  };

  const loadMonthlyTarget = async () => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'monthly_target')
      .single();

    if (error) {
      console.error('Error loading monthly target:', error);
      return;
    }

    if (data?.setting_value) {
      setMonthlyTarget(parseInt(data.setting_value as string));
    }
  };

  const migrateLocalStorageData = async () => {
    try {
      // Check if there's data in localStorage to migrate
      const savedTasks = localStorage.getItem("tasks");
      const savedRewardTiers = localStorage.getItem("rewardTiers");
      const savedMonthlyTarget = localStorage.getItem("monthlyTarget");
      const savedUserPoints = localStorage.getItem("userPoints");

      if (savedTasks) {
        const localTasks = JSON.parse(savedTasks);
        console.log(`Found ${localTasks.length} tasks in localStorage, migrating...`);
        
        for (const task of localTasks) {
          await saveTaskToDatabase(task);
        }
        
        // Clear localStorage after migration
        localStorage.removeItem("tasks");
        toast.success(`Migrated ${localTasks.length} tasks to database`);
      }

      if (savedRewardTiers && currentUser?.role === 'admin') {
        const localRewardTiers = JSON.parse(savedRewardTiers);
        console.log(`Found ${localRewardTiers.length} reward tiers in localStorage, migrating...`);
        
        for (const tier of localRewardTiers) {
          await saveRewardTierToDatabase(tier);
        }
        
        localStorage.removeItem("rewardTiers");
        toast.success(`Migrated ${localRewardTiers.length} reward tiers to database`);
      }

      if (savedMonthlyTarget && currentUser?.role === 'admin') {
        const localTarget = JSON.parse(savedMonthlyTarget);
        await updateMonthlyTargetInDatabase(localTarget);
        localStorage.removeItem("monthlyTarget");
        toast.success('Migrated monthly target to database');
      }

      if (savedUserPoints) {
        const localUserPoints = JSON.parse(savedUserPoints);
        for (const [userId, points] of Object.entries(localUserPoints)) {
          await updateUserPointsInDatabase(userId, points as number);
        }
        localStorage.removeItem("userPoints");
        toast.success('Migrated user points to database');
      }

    } catch (error) {
      console.error('Error migrating localStorage data:', error);
    }
  };

  const saveTaskToDatabase = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        assigned_by: task.assignedBy,
        due_date: task.dueDate,
        status: task.status,
        priority: task.priority,
        category: task.category,
        recurrence: task.recurrence,
        points: task.points,
        created_at: task.createdAt,
        started_at: task.startedAt,
        completed_at: task.completedAt,
        is_recurring_instance: task.isRecurringInstance,
        parent_task_id: task.parentTaskId,
        next_occurrence_date: task.nextOccurrenceDate
      });

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error saving task:', error);
    }
  };

  const saveRewardTierToDatabase = async (tier: RewardTier) => {
    const { error } = await supabase
      .from('reward_tiers')
      .insert({
        name: tier.name,
        points: tier.points,
        reward: tier.reward,
        description: tier.description
      });

    if (error && !error.message.includes('duplicate key')) {
      console.error('Error saving reward tier:', error);
    }
  };

  const updateMonthlyTargetInDatabase = async (target: number) => {
    const { error } = await supabase
      .from('app_settings')
      .upsert({
        setting_key: 'monthly_target',
        setting_value: target.toString()
      });

    if (error) {
      console.error('Error updating monthly target:', error);
    }
  };

  const updateUserPointsInDatabase = async (userId: string, points: number) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const { error } = await supabase
      .from('user_points')
      .upsert({
        user_id: userId,
        points: points,
        month: currentMonth,
        year: currentYear
      });

    if (error) {
      console.error('Error updating user points:', error);
    }
  };

  return { 
    tasks, 
    setTasks, 
    rewardTiers, 
    setRewardTiers, 
    monthlyTarget, 
    setMonthlyTarget, 
    userPoints, 
    setUserPoints,
    loading,
    saveTaskToDatabase,
    saveRewardTierToDatabase,
    updateMonthlyTargetInDatabase,
    updateUserPointsInDatabase
  };
}
