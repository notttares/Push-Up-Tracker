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