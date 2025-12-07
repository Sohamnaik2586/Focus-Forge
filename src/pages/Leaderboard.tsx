import React, { useEffect, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Medal, Crown } from 'lucide-react';
import { LevelName } from '../types';
import { cn } from '../utils/helpers';

interface LeaderboardUser {
  id: string;
  name: string;
  focusHours: number;
  streak: number;
  completionRate: number;
  level: LevelName;
  score: number;
  isCurrentUser?: boolean;
}

const MOCK_USERS = [
  { id: '1', name: "Alice Chen", focusHours: 22.5, streak: 12, completionRate: 95, level: 'Gold' },
  { id: '2', name: "Marcus Johnson", focusHours: 18.2, streak: 5, completionRate: 80, level: 'Silver' },
  { id: '3', name: "Sarah Smith", focusHours: 42.0, streak: 45, completionRate: 98, level: 'Diamond' },
  { id: '4', name: "David Kim", focusHours: 8.5, streak: 2, completionRate: 60, level: 'Bronze' },
  { id: '5', name: "Elena Rodriguez", focusHours: 30.1, streak: 20, completionRate: 90, level: 'Platinum' },
] as const;

export const Leaderboard: React.FC = () => {
  const { state } = useStore();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    // Calculate current user stats
    const myHours = Number((state.stats.totalFocusMinutesThisWeek / 60).toFixed(1));
    const myStreak = state.stats.streakDays;
    const completedTasks = state.tasks.filter(t => t.isCompleted).length;
    const totalTasks = state.tasks.length;
    const myRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Score formula: Hours * 10 + Streak * 5 + Rate * 0.5
    const calculateScore = (h: number, s: number, r: number) => Math.round((h * 10) + (s * 5) + (r * 0.5));

    const currentUser: LeaderboardUser = {
      id: 'me',
      name: 'You',
      focusHours: myHours,
      streak: myStreak,
      completionRate: myRate,
      level: state.stats.currentLevel as LevelName,
      score: calculateScore(myHours, myStreak, myRate),
      isCurrentUser: true
    };

    const mockUsersFormatted: LeaderboardUser[] = MOCK_USERS.map(u => ({
      ...u,
      score: calculateScore(u.focusHours, u.streak, u.completionRate),
      level: u.level as LevelName
    }));

    const allUsers = [...mockUsersFormatted, currentUser].sort((a, b) => b.score - a.score);
    setUsers(allUsers);
  }, [state.stats, state.tasks]);

  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Crown className="w-6 h-6 text-amber-400 fill-current" />;
    if (rank === 1) return <Medal className="w-6 h-6 text-slate-400 fill-current" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-amber-700 fill-current" />;
    return <span className="font-bold text-gray-400 w-6 text-center">{rank + 1}</span>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent inline-block">
          Weekly Leaderboard
        </h2>
        <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Compete with focus, consistency, and completion.</p>
      </div>

      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden border border-light-border dark:border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light-hover dark:bg-dark-hover text-xs uppercase text-light-text-secondary dark:text-dark-text-secondary font-semibold tracking-wider">
                <th className="p-5 text-center w-16">Rank</th>
                <th className="p-5">User</th>
                <th className="p-5 text-center">Level</th>
                <th className="p-5 text-right">Hours</th>
                <th className="p-5 text-center">Streak</th>
                <th className="p-5 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border dark:divide-dark-border">
              {users.map((user, index) => (
                <tr 
                  key={user.id} 
                  className={cn(
                    "transition-colors",
                    user.isCurrentUser ? "bg-primary-50 dark:bg-primary-900/20" : "hover:bg-light-hover dark:hover:bg-dark-hover"
                  )}
                >
                  <td className="p-5 flex justify-center items-center">
                    {getRankIcon(index)}
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-light-text-primary dark:text-dark-text-primary">
                      {user.name} {user.isCurrentUser && <span className="ml-2 text-xs bg-primary-600 dark:bg-primary-700 text-primary-900 dark:text-white px-2 py-0.5 rounded-full">YOU</span>}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border",
                      user.level === 'Gold' || user.level === 'Platinum' || user.level === 'Diamond' || user.level === 'Master'
                        ? "bg-warning-100 dark:bg-warning-900/30 text-warning-700 dark:text-warning-400 border-warning-200 dark:border-warning-700"
                        : user.level === 'Silver' ? "bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700" : "bg-danger-50 dark:bg-danger-900/30 text-danger-700 dark:text-danger-400 border-danger-200 dark:border-danger-700"
                    )}>
                      {user.level}
                    </span>
                  </td>
                  <td className="p-5 text-right font-mono text-light-text-secondary dark:text-dark-text-secondary">
                    {user.focusHours}h
                  </td>
                  <td className="p-5 text-center">
                    <span className="flex items-center justify-center text-warning-500 dark:text-warning-400 font-bold">
                      <span className="mr-1">🔥</span> {user.streak}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <span className="font-bold text-primary-600 dark:text-primary-400 text-lg">{user.score}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
