import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo } from 'react';
import { DayWorkout, WorkoutSet, UserProfile, WeeklyStats, WeightEntry, GoogleUser } from '@/types/workout';

const STORAGE_KEYS = {
  WORKOUTS: 'workouts',
  PROFILE: 'profile',
  WEIGHTS: 'weights',
  GOOGLE_USER: 'google_user',
};

export const [WorkoutProvider, useWorkout] = createContextHook(() => {
  const [workouts, setWorkouts] = useState<DayWorkout[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsData, profileData, weightsData, googleUserData] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS),
        AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.WEIGHTS),
        AsyncStorage.getItem(STORAGE_KEYS.GOOGLE_USER),
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
    getUserPercentile,
    googleUser,
    signInWithGoogle,
    signOut,
  };
});