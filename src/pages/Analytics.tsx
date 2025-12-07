import React, { useMemo, useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { formatDateKey } from '../utils/helpers';

export const Analytics: React.FC = () => {
  const { state, dispatch } = useStore();
  const [distractionCategory, setDistractionCategory] = useState('Phone');

  // Prepare data for charts
  const stats = useMemo(() => {
    // 1. Weekly Focus (Last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return formatDateKey(d);
    });

    const weeklyData = last7Days.map(dateKey => {
      const mins = state.sessions
        .filter(s => s.type === 'focus' && formatDateKey(new Date(s.endTime)) === dateKey)
        .reduce((acc, s) => acc + s.durationMinutes, 0);
      return {
        name: new Date(dateKey).toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: mins
      };
    });

    // 2. Task Completion
    const completedTasks = state.tasks.filter(t => t.isCompleted).length;
    const pendingTasks = state.tasks.length - completedTasks;
    const taskData = [
      { name: 'Completed', value: completedTasks },
      { name: 'Pending', value: pendingTasks }
    ];

    // 3. Distractions
    const distractionCount = state.distractions.length;

    // 4. Most productive day
    const maxDay = weeklyData.reduce((prev, current) => (prev.minutes > current.minutes) ? prev : current, {name: '', minutes: 0});
    
    // 5. Avg session duration
    const focusSessions = state.sessions.filter(s => s.type === 'focus');
    const avgDuration = focusSessions.length ? Math.round(focusSessions.reduce((a, b) => a + b.durationMinutes, 0) / focusSessions.length) : 0;

    return { weeklyData, taskData, distractionCount, maxDay, avgDuration };
  }, [state.sessions, state.tasks, state.distractions]);

  const handleLogDistraction = () => {
    dispatch({ type: 'LOG_DISTRACTION', payload: { category: distractionCategory } });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3 mb-2">
             <Zap className="text-accent-600 dark:text-accent-400 w-5 h-5" />
             <h3 className="font-semibold text-sm uppercase text-light-text-secondary dark:text-dark-text-secondary">Most Productive</h3>
          </div>
          <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.maxDay.name || "N/A"}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{stats.maxDay.minutes} min focused</div>
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3 mb-2">
             <Clock className="text-primary-600 dark:text-primary-400 w-5 h-5" />
             <h3 className="font-semibold text-sm uppercase text-light-text-secondary dark:text-dark-text-secondary">Avg Session</h3>
          </div>
          <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.avgDuration} min</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">per focus block</div>
        </div>

        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3 mb-2">
             <AlertCircle className="text-danger-600 dark:text-danger-400 w-5 h-5" />
             <h3 className="font-semibold text-sm uppercase text-light-text-secondary dark:text-dark-text-secondary">Distractions</h3>
          </div>
          <div className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{stats.distractionCount}</div>
          <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">recorded events</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <div className="lg:col-span-2 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
          <h3 className="font-bold text-lg mb-6 text-light-text-primary dark:text-dark-text-primary">Focus Activity (Last 7 Days)</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                  cursor={{ fill: '#F1F5F9', opacity: 0.1 }}
                />
                <Bar dataKey="minutes" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Pie Chart & Distraction Logger */}
        <div className="space-y-6">
          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border h-80 flex flex-col">
            <h3 className="font-bold text-lg mb-2 text-light-text-primary dark:text-dark-text-primary">Task Efficiency</h3>
            <div className="flex-1 w-full relative">
               {stats.taskData[0].value === 0 && stats.taskData[1].value === 0 ? (
                 <div className="absolute inset-0 flex items-center justify-center text-light-text-secondary dark:text-dark-text-secondary text-sm">No tasks data</div>
               ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.taskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell key="cell-0" fill="#22C55E" />
                      <Cell key="cell-1" fill="#E5E7EB" />
                    </Pie>
                    <Legend verticalAlign="bottom" height={36}/>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
               )}
            </div>
          </div>

          <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm border border-light-border dark:border-dark-border">
            <h3 className="font-bold text-sm uppercase text-light-text-secondary dark:text-dark-text-secondary mb-3">Log Distraction</h3>
            <div className="flex gap-2">
              <select 
                value={distractionCategory}
                onChange={(e) => setDistractionCategory(e.target.value)}
                className="input flex-1 m-0"
              >
                <option>Phone</option>
                <option>Social Media</option>
                <option>Email</option>
                <option>Coworker</option>
                <option>Other</option>
              </select>
              <button 
                onClick={handleLogDistraction}
                className="btn btn-primary"
              >
                Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
