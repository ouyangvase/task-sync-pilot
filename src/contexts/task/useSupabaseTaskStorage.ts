
import { useState, useEffect } from "react";
import { Task, RewardTier } from "@/types";
import { useAuth } from "../AuthContext";
import { toast } from "@/components/ui/sonner";
import { 
  saveTaskToDatabase, 
  updateMonthlyTargetInDatabase, 
  updateUserPointsInDatabase,
  saveRewardTierToDatabase 
} from "./database/taskOperations";
import { 
  loadTasks, 
  loadRewardTiers, 
  loadUserPoints, 
  loadMonthlyTarget 
} from "./database/dataLoaders";
import { setupRealtimeSubscriptions } from "./realtime/subscriptions";
import { initializeDefaultData } from "./initialization/defaultData";

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

  // Load individual data sets
  const loadTasksData = async () => {
    if (!currentUser) return;
    const tasksData = await loadTasks(currentUser);
    setTasks(tasksData);
  };

  const loadRewardTiersData = async () => {
    const tiersData = await loadRewardTiers();
    setRewardTiers(tiersData);
  };

  const loadUserPointsData = async () => {
    const pointsData = await loadUserPoints();
    setUserPoints(pointsData);
  };

  const loadMonthlyTargetData = async () => {
    const targetData = await loadMonthlyTarget();
    setMonthlyTarget(targetData);
  };

  // Load all data from Supabase
  const loadAllData = async () => {
    if (!currentUser) return;
    
    console.log('Loading all data for user:', currentUser.id);
    setLoading(true);
    try {
      await Promise.all([
        loadTasksData(),
        loadRewardTiersData(),
        loadUserPointsData(),
        loadMonthlyTargetData(),
        initializeDefaultData(currentUser)
      ]);
      console.log('All data loaded successfully');
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data from database');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      setLoading(false);
      return;
    }
    loadAllData();
  }, [currentUser, authLoading, refreshKey]);

  // Set up real-time subscriptions
  useEffect(() => {
    return setupRealtimeSubscriptions(
      currentUser,
      authLoading,
      loadTasksData,
      loadUserPointsData,
      forceRefresh
    );
  }, [currentUser, authLoading]);

  // Enhanced save functions with immediate refresh
  const enhancedSaveTaskToDatabase = async (task: Omit<Task, "id"> | Task) => {
    const result = await saveTaskToDatabase(task, currentUser?.id);
    forceRefresh();
    return result;
  };

  const enhancedUpdateUserPointsInDatabase = async (userId: string, points: number) => {
    const result = await updateUserPointsInDatabase(userId, points);
    forceRefresh();
    return result;
  };

  const enhancedUpdateMonthlyTargetInDatabase = async (target: number) => {
    const result = await updateMonthlyTargetInDatabase(target);
    forceRefresh();
    return result;
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
    saveTaskToDatabase: enhancedSaveTaskToDatabase,
    saveRewardTierToDatabase,
    updateMonthlyTargetInDatabase: enhancedUpdateMonthlyTargetInDatabase,
    updateUserPointsInDatabase: enhancedUpdateUserPointsInDatabase,
    forceRefresh
  };
}
