
import { supabase } from "@/integrations/supabase/client";
import { Task, RewardTier } from "@/types";
import { toast } from "@/components/ui/sonner";

export const migrateLocalStorageToSupabase = async (currentUserId: string, isAdmin: boolean = false) => {
  try {
    let migratedCount = 0;

    // Migrate tasks
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      const localTasks: Task[] = JSON.parse(savedTasks);
      console.log(`Found ${localTasks.length} tasks in localStorage`);
      
      for (const task of localTasks) {
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

        if (!error || error.message.includes('duplicate key')) {
          migratedCount++;
        } else {
          console.error('Error migrating task:', error);
        }
      }
      
      localStorage.removeItem("tasks");
      if (migratedCount > 0) {
        toast.success(`Migrated ${migratedCount} tasks to database`);
      }
    }

    // Migrate reward tiers (admin only)
    if (isAdmin) {
      const savedRewardTiers = localStorage.getItem("rewardTiers");
      if (savedRewardTiers) {
        const localRewardTiers: RewardTier[] = JSON.parse(savedRewardTiers);
        console.log(`Found ${localRewardTiers.length} reward tiers in localStorage`);
        
        let rewardsMigrated = 0;
        for (const tier of localRewardTiers) {
          const { error } = await supabase
            .from('reward_tiers')
            .insert({
              name: tier.name,
              points: tier.points,
              reward: tier.reward,
              description: tier.description
            });

          if (!error || error.message.includes('duplicate key')) {
            rewardsMigrated++;
          } else {
            console.error('Error migrating reward tier:', error);
          }
        }
        
        localStorage.removeItem("rewardTiers");
        if (rewardsMigrated > 0) {
          toast.success(`Migrated ${rewardsMigrated} reward tiers to database`);
        }
      }

      // Migrate monthly target
      const savedMonthlyTarget = localStorage.getItem("monthlyTarget");
      if (savedMonthlyTarget) {
        const localTarget = JSON.parse(savedMonthlyTarget);
        
        const { error } = await supabase
          .from('app_settings')
          .upsert({
            setting_key: 'monthly_target',
            setting_value: localTarget.toString()
          });

        if (!error) {
          localStorage.removeItem("monthlyTarget");
          toast.success('Migrated monthly target to database');
        } else {
          console.error('Error migrating monthly target:', error);
        }
      }
    }

    // Migrate user points
    const savedUserPoints = localStorage.getItem("userPoints");
    if (savedUserPoints) {
      const localUserPoints: Record<string, number> = JSON.parse(savedUserPoints);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      let pointsMigrated = 0;
      for (const [userId, points] of Object.entries(localUserPoints)) {
        const { error } = await supabase
          .from('user_points')
          .upsert({
            user_id: userId,
            points: points,
            month: currentMonth,
            year: currentYear
          });

        if (!error) {
          pointsMigrated++;
        } else {
          console.error('Error migrating user points:', error);
        }
      }
      
      localStorage.removeItem("userPoints");
      if (pointsMigrated > 0) {
        toast.success(`Migrated points for ${pointsMigrated} users to database`);
      }
    }

    console.log('Data migration completed successfully');
    return true;
  } catch (error) {
    console.error('Error during migration:', error);
    toast.error('Failed to migrate some data to database');
    return false;
  }
};
