
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

  // Force refresh function to trigger re-renders
  const [refreshKey, setRefreshKey] = useState(0);
  const forceRefresh = () => setRefreshKey(prev => prev + 1);

  // Load data from Supabase on mount
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }
    loadAllData();
  }, [currentUser, authLoading, refreshKey]);

  // Set up real-time subscriptions only when user is authenticated
  useEffect(() => {
    if (!currentUser || authLoading) return;

    console.log('Setting up real-time subscriptions for user:', currentUser.id);

    const tasksChannel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks' },
        (payload) => {
          console.log('Tasks real-time update:', payload);
          loadTasks();
          forceRefresh();
        }
      )
      .subscribe();

    const pointsChannel = supabase
      .channel('points-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'user_points' },
        (payload) => {
          console.log('User points real-time update:', payload);
          loadUserPoints();
          forceRefresh();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(pointsChannel);
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
    
    const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);
    
    let query = supabase.from('tasks').select('*');
    
    if (isAdminOrManager) {
      console.log('Loading all tasks for admin/manager user');
    } else {
      query = query.eq('assigned_to', currentUser.id);
      console.log('Loading tasks assigned to user:', currentUser.id);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks from database');
      return;
    }

    console.log(`Loaded ${data?.length || 0} tasks from database`);

    const formattedTasks: Task[] = (data || []).map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      assignee: task.assigned_to,
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

    console.log('Formatted tasks:', formattedTasks.length);
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

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading monthly target:', error);
      return;
    }

    if (data?.setting_value) {
      const target = parseInt(data.setting_value as string);
      console.log('Loaded monthly target:', target);
      setMonthlyTarget(target);
    }
  };

  const initializeDefaultData = async () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const { data: existingTiers } = await supabase
      .from('reward_tiers')
      .select('id')
      .limit(1);

    if (!existingTiers || existingTiers.length === 0) {
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
    }
  };

  const saveTaskToDatabase = async (task: Omit<Task, "id"> | Task) => {
    console.log('Saving task to database:', task.title);
    
    try {
      const taskData = {
        title: task.title,
        description: task.description,
        assigned_to: task.assignee,
        assigned_by: task.assignedBy || currentUser?.id,
        due_date: task.dueDate,
        status: task.status,
        priority: task.priority || 'medium',
        category: task.category || 'custom',
        recurrence: task.recurrence || 'once',
        points: task.points,
        created_at: task.createdAt || new Date().toISOString(),
        started_at: task.startedAt,
        completed_at: task.completedAt,
        is_recurring_instance: task.isRecurringInstance || false,
        parent_task_id: task.parentTaskId,
        next_occurrence_date: task.nextOccurrenceDate,
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
        console.log('Task saved successfully with UUID:', data.id);
        forceRefresh(); // Force immediate UI update
        return data;
      }
    } catch (error) {
      console.error('Exception saving task:', error);
      throw error;
    }
  };

  const saveRewardTierToDatabase = async (tier: RewardTier) => {
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

      if (error && !error.message.includes('duplicate key')) {
        console.error('Database error saving reward tier:', error);
        throw error;
      }
    } catch (error) {
      console.error('Exception saving reward tier:', error);
      throw error;
    }
  };

  const updateMonthlyTargetInDatabase = async (target: number) => {
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
      }
      
      forceRefresh();
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
      }
      
      forceRefresh(); // Force immediate UI update
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
    updateUserPointsInDatabase,
    forceRefresh
  };
}
