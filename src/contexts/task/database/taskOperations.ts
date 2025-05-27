
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { toast } from "@/components/ui/sonner";

export const saveTaskToDatabase = async (task: Omit<Task, "id"> | Task, currentUserId?: string) => {
  console.log('Saving task to database:', task.title);
  
  try {
    const taskData = {
      title: task.title,
      description: task.description,
      assigned_to: task.assignee,
      assigned_by: task.assignedBy || currentUserId,
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
      return data;
    }
  } catch (error) {
    console.error('Exception saving task:', error);
    throw error;
  }
};

export const updateMonthlyTargetInDatabase = async (target: number) => {
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
    
    return data;
  } catch (error) {
    console.error('Exception updating monthly target:', error);
    throw error;
  }
};

export const updateUserPointsInDatabase = async (userId: string, points: number) => {
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
    
    return data;
  } catch (error) {
    console.error('Exception updating user points:', error);
    throw error;
  }
};

export const saveRewardTierToDatabase = async (tier: any) => {
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
    
    return data;
  } catch (error) {
    console.error('Exception saving reward tier:', error);
    throw error;
  }
};
