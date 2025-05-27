
import { supabase } from "@/integrations/supabase/client";
import { Task, RewardTier } from "@/types";
import { toast } from "@/components/ui/sonner";

export const loadTasks = async (currentUser: any) => {
  if (!currentUser) return [];

  console.log('Loading tasks for user:', currentUser.id);
  
  const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);
  
  let query = supabase.from('tasks').select(`
    id,
    title,
    description,
    assigned_to,
    assigned_by,
    due_date,
    status,
    priority,
    category,
    recurrence,
    points,
    created_at,
    started_at,
    completed_at,
    is_recurring_instance,
    parent_task_id,
    next_occurrence_date,
    updated_at
  `);
  
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
    return [];
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
  return formattedTasks;
};

export const loadRewardTiers = async () => {
  console.log('Loading reward tiers');
  const { data, error } = await supabase
    .from('reward_tiers')
    .select('*')
    .order('points', { ascending: true });

  if (error) {
    console.error('Error loading reward tiers:', error);
    return [];
  }

  console.log(`Loaded ${data?.length || 0} reward tiers from database`);
  return data || [];
};

export const loadUserPoints = async () => {
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
    return {};
  }

  console.log(`Loaded points for ${data?.length || 0} users`);
  const pointsMap: Record<string, number> = {};
  data?.forEach(point => {
    pointsMap[point.user_id] = point.points;
  });

  return pointsMap;
};

export const loadMonthlyTarget = async () => {
  console.log('Loading monthly target');
  const { data, error } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'monthly_target')
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading monthly target:', error);
    return 500;
  }

  if (data?.setting_value) {
    const target = parseInt(data.setting_value as string);
    console.log('Loaded monthly target:', target);
    return target;
  }
  
  return 500;
};
