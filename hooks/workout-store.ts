import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo } from 'react';
import { DayWorkout, WorkoutSet, UserProfile, WeeklyStats, WeightEntry, GoogleUser, Achievement, StreakData } from '@/types/workout';
import { ACHIEVEMENTS } from '@/constants/achievements';

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  PROFILE: 'profile',
  WEIGHTS: 'weights',
  GOOGLE_USER: 'google_user',
  ACHIEVEMENTS: 'achievements',
  STREAK: 'streak',
};

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workouts, setWorkouts] = useState<DayWorkout[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsData, profileData, weightsData, googleUserData, achievementsData, streakData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.WEIGHTS),
        AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_USER),
        AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS),
        AsyncStorage.getItem(STORAGE_KEYS.STREAK),
      ]);

      if (workoutsData) {
        setWorkouts(JSON.parse(workoutsData));
      }
      if (profileData) {
        setProfile(JSON.parse(profileData));
      }
      if (weightsData) {
        setWeights(JSON.parse(weightsData));
      }
      if (googleUserData) {
        setGoogleUser(JSON.parse(googleUserData));
      }
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      }
      if (streakData) {
        setStreak(JSON.parse(streakData));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveWorkouts = async (newWorkouts: DayWorkout[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(newWorkouts));
      setWorkouts(newWorkouts);
    } catch (error) {
      console.error('Error saving workouts:', error);
    }
  };

  const saveProfile = async (newProfile: UserProfile) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(newProfile));
      setProfile(newProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const addWorkoutSet = (reps: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      reps,
      timestamp: Date.now(),
    };

    const updatedWorkouts = [...workouts];
    const todayIndex = updatedWorkouts.findIndex(w => w.date === today);

    if (todayIndex >= 0) {
      updatedWorkouts[todayIndex].sets.push(newSet);
      updatedWorkouts[todayIndex].totalReps += reps;
    } else {
      updatedWorkouts.push({
        date: today,
        sets: [newSet],
        totalReps: reps,
      });
    }

    saveWorkouts(updatedWorkouts);
    updateStreak();
    checkAchievements(updatedWorkouts);
  };

  const removeWorkoutSet = (setId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updatedWorkouts = [...workouts];
    const todayIndex = updatedWorkouts.findIndex(w => w.date === today);

    if (todayIndex >= 0) {
      const setToRemove = updatedWorkouts[todayIndex].sets.find(s => s.id === setId);
      if (setToRemove) {
        updatedWorkouts[todayIndex].sets = updatedWorkouts[todayIndex].sets.filter(s => s.id !== setId);
        updatedWorkouts[todayIndex].totalReps -= setToRemove.reps;
        
        // Remove the day if no sets left
        if (updatedWorkouts[todayIndex].sets.length === 0) {
          updatedWorkouts.splice(todayIndex, 1);
        }
        
        saveWorkouts(updatedWorkouts);
      }
    }
  };

  const updateMaxReps = (maxReps: number) => {
    if (profile) {
      const updatedProfile = { ...profile, maxReps };
      saveProfile(updatedProfile);
    }
  };

  const addWeightEntry = async (weight: number) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      weight,
      date: today,
      timestamp: Date.now(),
    };

    // Remove existing entry for today if exists
    const updatedWeights = weights.filter(w => w.date !== today);
    updatedWeights.push(newEntry);
    updatedWeights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WEIGHTS, JSON.stringify(updatedWeights));
      setWeights(updatedWeights);
      
      // Update profile weight
      if (profile) {
        const updatedProfile = { ...profile, weight };
        saveProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error saving weight:', error);
    }
  };

  const getWeightProgress = () => {
    if (weights.length < 2) return null;
    
    const latest = weights[0];
    const previous = weights[1];
    const change = latest.weight - previous.weight;
    
    return {
      current: latest.weight,
      previous: previous.weight,
      change,
      changePercent: Math.round((change / previous.weight) * 100 * 10) / 10,
      isImprovement: change <= 0, // Weight loss is improvement
    };
  };

  const setWeightGoal = async (target: number, type: 'lose' | 'gain') => {
    if (!profile) return;
    
    const updatedProfile = {
      ...profile,
      weightGoal: {
        target,
        type,
        startWeight: profile.weight,
        startDate: new Date().toISOString().split('T')[0],
      },
    };
    
    await saveProfile(updatedProfile);
  };

  const getWeightGoalProgress = () => {
    if (!profile?.weightGoal || weights.length === 0) return null;
    
    const currentWeight = weights[0].weight;
    const { target, startWeight, type } = profile.weightGoal;
    
    const totalChange = Math.abs(target - startWeight);
    const currentChange = Math.abs(currentWeight - startWeight);
    const progress = Math.min(100, (currentChange / totalChange) * 100);
    
    const isOnTrack = type === 'lose' 
      ? currentWeight <= startWeight 
      : currentWeight >= startWeight;
    
    return {
      progress: Math.round(progress * 10) / 10,
      currentWeight,
      targetWeight: target,
      startWeight,
      remainingWeight: Math.abs(target - currentWeight),
      isOnTrack,
      type,
    };
  };

  const getFilteredWeights = (period: '30d' | '60d' | '90d' | '1y' | 'all') => {
    if (period === 'all') return weights;
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (period) {
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '60d':
        cutoffDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return weights;
    }
    
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];
    return weights.filter(w => w.date >= cutoffDateStr);
  };

  // Get today's workout
  const todayWorkout = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return workouts.find(w => w.date === today) || { date: today, sets: [], totalReps: 0 };
  }, [workouts]);

  // Get weekly stats
  const weeklyStats = useMemo((): WeeklyStats[] => {
    const weeks: { [key: string]: DayWorkout[] } = {};
    
    workouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = [];
      }
      weeks[weekKey].push(workout);
    });

    return Object.entries(weeks).map(([weekStart, weekWorkouts]) => {
      const totalReps = weekWorkouts.reduce((sum, w) => sum + w.totalReps, 0);
      const totalSets = weekWorkouts.reduce((sum, w) => sum + w.sets.length, 0);
      const bestDay = Math.max(...weekWorkouts.map(w => w.totalReps));

      return {
        weekStart,
        totalReps,
        totalSets,
        averageReps: totalSets > 0 ? Math.round(totalReps / totalSets) : 0,
        bestDay,
      };
    }).sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime());
  }, [workouts]);

  // Get user percentile based on max reps
  const getUserPercentile = (maxReps: number): number => {
    if (!profile) return 0;
    
    // More realistic percentile calculation based on age and gender
    let basePercentile = 0;
    
    if (profile.gender === 'male') {
      if (maxReps >= 100) basePercentile = 95;
      else if (maxReps >= 80) basePercentile = 90;
      else if (maxReps >= 60) basePercentile = 85;
      else if (maxReps >= 50) basePercentile = 80;
      else if (maxReps >= 40) basePercentile = 70;
      else if (maxReps >= 30) basePercentile = 60;
      else if (maxReps >= 25) basePercentile = 50;
      else if (maxReps >= 20) basePercentile = 40;
      else if (maxReps >= 15) basePercentile = 30;
      else if (maxReps >= 10) basePercentile = 20;
      else if (maxReps >= 5) basePercentile = 10;
      else basePercentile = 5;
    } else {
      if (maxReps >= 60) basePercentile = 95;
      else if (maxReps >= 45) basePercentile = 90;
      else if (maxReps >= 35) basePercentile = 85;
      else if (maxReps >= 30) basePercentile = 80;
      else if (maxReps >= 25) basePercentile = 70;
      else if (maxReps >= 20) basePercentile = 60;
      else if (maxReps >= 15) basePercentile = 50;
      else if (maxReps >= 12) basePercentile = 40;
      else if (maxReps >= 10) basePercentile = 30;
      else if (maxReps >= 8) basePercentile = 20;
      else if (maxReps >= 5) basePercentile = 10;
      else basePercentile = 5;
    }

    // Adjust for age (older people have lower expectations)
    if (profile.age > 50) basePercentile += 10;
    else if (profile.age > 40) basePercentile += 5;
    else if (profile.age < 25) basePercentile -= 5;

    return Math.min(95, Math.max(5, basePercentile));
  };

  const updateStreak = async () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const todayWorkout = workouts.find(w => w.date === today);
    const hasWorkedOutToday = todayWorkout && todayWorkout.sets.length > 0;
    
    if (hasWorkedOutToday) {
      let newCurrent = 1;
      
      if (streak.lastWorkoutDate === yesterday) {
        newCurrent = streak.current + 1;
      } else if (streak.lastWorkoutDate === today) {
        newCurrent = streak.current;
      }
      
      const newStreak: StreakData = {
        current: newCurrent,
        longest: Math.max(streak.longest, newCurrent),
        lastWorkoutDate: today,
      };
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(newStreak));
        setStreak(newStreak);
      } catch (error) {
        console.error('Error saving streak:', error);
      }
    } else if (streak.lastWorkoutDate && streak.lastWorkoutDate !== today && streak.lastWorkoutDate !== yesterday) {
      const newStreak: StreakData = {
        current: 0,
        longest: streak.longest,
        lastWorkoutDate: streak.lastWorkoutDate,
      };
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(newStreak));
        setStreak(newStreak);
      } catch (error) {
        console.error('Error saving streak:', error);
      }
    }
  };

  const checkAchievements = async (updatedWorkouts: DayWorkout[]) => {
    const newUnlockedAchievements: Achievement[] = [];
    
    for (const achievement of ACHIEVEMENTS) {
      const existingAchievement = achievements.find(a => a.id === achievement.id);
      if (existingAchievement?.unlockedAt) continue;
      
      let isUnlocked = false;
      let progress = 0;
      
      switch (achievement.requirement.type) {
        case 'total_reps':
          const totalReps = updatedWorkouts.reduce((sum, w) => sum + w.totalReps, 0);
          progress = Math.min(100, (totalReps / achievement.requirement.value) * 100);
          isUnlocked = totalReps >= achievement.requirement.value;
          break;
          
        case 'single_set':
          const maxSingleSet = Math.max(...updatedWorkouts.flatMap(w => w.sets.map(s => s.reps)), 0);
          progress = Math.min(100, (maxSingleSet / achievement.requirement.value) * 100);
          isUnlocked = maxSingleSet >= achievement.requirement.value;
          break;
          
        case 'daily_streak':
          progress = Math.min(100, (streak.current / achievement.requirement.value) * 100);
          isUnlocked = streak.current >= achievement.requirement.value;
          break;
          
        case 'daily_sets':
          const today = new Date().toISOString().split('T')[0];
          const todayWorkout = updatedWorkouts.find(w => w.date === today);
          const todaySets = todayWorkout?.sets.length || 0;
          progress = Math.min(100, (todaySets / achievement.requirement.value) * 100);
          isUnlocked = todaySets >= achievement.requirement.value;
          break;
          
        case 'weekly_total':
          if (achievement.requirement.timeframe === 'day') {
            const today = new Date().toISOString().split('T')[0];
            const todayWorkout = updatedWorkouts.find(w => w.date === today);
            const todayReps = todayWorkout?.totalReps || 0;
            progress = Math.min(100, (todayReps / achievement.requirement.value) * 100);
            isUnlocked = todayReps >= achievement.requirement.value;
          } else if (achievement.requirement.timeframe === 'week') {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekStartStr = weekStart.toISOString().split('T')[0];
            
            const weekReps = updatedWorkouts
              .filter(w => w.date >= weekStartStr)
              .reduce((sum, w) => sum + w.totalReps, 0);
            
            progress = Math.min(100, (weekReps / achievement.requirement.value) * 100);
            isUnlocked = weekReps >= achievement.requirement.value;
          }
          break;
      }
      
      const updatedAchievement: Achievement = {
        ...achievement,
        progress,
        unlockedAt: isUnlocked ? Date.now() : undefined,
      };
      
      if (isUnlocked && !existingAchievement?.unlockedAt) {
        newUnlockedAchievements.push(updatedAchievement);
      }
      
      const existingIndex = achievements.findIndex(a => a.id === achievement.id);
      if (existingIndex >= 0) {
        achievements[existingIndex] = updatedAchievement;
      } else {
        achievements.push(updatedAchievement);
      }
    }
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
      setAchievements([...achievements]);
      
      if (newUnlockedAchievements.length > 0) {
        console.log('New achievements unlocked:', newUnlockedAchievements.map(a => a.title));
      }
    } catch (error) {
      console.error('Error saving achievements:', error);
    }
  };

  const getUnlockedAchievements = () => {
    return getAllAchievements().filter(a => a.unlockedAt).sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));
  };

  const getLockedAchievements = () => {
    return getAllAchievements().filter(a => !a.unlockedAt).sort((a, b) => (b.progress || 0) - (a.progress || 0));
  };

  const getAllAchievements = () => {
    // Merge all achievements from constants with user progress
    return ACHIEVEMENTS.map(achievement => {
      const userAchievement = achievements.find(a => a.id === achievement.id);
      return userAchievement || { ...achievement, progress: 0 };
    });
  };

  const signInWithGoogle = async () => {
    // Mock Google Sign-In for demo purposes
    // In a real app, you would use @react-native-google-signin/google-signin
    try {
      const mockUser: GoogleUser = {
        id: 'mock_user_123',
        email: 'user@example.com',
        name: 'Пользователь Demo',
        photo: 'https://via.placeholder.com/100',
        givenName: 'Пользователь',
        familyName: 'Demo',
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.GOOGLE_USER, JSON.stringify(mockUser));
      setGoogleUser(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.GOOGLE_USER);
      setGoogleUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    workouts,
    profile,
    weights,
    isLoading,
    todayWorkout,
    weeklyStats,
    addWorkoutSet,
    removeWorkoutSet,
    saveProfile,
    updateMaxReps,
    addWeightEntry,
    getWeightProgress,
    setWeightGoal,
    getWeightGoalProgress,
    getFilteredWeights,
    getUserPercentile,
    googleUser,
    signInWithGoogle,
    signOut,
    achievements,
    streak,
    getUnlockedAchievements,
    getLockedAchievements,
    getAllAchievements,
    updateStreak,
    checkAchievements,
  };
});