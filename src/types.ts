export type TimerMode = 'focus' | 'short_break' | 'long_break';
export type TaskPriority = 'high' | 'medium' | 'low';
export type BackgroundMusic = 'none' | 'rainfall' | 'ambient' | 'deepfocus' | 'chill' | 'lofi';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  createdAt: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface PomodoroSession {
  id: string;
  type: TimerMode;
  startTime: number;
  endTime: number;
  durationMinutes: number;
}

export interface DistractionEvent {
  id: string;
  timestamp: number;
  category: string;
  note?: string;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  wins: string;
  distractions: string;
  whatWorked: string;
  improvementPlan: string;
  createdAt: number;
}

export interface UserStats {
  totalFocusMinutesToday: number;
  totalFocusMinutesThisWeek: number;
  streakDays: number;
  lastStudyDate: string | null; // ISO Date string YYYY-MM-DD
  currentLevel: string;
  xp: number; // For progress bar
}

export interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  backgroundMusic: BackgroundMusic;
  musicVolume: number; // 0-100
}

export interface AppState {
  // Timer State
  timerMode: TimerMode;
  isRunning: boolean;
  remainingSeconds: number;
  settings: TimerSettings;
  
  // Data
  tasks: Task[];
  notes: Note[];
  sessions: PomodoroSession[];
  distractions: DistractionEvent[];
  reviews: WeeklyReview[];
  stats: UserStats;
  
  // UI
  theme: 'light' | 'dark';
  taskPriorityFilter: TaskPriority | 'all';
}

export const LEVELS = {
  Bronze: 0, // Minutes per week needed
  Silver: 480, // 8 hours
  Gold: 900, // 15 hours
  Platinum: 1500, // 25 hours
  Diamond: 2400, // 40 hours
  Master: 3600 // 60 hours
};

export type LevelName = keyof typeof LEVELS;