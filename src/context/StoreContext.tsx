import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { AppState, Note, TimerMode, PomodoroSession, DistractionEvent, WeeklyReview, TimerSettings, TaskPriority } from '../types';
import { generateId, getLevelInfo, playChimeSound, showNotification, formatDateKey, playBackgroundMusic, stopBackgroundMusic } from '../utils/helpers';

// Initial State
const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  backgroundMusic: 'none',
  musicVolume: 50,
};

const initialState: AppState = {
  timerMode: 'focus',
  isRunning: false,
  remainingSeconds: 25 * 60,
  settings: defaultSettings,
  tasks: [],
  notes: [],
  sessions: [],
  distractions: [],
  reviews: [],
  stats: {
    totalFocusMinutesToday: 0,
    totalFocusMinutesThisWeek: 0,
    streakDays: 0,
    lastStudyDate: null,
    currentLevel: 'Bronze',
    xp: 0,
  },
  theme: 'light', // default, will be overridden by system/localStorage
  taskPriorityFilter: 'all',
};

// Actions
type Action =
  | { type: 'INIT_STATE'; payload: AppState }
  | { type: 'TICK' }
  | { type: 'TOGGLE_TIMER' }
  | { type: 'RESET_TIMER' }
  | { type: 'SET_MODE'; payload: TimerMode }
  | { type: 'UPDATE_SETTINGS'; payload: TimerSettings }
  | { type: 'ADD_TASK'; payload: { title: string; priority: TaskPriority } }
  | { type: 'TOGGLE_TASK'; payload: string }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_TASK_PRIORITY_FILTER'; payload: TaskPriority | 'all' }
  | { type: 'ADD_NOTE'; payload: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'LOG_DISTRACTION'; payload: Omit<DistractionEvent, 'id' | 'timestamp'> }
  | { type: 'SAVE_REVIEW'; payload: WeeklyReview }
  | { type: 'COMPLETE_SESSION'; payload: { mode: TimerMode; duration: number } }
  | { type: 'TOGGLE_THEME' };

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INIT_STATE':
      return { ...action.payload };

    case 'TICK':
      if (state.remainingSeconds <= 0) return state;
      return { ...state, remainingSeconds: state.remainingSeconds - 1 };

    case 'TOGGLE_TIMER':
      playChimeSound();
      return { ...state, isRunning: !state.isRunning };

    case 'RESET_TIMER': {
      let duration = state.settings.focusDuration;
      if (state.timerMode === 'short_break') duration = state.settings.shortBreakDuration;
      if (state.timerMode === 'long_break') duration = state.settings.longBreakDuration;
      return { ...state, isRunning: false, remainingSeconds: duration * 60 };
    }

    case 'SET_MODE': {
      let duration = state.settings.focusDuration;
      if (action.payload === 'short_break') duration = state.settings.shortBreakDuration;
      if (action.payload === 'long_break') duration = state.settings.longBreakDuration;
      return {
        ...state,
        timerMode: action.payload,
        isRunning: false,
        remainingSeconds: duration * 60,
      };
    }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };

    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          { id: generateId(), title: action.payload.title, priority: action.payload.priority, isCompleted: false, createdAt: Date.now() },
        ],
      };

    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload ? { ...t, isCompleted: !t.isCompleted } : t
        ),
      };

    case 'SET_TASK_PRIORITY_FILTER':
      return { ...state, taskPriorityFilter: action.payload };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t.id !== action.payload),
      };

    case 'ADD_NOTE': {
      const newNote: Note = {
        id: generateId(),
        ...action.payload,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return { ...state, notes: [newNote, ...state.notes] };
    }

    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map((n) =>
          n.id === action.payload.id ? { ...action.payload, updatedAt: Date.now() } : n
        ).sort((a, b) => b.updatedAt - a.updatedAt),
      };

    case 'DELETE_NOTE':
      return { ...state, notes: state.notes.filter((n) => n.id !== action.payload) };

    case 'LOG_DISTRACTION':
      return {
        ...state,
        distractions: [
          ...state.distractions,
          { id: generateId(), timestamp: Date.now(), ...action.payload },
        ],
      };

    case 'SAVE_REVIEW': {
      const existingIdx = state.reviews.findIndex(r => r.weekStartDate === action.payload.weekStartDate);
      let newReviews = [...state.reviews];
      if (existingIdx > -1) {
        newReviews[existingIdx] = action.payload;
      } else {
        newReviews.push(action.payload);
      }
      return { ...state, reviews: newReviews };
    }

    case 'COMPLETE_SESSION': {
      const { mode, duration } = action.payload;
      const now = Date.now();
      const todayKey = formatDateKey(new Date());

      // Log Session
      const newSession: PomodoroSession = {
        id: generateId(),
        type: mode,
        startTime: now - duration * 60 * 1000,
        endTime: now,
        durationMinutes: duration,
      };

      if (mode !== 'focus') {
        // Break completed, switch to focus and auto-start
        return {
          ...state,
          sessions: [...state.sessions, newSession],
          timerMode: 'focus',
          remainingSeconds: state.settings.focusDuration * 60,
          isRunning: true // Auto-start focus
        };
      }

      // Stats Update Logic
      const newTotalToday = state.stats.totalFocusMinutesToday + duration;
      const newTotalWeek = state.stats.totalFocusMinutesThisWeek + duration;

      // Streak Calculation
      let newStreak = state.stats.streakDays;
      const lastDate = state.stats.lastStudyDate;
      
      if (lastDate === todayKey) {
        // Already studied today, streak stays same
      } else if (lastDate) {
        const d1 = new Date(lastDate);
        const d2 = new Date(todayKey);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1; // Reset if missed a day
        }
      } else {
        newStreak = 1; // First time ever
      }

      const { currentLevel } = getLevelInfo(newTotalWeek);

      // Focus completed, switch to break and auto-start
      return {
        ...state,
        sessions: [...state.sessions, newSession],
        timerMode: 'short_break',
        remainingSeconds: state.settings.shortBreakDuration * 60,
        isRunning: true, // Auto-start break
        stats: {
          ...state.stats,
          totalFocusMinutesToday: newTotalToday,
          totalFocusMinutesThisWeek: newTotalWeek,
          streakDays: newStreak,
          lastStudyDate: todayKey,
          currentLevel: currentLevel
        }
      };
    }

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    default:
      return state;
  }
};

// Context
interface StoreContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const timerRef = useRef<number | null>(null);
  const prevModeRef = useRef<TimerMode | null>(null);

  // Initialize theme on mount
  useEffect(() => {
    const saved = localStorage.getItem('focusforge-data');
    let initialTheme = 'light';
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        initialTheme = parsed.theme || 'light';
      } catch (e) {
        console.error("Failed to load theme", e);
      }
    } else {
      // Check system preference on first load
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      }
    }
    
    // Apply initial theme
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('focusforge-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recalculate daily stats on load to ensure "Today" is accurate
        const todayKey = formatDateKey(new Date());
        
        // Filter sessions for today
        const todaySessions = parsed.sessions?.filter((s: PomodoroSession) => 
          s.type === 'focus' && formatDateKey(new Date(s.endTime)) === todayKey
        ) || [];
        
        const focusToday = todaySessions.reduce((acc: number, s: PomodoroSession) => acc + s.durationMinutes, 0);

        // Filter for this week (Simple approximation: last 7 days for prototype)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const weekSessions = parsed.sessions?.filter((s: PomodoroSession) => 
          s.type === 'focus' && s.endTime > weekAgo
        ) || [];
        const focusWeek = weekSessions.reduce((acc: number, s: PomodoroSession) => acc + s.durationMinutes, 0);

        const { currentLevel } = getLevelInfo(focusWeek);

        const merged: AppState = {
          ...initialState,
          ...parsed,
          isRunning: false, // Always pause on reload
          stats: {
            ...parsed.stats,
            totalFocusMinutesToday: focusToday,
            totalFocusMinutesThisWeek: focusWeek,
            currentLevel
          }
        };
        dispatch({ type: 'INIT_STATE', payload: merged });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('focusforge-data', JSON.stringify(state));
  }, [state]);

  // Apply theme to document immediately and whenever it changes
  useEffect(() => {
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    };
    
    applyTheme(state.theme === 'dark');
  }, [state.theme]);

  // Timer Tick
  useEffect(() => {
    if (state.isRunning && state.remainingSeconds > 0) {
      timerRef.current = window.setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (state.remainingSeconds === 0 && state.isRunning) {
      // Timer finished
      let duration = 0;
      if (state.timerMode === 'focus') duration = state.settings.focusDuration;
      else if (state.timerMode === 'short_break') duration = state.settings.shortBreakDuration;
      else duration = state.settings.longBreakDuration;

      dispatch({ type: 'COMPLETE_SESSION', payload: { mode: state.timerMode, duration } });
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.remainingSeconds, state.timerMode, state.settings]);

  // Play chime and show notifications when mode changes
  useEffect(() => {
    // Only trigger when timer mode changes (skip initial null state)
    if (prevModeRef.current !== null && state.timerMode !== prevModeRef.current) {
      playChimeSound();
      if (state.timerMode === 'focus') {
        showNotification('🎯 Focus Session Starts!', 'success');
      } else {
        showNotification('☕ Take a Break', 'info');
      }
    }
    prevModeRef.current = state.timerMode;
  }, [state.timerMode]);

  // Control background music based on timer state
  useEffect(() => {
    if (state.timerMode === 'focus' && state.isRunning) {
      // Play background music during focus sessions
      playBackgroundMusic(state.settings.backgroundMusic, state.settings.musicVolume);
    } else {
      // Stop music during breaks or when paused
      stopBackgroundMusic();
    }

    return () => {
      stopBackgroundMusic();
    };
  }, [state.timerMode, state.isRunning, state.settings.backgroundMusic, state.settings.musicVolume]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within AppProvider');
  return context;
};
