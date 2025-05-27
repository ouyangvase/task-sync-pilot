
import { supabase } from "@/integrations/supabase/client";

export const setupRealtimeSubscriptions = (
  currentUser: any,
  authLoading: boolean,
  onTasksUpdate: () => void,
  onPointsUpdate: () => void,
  forceRefresh: () => void
) => {
  if (!currentUser || authLoading) return () => {};

  console.log('Setting up real-time subscriptions for user:', currentUser.id);

  const tasksChannel = supabase
    .channel('tasks-realtime')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'tasks' },
      (payload) => {
        console.log('Tasks real-time update:', payload);
        onTasksUpdate();
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
        onPointsUpdate();
        forceRefresh();
      }
    )
    .subscribe();

  const rewardTiersChannel = supabase
    .channel('reward-tiers-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'reward_tiers' },
      (payload) => {
        console.log('Reward tiers real-time update:', payload);
        forceRefresh();
      }
    )
    .subscribe();

  const appSettingsChannel = supabase
    .channel('app-settings-realtime')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'app_settings' },
      (payload) => {
        console.log('App settings real-time update:', payload);
        forceRefresh();
      }
    )
    .subscribe();

  return () => {
    console.log('Cleaning up real-time subscriptions');
    supabase.removeChannel(tasksChannel);
    supabase.removeChannel(pointsChannel);
    supabase.removeChannel(rewardTiersChannel);
    supabase.removeChannel(appSettingsChannel);
  };
};
