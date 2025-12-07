import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, BarChart2, Notebook, CalendarCheck, Menu, X, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/helpers';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { path: '/analytics', label: 'Analytics', icon: BarChart2 },
  { path: '/notes', label: 'Notes', icon: Notebook },
  { path: '/weekly-review', label: 'Weekly Review', icon: CalendarCheck },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Hamburger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-light-card dark:bg-dark-card shadow-md md:hidden focus-ring"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-light-border dark:border-dark-border">
            <CheckCircle2 className="w-8 h-8 text-primary-600 dark:text-primary-400 mr-2" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
              FocusForge
            </span>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center px-4 py-3 rounded-lg transition-all duration-200 group focus-ring",
                  isActive 
                    ? "bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-medium shadow-sm" 
                    : "text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-hover dark:hover:bg-dark-hover"
                )}
              >
                <Icon className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                {label}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 text-xs text-center text-light-text-tertiary dark:text-dark-text-tertiary">
            v1.0.0 Alpha
          </div>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 dark:bg-black/60 z-30 md:hidden transition-colors"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
