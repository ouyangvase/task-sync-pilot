
import { useState, useEffect } from "react";
import { Task, RewardTier } from "@/types";
import { mockTasks } from "@/data/mockData";
import { DEFAULT_REWARD_TIERS, DEFAULT_MONTHLY_TARGET } from "./rewardConstants";

export function useTaskStorage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>([]);
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks(mockTasks);
      localStorage.setItem("tasks", JSON.stringify(mockTasks));
    }

    const savedRewardTiers = localStorage.getItem("rewardTiers");
    if (savedRewardTiers) {
      setRewardTiers(JSON.parse(savedRewardTiers));
    } else {
      setRewardTiers(DEFAULT_REWARD_TIERS);
      localStorage.setItem("rewardTiers", JSON.stringify(DEFAULT_REWARD_TIERS));
    }

    const savedMonthlyTarget = localStorage.getItem("monthlyTarget");
    if (savedMonthlyTarget) {
      setMonthlyTarget(JSON.parse(savedMonthlyTarget));
    } else {
      setMonthlyTarget(DEFAULT_MONTHLY_TARGET);
      localStorage.setItem("monthlyTarget", JSON.stringify(DEFAULT_MONTHLY_TARGET));
    }

    const savedUserPoints = localStorage.getItem("userPoints");
    if (savedUserPoints) {
      setUserPoints(JSON.parse(savedUserPoints));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("rewardTiers", JSON.stringify(rewardTiers));
  }, [rewardTiers]);

  useEffect(() => {
    localStorage.setItem("monthlyTarget", JSON.stringify(monthlyTarget));
  }, [monthlyTarget]);

  useEffect(() => {
    localStorage.setItem("userPoints", JSON.stringify(userPoints));
  }, [userPoints]);

  return { tasks, setTasks, rewardTiers, setRewardTiers, monthlyTarget, setMonthlyTarget, userPoints, setUserPoints };
}
