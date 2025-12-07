import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Save, Calendar } from 'lucide-react';
import { WeeklyReview as WeeklyReviewType } from '../types';
import { generateId, formatDateKey } from '../utils/helpers';

export const WeeklyReview: React.FC = () => {
  const { state, dispatch } = useStore();
  
  // Calculate Start of Week (Sunday)
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  };

  const currentWeekStart = formatDateKey(getStartOfWeek(new Date()));
  const [activeWeek, setActiveWeek] = useState(currentWeekStart);

  const [formData, setFormData] = useState({
    wins: '',
    distractions: '',
    whatWorked: '',
    improvementPlan: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  // Load existing data if available
  useEffect(() => {
    const existing = state.reviews.find(r => r.weekStartDate === activeWeek);
    if (existing) {
      setFormData({
        wins: existing.wins,
        distractions: existing.distractions,
        whatWorked: existing.whatWorked,
        improvementPlan: existing.improvementPlan
      });
    } else {
      setFormData({ wins: '', distractions: '', whatWorked: '', improvementPlan: '' });
    }
    setIsSaved(false);
  }, [activeWeek, state.reviews]);

  const handleSave = () => {
    const review: WeeklyReviewType = {
      id: generateId(),
      weekStartDate: activeWeek,
      createdAt: Date.now(),
      ...formData
    };
    dispatch({ type: 'SAVE_REVIEW', payload: review });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const availableWeeks = [...new Set([currentWeekStart, ...state.reviews.map(r => r.weekStartDate)])].sort().reverse();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Sidebar Week Selector */}
        <div className="w-full md:w-64">
           <div className="bg-light-card dark:bg-dark-card rounded-xl p-4 shadow-sm border border-light-border dark:border-dark-border">
             <h3 className="font-bold mb-4 flex items-center gap-2 text-light-text-primary dark:text-dark-text-primary">
               <Calendar size={18} /> Past Reviews
             </h3>
             <div className="space-y-2">
               {availableWeeks.map(week => (
                 <button
                   key={week}
                   onClick={() => setActiveWeek(week)}
                   className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                     activeWeek === week 
                       ? 'bg-primary-600 dark:bg-primary-700 text-primary-900 dark:text-white' 
                       : 'hover:bg-light-hover dark:hover:bg-dark-hover text-light-text-secondary dark:text-dark-text-secondary'
                   }`}
                 >
                   Week of {new Date(week).toLocaleDateString()}
                 </button>
               ))}
             </div>
           </div>
        </div>

        {/* Main Form */}
        <div className="flex-1 bg-light-card dark:bg-dark-card rounded-xl p-8 shadow-sm border border-light-border dark:border-dark-border">
           <div className="flex justify-between items-center mb-6">
             <h2 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Review: Week of {new Date(activeWeek).toLocaleDateString()}</h2>
             <button 
                onClick={handleSave}
                className="flex items-center gap-2 btn btn-primary"
             >
                <Save size={18} />
                {isSaved ? 'Saved!' : 'Save Review'}
             </button>
           </div>

           <div className="space-y-6">
             <div>
               <label className="block text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                 🏆 Biggest Wins
               </label>
               <textarea 
                 className="w-full p-4 rounded-lg bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border outline-none focus:ring-2 focus:ring-primary-500 h-24 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
                 placeholder="What did you accomplish this week?"
                 value={formData.wins}
                 onChange={e => setFormData({...formData, wins: e.target.value})}
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                 ⚠️ Distractions & Struggles
               </label>
               <textarea 
                 className="w-full p-4 rounded-lg bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border outline-none focus:ring-2 focus:ring-primary-500 h-24 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
                 placeholder="What took your focus away?"
                 value={formData.distractions}
                 onChange={e => setFormData({...formData, distractions: e.target.value})}
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                 ✅ What Worked Well?
               </label>
               <textarea 
                 className="w-full p-4 rounded-lg bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border outline-none focus:ring-2 focus:ring-primary-500 h-24 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
                 placeholder="Techniques, environment, timing..."
                 value={formData.whatWorked}
                 onChange={e => setFormData({...formData, whatWorked: e.target.value})}
               />
             </div>

             <div>
               <label className="block text-sm font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
                 🚀 Plan for Next Week
               </label>
               <textarea 
                 className="w-full p-4 rounded-lg bg-light-hover dark:bg-dark-hover border border-light-border dark:border-dark-border outline-none focus:ring-2 focus:ring-primary-500 h-24 text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
                 placeholder="One thing to improve..."
                 value={formData.improvementPlan}
                 onChange={e => setFormData({...formData, improvementPlan: e.target.value})}
               />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
