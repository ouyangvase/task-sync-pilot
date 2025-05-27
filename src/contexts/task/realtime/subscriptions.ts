
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

  return () => {
    console.log('Cleaning up real-time subscriptions');
    supabase.removeChannel(tasksChannel);
    supabase.removeChannel(pointsChannel);
  };
};
