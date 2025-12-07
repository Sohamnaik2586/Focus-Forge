import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { formatTime, cn } from '../utils/helpers';
import { Play, Pause, RotateCcw, Settings, Trash2, Plus, Check, Music } from 'lucide-react';
import { TaskPriority } from '../types';

const QUOTES = [
  { text: "Your future is built by today's actions.", author: "Unknown" },
  { text: "Focus is the art of knowing what to ignore.", author: "James Clear" },
  { text: "Amateurs sit and wait for inspiration. The rest of us get up and go to work.", author: "Stephen King" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" }
];

const TIPS = [
  "Try habit stacking: attach a new habit after an existing one.",
  "Eat the frog: Do your hardest task first thing in the morning.",
  "Use the 2-minute rule: If it takes < 2 mins, do it now.",
  "Parkinson's Law: Work expands to fill the time available."
];

export const Dashboard: React.FC = () => {
  const { state, dispatch } = useStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  
  // Randomize quote on mount (stable for render, technically should be state but this is fine)
  const dayOfYear = Math.floor((Date.now() / 86400000));
  const quote = QUOTES[dayOfYear % QUOTES.length];
  const tip = TIPS[dayOfYear % TIPS.length];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      dispatch({ type: 'ADD_TASK', payload: { title: newTask, priority: taskPriority } });
      setNewTask('');
    }
  };

  // Sort and filter tasks
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const filteredTasks = state.taskPriorityFilter === 'all' 
    ? state.tasks 
    : state.tasks.filter(t => t.priority === state.taskPriorityFilter);
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Incomplete tasks first, sorted by priority
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const completedTasks = state.tasks.filter(t => t.isCompleted).length;
  const totalTasks = state.tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPriorityColor = (priority: TaskPriority) => {
    switch(priority) {
      case 'high': return 'bg-danger-600 dark:bg-danger-700';
      case 'medium': return 'bg-warning-600 dark:bg-warning-700';
      case 'low': return 'bg-info-600 dark:bg-info-700';
    }
  };

  const getPriorityLabel = (priority: TaskPriority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      
      {/* Quote Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-light-card dark:bg-gradient-to-r dark:from-primary-700 dark:to-primary-900 rounded-xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-300 dark:bg-white opacity-10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <h2 className="text-xl font-bold mb-2 text-light-text-primary dark:text-white">Daily Inspiration</h2>
          <blockquote className="italic text-lg mb-2 text-light-text-primary dark:text-white">"{quote.text}"</blockquote>
          <cite className="block text-light-text-secondary dark:text-white/80 text-sm mb-4">— {quote.author}</cite>
          <div className="bg-primary-100 dark:bg-white/20 p-3 rounded-lg backdrop-blur-sm inline-block">
            <span className="font-bold text-xs uppercase tracking-wider text-primary-900 dark:text-white">Pro Tip:</span> 
            <span className="ml-2 text-sm text-primary-900 dark:text-white">{tip}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl p-6 shadow-sm border border-light-border dark:border-dark-border flex flex-col justify-center">
          <h3 className="text-light-text-secondary dark:text-dark-text-secondary text-sm font-medium uppercase tracking-wide mb-4">Today's Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {Math.floor(state.stats.totalFocusMinutesToday / 60)}h {state.stats.totalFocusMinutesToday % 60}m
              </div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Focused</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{completionRate}%</div>
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary">Tasks Done</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TIMER CARD */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border p-8 flex flex-col items-center relative">
          <div className="absolute top-4 right-4 flex gap-2">
            <button 
              onClick={() => setShowMusic(!showMusic)}
              className="text-light-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary transition-colors focus-ring"
              title="Music Settings"
            >
              <Music size={20} />
            </button>
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="text-light-text-tertiary hover:text-light-text-secondary dark:hover:text-dark-text-secondary transition-colors focus-ring"
              title="Timer Settings"
            >
              <Settings size={20} />
            </button>
          </div>

          {showMusic && (
            <div className="absolute top-12 right-4 bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-xl border border-light-border dark:border-dark-border z-10 w-64">
              <h4 className="font-bold mb-3 text-sm text-light-text-primary dark:text-dark-text-primary">Background Music</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-light-text-primary dark:text-dark-text-primary block mb-1">Music Type</label>
                  <select 
                    value={state.settings.backgroundMusic}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, backgroundMusic: e.target.value as any }});
                    }}
                    className="input w-full text-sm"
                  >
                    <option value="none">None</option>
                    <option value="rainfall">Rainfall 🌧️</option>
                    <option value="ambient">Forest 🌳</option>
                    <option value="deepfocus">Deep Focus 🎧</option>
                    <option value="chill">Chill Vibes ☁️</option>
                    <option value="lofi">Lofi Study 🎶</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-light-text-primary dark:text-dark-text-primary block mb-1">Volume: {state.settings.musicVolume}%</label>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    className="w-full"
                    value={state.settings.musicVolume}
                    onChange={(e) => {
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, musicVolume: Number(e.target.value) }});
                    }}
                  />
                </div>
                <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary pt-2 border-t border-light-border dark:border-dark-border">
                  🎵 Music plays during focus sessions
                </div>
              </div>
            </div>
          )}

          {showSettings && (
            <div className="absolute top-12 right-4 bg-light-card dark:bg-dark-card p-4 rounded-lg shadow-xl border border-light-border dark:border-dark-border z-10 w-64">
              <h4 className="font-bold mb-3 text-sm text-light-text-primary dark:text-dark-text-primary">Durations (min)</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-primary dark:text-dark-text-primary">Focus</span>
                  <input 
                    type="number" 
                    min="1"
                    max="120"
                    className="input w-16 h-8 p-1"
                    value={state.settings.focusDuration}
                    onChange={(e) => {
                      const val = Math.max(1, Math.min(120, Number(e.target.value)));
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, focusDuration: val }});
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-primary dark:text-dark-text-primary">Short Break</span>
                  <input 
                    type="number" 
                    min="0"
                    max="30"
                    className="input w-16 h-8 p-1"
                    value={state.settings.shortBreakDuration}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(30, Number(e.target.value)));
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, shortBreakDuration: val }});
                    }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-light-text-primary dark:text-dark-text-primary">Long Break</span>
                  <input 
                    type="number" 
                    min="0"
                    max="60"
                    className="input w-16 h-8 p-1"
                    value={state.settings.longBreakDuration}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(60, Number(e.target.value)));
                      dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, longBreakDuration: val }});
                    }}
                  />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
                <h4 className="font-bold mb-3 text-sm text-light-text-primary dark:text-dark-text-primary">Background Music</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-light-text-primary dark:text-dark-text-primary block mb-1">Music Type</label>
                    <select 
                      value={state.settings.backgroundMusic}
                      onChange={(e) => {
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, backgroundMusic: e.target.value as any }});
                      }}
                      className="input w-full text-sm"
                    >
                      <option value="none">None</option>
                      <option value="rainfall">Rainfall 🌧️</option>
                      <option value="seawaves">Sea Waves 🌊</option>
                      <option value="forest">Forest 🌲</option>
                      <option value="lofi">Lofi Study 🎶</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-light-text-primary dark:text-dark-text-primary block mb-1">Volume: {state.settings.musicVolume}%</label>
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      className="w-full"
                      value={state.settings.musicVolume}
                      onChange={(e) => {
                        dispatch({ type: 'UPDATE_SETTINGS', payload: { ...state.settings, musicVolume: Number(e.target.value) }});
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border text-xs text-light-text-secondary dark:text-dark-text-secondary">
                💡 Timers auto-cycle and play a chime when switching modes. Click play to start!
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex space-x-2 bg-light-hover dark:bg-dark-hover p-1 rounded-lg mb-8">
            {(['focus', 'short_break', 'long_break'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => dispatch({ type: 'SET_MODE', payload: mode })}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md capitalize transition-all",
                  state.timerMode === mode 
                    ? "bg-light-card dark:bg-dark-hover shadow-sm text-primary-600 dark:text-primary-400" 
                    : "text-light-text-secondary hover:text-light-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                )}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-7xl md:text-8xl font-mono font-bold tracking-tighter text-light-text-primary dark:text-dark-text-primary mb-8 tabular-nums">
            {formatTime(state.remainingSeconds)}
          </div>

          <div className="text-sm font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-8 animate-pulse">
            {state.isRunning ? (state.timerMode === 'focus' ? 'Focusing...' : 'Resting...') : 'PAUSED'}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_TIMER' })}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg focus-ring",
                state.isRunning ? "bg-warning-100 dark:bg-warning-900/30 text-warning-600 dark:text-warning-400" : "bg-primary-600 dark:bg-primary-700 text-primary-900 dark:text-white hover:bg-primary-700 dark:hover:bg-primary-800"
              )}
            >
              {state.isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            
            <button 
              onClick={() => dispatch({ type: 'RESET_TIMER' })}
              className="w-12 h-12 rounded-full bg-light-hover dark:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary flex items-center justify-center hover:bg-light-border dark:hover:bg-dark-border transition-colors focus-ring"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>

        {/* TASK LIST CARD */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl shadow-sm border border-light-border dark:border-dark-border p-6 flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-light-text-primary dark:text-dark-text-primary">Tasks</h3>
            <span className="text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary">{completedTasks}/{totalTasks} Done</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-light-hover dark:bg-dark-hover h-2 rounded-full mb-6 overflow-hidden">
            <div 
              className="bg-success-600 dark:bg-success-500 h-full transition-all duration-500" 
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>

          {/* Add Task */}
          <form onSubmit={handleAddTask} className="mb-4 space-y-2">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="What needs to be done?" 
                className="input flex-1 m-0"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <select 
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className="input w-32 m-0"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit" className="btn btn-primary p-2">
                <Plus size={20} />
              </button>
            </div>
          </form>

          {/* Priority Filter Chips */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {(['all', 'high', 'medium', 'low'] as const).map(priority => {
              const isActive = state.taskPriorityFilter === priority;
              let bgColor = '#f3f4f6';
              let textColor = '#6b7280';
              let hoverColor = '#e5e7eb';
              
              if (isActive) {
                if (priority === 'all') {
                  bgColor = '#4f46e5'; // primary-700
                  textColor = '#ffffff';
                } else if (priority === 'high') {
                  bgColor = '#dc2626'; // danger-600
                  textColor = '#ffffff';
                } else if (priority === 'medium') {
                  bgColor = '#d97706'; // warning-600
                  textColor = '#ffffff';
                } else {
                  bgColor = '#2563eb'; // info-600
                  textColor = '#ffffff';
                }
              }
              
              return (
                <button
                  key={priority}
                  onClick={() => dispatch({ type: 'SET_TASK_PRIORITY_FILTER', payload: priority })}
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.target as HTMLButtonElement).style.backgroundColor = hoverColor;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
                    }
                  }}
                >
                  {priority === 'all' ? 'All' : getPriorityLabel(priority as TaskPriority)}
                </button>
              );
            })}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {sortedTasks.length === 0 && (
              <div className="text-center text-light-text-tertiary dark:text-dark-text-tertiary py-10 text-sm">
                {state.tasks.length === 0 ? 'No tasks yet. Add one above!' : 'No tasks in this priority.'}
              </div>
            )}
            {sortedTasks.map(task => (
              <div key={task.id} className="group flex items-center justify-between p-3 rounded-lg hover:bg-light-hover dark:hover:bg-dark-hover transition-colors border border-transparent hover:border-light-border dark:hover:border-dark-border">
                <div className="flex items-center gap-3 flex-1">
                  <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", getPriorityColor(task.priority))} title={getPriorityLabel(task.priority)} />
                  <button 
                    onClick={() => dispatch({ type: 'TOGGLE_TASK', payload: task.id })}
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                      task.isCompleted ? "bg-success-600 dark:bg-success-700 border-success-600 dark:border-success-700 text-white dark:text-white" : "border-light-border dark:border-dark-border hover:border-primary-500"
                    )}
                  >
                    {task.isCompleted && <Check size={14} />}
                  </button>
                  <span className={cn("text-sm transition-all text-light-text-primary dark:text-dark-text-primary", task.isCompleted && "text-light-text-tertiary dark:text-dark-text-tertiary line-through")}>{task.title}</span>
                </div>
                <button 
                  onClick={() => dispatch({ type: 'DELETE_TASK', payload: task.id })}
                  className="opacity-0 group-hover:opacity-100 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-600 dark:hover:text-danger-500 transition-all focus-ring shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
