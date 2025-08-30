export interface WorkoutSet {
  id: string;
  reps: number;
  timestamp: number;
}

export interface DayWorkout {
  date: string; // YYYY-MM-DD
  sets: WorkoutSet[];
  totalReps: number;
}

export interface WeightEntry {
  id: string;
  weight: number; // kg
  date: string; // YYYY-MM-DD
  timestamp: number;
}

export interface UserProfile {
  height: number; // cm
  weight: number; // kg
  age: number;
  gender: 'male' | 'female';
  maxReps?: number;
  createdAt: number;
}

export interface WeeklyStats {
  weekStart: string; // YYYY-MM-DD
  totalReps: number;
  totalSets: number;
  averageReps: number;
  bestDay: number;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  photo?: string;
  givenName?: string;
  familyName?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // emoji or icon name
  category: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'legendary';
  requirement: {
    type: 'total_reps' | 'single_set' | 'daily_streak' | 'weekly_total' | 'monthly_total' | 'consistency' | 'improvement' | 'daily_sets';
    value: number;
    timeframe?: 'day' | 'week' | 'month' | 'all_time';
  };
  unlockedAt?: number;
  progress?: number; // 0-100
}

export interface StreakData {
  current: number;
  longest: number;
  lastWorkoutDate?: string;
}