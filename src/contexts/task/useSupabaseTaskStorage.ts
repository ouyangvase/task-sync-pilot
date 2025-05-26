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
  const { currentUser, loading: authLoading } = useAuth();

  // Load data from Supabase on mount
  useEffect(() => {
    // If auth is still loading, wait for it to complete
    if (authLoading) {
      return;
    }

    // If user is not authenticated, stop loading
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // If user is authenticated, load data
    loadAllData();
  }, [currentUser, authLoading]);

  // Set up real-time subscriptions only when user is authenticated
  useEffect(() => {
    if (!currentUser || authLoading) return;

    console.log('Setting up real-time subscriptions for user:', currentUser.id);

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Tasks real-time update:', payload);
          loadTasks();
        }
      )
      .subscribe();

    const rewardsChannel = supabase
      .channel('rewards-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reward_tiers' },
        (payload) => {
          console.log('Reward tiers real-time update:', payload);
          loadRewardTiers();
        }
      )
      .subscribe();

    const pointsChannel = supabase
      .channel('points-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_points' },
        (payload) => {
          console.log('User points real-time update:', payload);
          loadUserPoints();
        }
      )
      .subscribe();

    const settingsChannel = supabase
      .channel('settings-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'app_settings' },
        (payload) => {
          console.log('App settings real-time update:', payload);
          loadMonthlyTarget();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(rewardsChannel);
      supabase.removeChannel(pointsChannel);
      supabase.removeChannel(settingsChannel);
    };
  }, [currentUser, authLoading]);

  const loadAllData = async () => {
    if (!currentUser) return;
    
    console.log('Loading all data for user:', currentUser.id);
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(),
        loadRewardTiers(),
        loadUserPoints(),
        loadMonthlyTarget(),
        migrateLocalStorageData(),
        initializeDefaultData()
      ]);
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    if (!currentUser) return;

    console.log('Loading tasks for user:', currentUser.id);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .or(`assigned_to.eq.${currentUser.id},assigned_by.eq.${currentUser.id}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks from database');
      return;
    }

    console.log(`Loaded ${data?.length || 0} tasks from database`, data);

    const formattedTasks: Task[] = data.map(task => {
      console.log('Formatting task:', task);
      return {
        id: task.id,
        title: task.title,
        description: task.description || '',
        assignee: task.assigned_to,
        assignedBy: task.assigned_by,
        dueDate: task.due_date,
        status: task.status as any,
        priority: 'medium' as any, // Default since column doesn't exist yet
        category: 'custom' as any, // Default since column doesn't exist yet
        recurrence: 'once' as any, // Default since column doesn't exist yet
        points: task.points,
        createdAt: task.created_at,
        startedAt: task.started_at,
        completedAt: task.completed_at,
        isRecurringInstance: false, // Default since column doesn't exist yet
        parentTaskId: undefined, // Default since column doesn't exist yet
        nextOccurrenceDate: undefined // Default since column doesn't exist yet
      };
    });

    console.log('Formatted tasks:', formattedTasks);
    setTasks(formattedTasks);
  };

  const loadRewardTiers = async () => {
    console.log('Loading reward tiers');
    const { data, error } = await supabase
      .from('reward_tiers')
      .select('*')
      .order('points', { ascending: true });

    if (error) {
      console.error('Error loading reward tiers:', error);
      toast.error('Failed to load reward tiers');
      return;
    }

    console.log(`Loaded ${data?.length || 0} reward tiers from database`);
    setRewardTiers(data || []);
  };

  const loadUserPoints = async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log(`Loading user points for month ${currentMonth}/${currentYear}`);
    const { data, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('month', currentMonth)
      .eq('year', currentYear);

    if (error) {
      console.error('Error loading user points:', error);
      toast.error('Failed to load user points');
      return;
    }

    console.log(`Loaded points for ${data?.length || 0} users`);
    const pointsMap: Record<string, number> = {};
    data?.forEach(point => {
      pointsMap[point.user_id] = point.points;
    });

    setUserPoints(pointsMap);
  };

  const loadMonthlyTarget = async () => {
    console.log('Loading monthly target');
    const { data, error } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'monthly_target')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error loading monthly target:', error);
      return;
    }

    if (data?.setting_value) {
      const target = parseInt(data.setting_value as string);
      console.log('Loaded monthly target:', target);
      setMonthlyTarget(target);
    } else {
      console.log('No monthly target found, using default');
    }
  };

  const initializeDefaultData = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    console.log('Initializing default data');
    
    // Check if reward tiers exist, if not create defaults
    const { data: existingTiers } = await supabase
      .from('reward_tiers')
      .select('id')
      .limit(1);

    if (!existingTiers || existingTiers.length === 0) {
      console.log('Creating default reward tiers');
      const defaultTiers: RewardTier[] = [
        { 
          id: "tier-bronze", 
          name: "Bronze Achiever", 
          points: 300, 
          reward: "$50 cash bonus", 
          description: "Complete 300 points worth of tasks" 
        },
        { 
          id: "tier-silver", 
          name: "Silver Performer", 
          points: 500, 
          reward: "$100 cash bonus", 
          description: "Complete 500 points worth of tasks" 
        },
        { 
          id: "tier-gold", 
          name: "Gold Champion", 
          points: 1000, 
          reward: "$200 cash bonus + extra day off", 
          description: "Complete 1000 points worth of tasks" 
        }
      ];

      for (const tier of defaultTiers) {
        await saveRewardTierToDatabase(tier);
      }
      toast.success('Default reward tiers created');
    }

    // Check if monthly target exists, if not create default
    const { data: existingTarget } = await supabase
      .from('app_settings')
      .select('setting_value')
      .eq('setting_key', 'monthly_target')
      .single();

    if (!existingTarget) {
      console.log('Creating default monthly target');
      await updateMonthlyTargetInDatabase(500);
      toast.success('Default monthly target set to 500 points');
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
          // Remove the id field to let database generate it
          const { id, ...taskWithoutId } = task;
          await saveTaskToDatabase(taskWithoutId);
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

  const saveTaskToDatabase = async (task: Omit<Task, "id"> | Task) => {
    console.log('Saving task to database:', 'title' in task ? task.title : 'Unknown task');
    
    try {
      // Prepare task data without id - let database generate UUID
      const taskData = {
        title: task.title,
        description: task.description,
        assigned_to: task.assignee,
        assigned_by: task.assignedBy,
        due_date: task.dueDate,
        status: task.status,
        points: task.points,
        created_at: task.createdAt,
        started_at: task.startedAt,
        completed_at: task.completedAt,
        updated_at: new Date().toISOString()
      };

      console.log('Task data being inserted:', taskData);

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) {
        console.error('Database error saving task:', error);
        toast.error(`Failed to save task: ${error.message}`);
        throw error;
      } else {
        console.log('Task saved successfully with generated UUID:', data.id);
        toast.success('Task saved successfully');
        return data; // Return the task with generated UUID
      }
    } catch (error) {
      console.error('Exception saving task:', error);
      throw error;
    }
  };

  const saveRewardTierToDatabase = async (tier: RewardTier) => {
    console.log('Saving reward tier to database:', tier.name);
    
    try {
      const { data, error } = await supabase
        .from('reward_tiers')
        .insert({
          name: tier.name,
          points: tier.points,
          reward: tier.reward,
          description: tier.description
        })
        .select()
        .single();

      if (error) {
        console.error('Database error saving reward tier:', error);
        if (!error.message.includes('duplicate key')) {
          toast.error(`Failed to save reward tier: ${error.message}`);
          throw error;
        }
      } else {
        console.log('Reward tier saved successfully:', data);
      }
    } catch (error) {
      console.error('Exception saving reward tier:', error);
      throw error;
    }
  };

  const updateMonthlyTargetInDatabase = async (target: number) => {
    console.log('Updating monthly target in database:', target);
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .upsert({
          setting_key: 'monthly_target',
          setting_value: target.toString()
        })
        .select()
        .single();

      if (error) {
        console.error('Database error updating monthly target:', error);
        toast.error(`Failed to update monthly target: ${error.message}`);
        throw error;
      } else {
        console.log('Monthly target updated successfully:', data);
      }
    } catch (error) {
      console.error('Exception updating monthly target:', error);
      throw error;
    }
  };

  const updateUserPointsInDatabase = async (userId: string, points: number) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    console.log(`Updating points for user ${userId}: ${points} points for ${currentMonth}/${currentYear}`);

    try {
      const { data, error } = await supabase
        .from('user_points')
        .upsert({
          user_id: userId,
          points: points,
          month: currentMonth,
          year: currentYear
        })
        .select()
        .single();

      if (error) {
        console.error('Database error updating user points:', error);
        toast.error(`Failed to update user points: ${error.message}`);
        throw error;
      } else {
        console.log('User points updated successfully:', data);
      }
    } catch (error) {
      console.error('Exception updating user points:', error);
      throw error;
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
