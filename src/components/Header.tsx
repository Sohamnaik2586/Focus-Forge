import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, Flame, CheckSquare, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const { state, dispatch } = useStore();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.substring(1);
    if (!path) return 'Dashboard';
    return path.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const tasksLeft = state.tasks.filter(t => !t.isCompleted).length;
  const hours = Math.floor(state.stats.totalFocusMinutesToday / 60);
  const mins = state.stats.totalFocusMinutesToday % 60;

  return (
    <header className="h-16 bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border flex items-center justify-between px-6 md:px-10 sticky top-0 z-20 shadow-sm">
      <h1 className="text-xl font-bold hidden md:block md:pl-0 pl-12 text-light-text-primary dark:text-dark-text-primary">
        {getPageTitle()}
      </h1>

      <div className="flex items-center space-x-4 md:space-x-8 ml-auto">
        {/* Stats Strip */}
        <div className="flex items-center space-x-4 text-sm font-medium">
          <div className="flex items-center text-warning-600 dark:text-warning-400" title="Current Streak">
            <Flame className="w-4 h-4 mr-1 fill-current" />
            <span>{state.stats.streakDays} Day{state.stats.streakDays !== 1 && 's'}</span>
          </div>

          <div className="hidden sm:flex items-center text-info-600 dark:text-info-400" title="Pending Tasks">
            <CheckSquare className="w-4 h-4 mr-1" />
            <span>{tasksLeft} Left</span>
          </div>

          <div className="hidden sm:flex items-center text-success-600 dark:text-success-400" title="Focus Time Today">
            <Clock className="w-4 h-4 mr-1" />
            <span>{hours}h {mins}m</span>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="p-2 rounded-full hover:bg-light-hover dark:hover:bg-dark-hover transition-colors focus-ring"
          aria-label="Toggle Theme"
        >
          {state.theme === 'light' ? (
            <Sun className="w-5 h-5 text-warning-500" />
          ) : (
            <Moon className="w-5 h-5 text-primary-300" />
          )}
        </button>
      </div>
    </header>
  );
};
