export type WeightUnit = 'kg' | 'lb';

export type DailyStatusLabel = 'Strong Day' | 'Good Day' | 'Weak Day' | 'Bad Day' | 'Not Recorded';

export interface ScoreBreakdown {
  physical: {
    workout: number;      // max 10
    movement: number;     // max 5
    nutrition: number;    // max 5
    water: number;        // max 5
    sleep: number;        // max 5
    total: number;        // max 30
  };
  mental: {
    scrolling: number;    // max 10
    gaming: number;       // max 5 (partial scoring based on config)
    meditation: number;   // max 5
    reading: number;      // max 5
    promises: number;     // max 10
    total: number;        // max 35
  };
  learning: {
    deepWork: number;     // max 20
    deepWorkHours: number;// max 10
    learningDone: number; // max 5
    total: number;        // max 35
  };
  totalScore: number;     // max 100
  status: DailyStatusLabel;
}

export interface DailyRecord {
  date: string; // ISO format YYYY-MM-DD
  
  // Physical (30 pts max)
  workout: boolean;
  movement: boolean;
  nutrition: boolean;
  water: boolean;
  sleepHours: number;
  weight?: number; // Body tracking only (excluded from score)

  // Mental & Discipline (35 pts max)
  scrollingControlled: boolean;
  scrollingMinutes?: number; // Doom scrolling duration in minutes
  gamingMinutes: number;
  meditation: boolean;
  reading: boolean;
  promisesKept: boolean;

  // Learning / Career (35 pts max)
  deepWork: boolean;
  deepWorkHours: number;
  workDescription: string;
  learning: string;

  // Daily Reflection
  biggestWin: string;
  biggestDistraction: string;
  tomorrowFocus: string;

  // Calculated fields
  score: number;
  status: DailyStatusLabel;
  updatedAt: string;
}

export interface UserSettings {
  startDate: string; // YYYY-MM-DD
  maxScrollingTargetMinutes?: number; // default: 30 min max
  gamingTargetMinutes: number; // default: 60 min
  deepWorkTargetHours: number; // default: 4 hrs
  readingTargetMinutes: number; // default: 30 min
  sleepTargetHours: number; // default: 7.5 hrs
  waterTargetLiters: number; // default: 3 L
  weightUnit: WeightUnit;
  theme: 'dark' | 'system';
}

export type NavigationTab = 
  | 'dashboard'
  | 'today'
  | 'calendar'
  | 'habits'
  | 'analytics'
  | 'journal'
  | 'milestones'
  | 'settings';

export interface HabitDefinition {
  id: string;
  name: string;
  category: 'Physical' | 'Mental' | 'Learning';
  icon: string;
  description: string;
  targetUnit: string;
}

export interface WeeklyReviewData {
  weekNumber: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  recordedDays: number;
  weeklyScore: number;
  avgScore: number;
  workoutDays: number;
  avgSleep: number;
  avgGaming: number;
  avgScreenTime: number; // Percentage of scrolling controlled days or inverse
  deepWorkHours: number;
  readingDays: number;
  successfulDays: number; // score >= 70
  missedDays: number;
  strongestHabit: string;
  weakestHabit: string;
  mainImprovementArea: string;
}

export interface MilestoneCheckpoint {
  targetDay: 30 | 60 | 90;
  label: string;
  isUnlocked: boolean;
  startingWeight?: number;
  currentWeight?: number;
  avgScore: number;
  workoutConsistencyPct: number;
  avgGamingMinutes: number;
  scrollingControlledPct: number;
  totalDeepWorkHours: number;
  readingConsistencyPct: number;
  longestStreak: number;
  successfulDays: number;
}
