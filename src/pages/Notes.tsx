import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Plus, Trash2, Save } from 'lucide-react';
import { cn } from '../utils/helpers';

export const Notes: React.FC = () => {
  const { state, dispatch } = useStore();
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);

  const activeNote = state.notes.find(n => n.id === activeNoteId);

  const handleCreateNote = () => {
    const title = "Untitled Note";
    const content = "";
    dispatch({ type: 'ADD_NOTE', payload: { title, content } });
    // Since we can't easily get the ID back from dispatch in this architecture without refactoring,
    // we assume the newest note is active. In a real app, dispatch would return ID or we'd handle ID creation here.
    // For this prototype, I'll switch activeNoteId to the first note in list after a tiny delay or effect.
    setTimeout(() => setActiveNoteId(state.notes[0]?.id), 10); 
  };

  const handleUpdate = (field: 'title' | 'content', value: string) => {
    if (!activeNote) return;
    dispatch({ 
      type: 'UPDATE_NOTE', 
      payload: { ...activeNote, [field]: value } 
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure?')) {
      dispatch({ type: 'DELETE_NOTE', payload: id });
      if (activeNoteId === id) setActiveNoteId(null);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-6 flex gap-6 max-w-7xl mx-auto">
      
      {/* Sidebar List */}
      <div className="w-1/3 md:w-1/4 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-light-border dark:border-dark-border flex justify-between items-center bg-light-hover dark:bg-dark-hover">
          <h2 className="font-bold text-light-text-primary dark:text-dark-text-primary">Notes</h2>
          <button 
            onClick={handleCreateNote}
            className="p-1.5 bg-primary-600 dark:bg-primary-700 text-primary-900 dark:text-white rounded-md hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors focus-ring"
          >
            <Plus size={18} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {state.notes.length === 0 && (
             <div className="p-8 text-center text-sm text-light-text-tertiary dark:text-dark-text-tertiary">No notes yet.</div>
          )}
          {state.notes.map(note => (
            <div 
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
              className={cn(
                "p-4 border-b border-light-border dark:border-dark-border cursor-pointer transition-colors group relative",
                activeNoteId === note.id 
                  ? "bg-primary-50 dark:bg-primary-900/30 border-l-4 border-l-primary-600" 
                  : "hover:bg-light-hover dark:hover:bg-dark-hover"
              )}
            >
              <h3 className={cn("font-semibold text-sm truncate pr-6 text-light-text-primary dark:text-dark-text-primary", activeNoteId === note.id ? "text-primary-600 dark:text-primary-400" : "")}>
                {note.title || "Untitled"}
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1 truncate">
                {note.content || "No content"}
              </p>
              <div className="text-[10px] text-light-text-tertiary dark:text-dark-text-tertiary mt-2">
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
              
              <button 
                onClick={(e) => handleDelete(note.id, e)}
                className="absolute top-4 right-2 text-light-text-tertiary dark:text-dark-text-tertiary hover:text-danger-600 dark:hover:text-danger-500 opacity-0 group-hover:opacity-100 transition-opacity focus-ring"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-light-card dark:bg-dark-card rounded-xl border border-light-border dark:border-dark-border shadow-sm flex flex-col relative overflow-hidden">
        {activeNote ? (
          <>
            <div className="p-6 pb-2">
              <input 
                type="text" 
                value={activeNote.title} 
                onChange={(e) => handleUpdate('title', e.target.value)}
                placeholder="Note Title"
                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary text-light-text-primary dark:text-dark-text-primary"
              />
              <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-2 flex items-center gap-2">
                 <span>Last edited: {new Date(activeNote.updatedAt).toLocaleString()}</span>
                 <span className="text-success-600 dark:text-success-400 flex items-center gap-1"><Save size={10} /> Auto-saved</span>
              </div>
            </div>
            <textarea 
              className="flex-1 w-full p-6 resize-none bg-transparent outline-none text-base leading-relaxed text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary"
              placeholder="Start typing your thoughts..."
              value={activeNote.content}
              onChange={(e) => handleUpdate('content', e.target.value)}
            ></textarea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-light-text-tertiary dark:text-dark-text-tertiary">
            <NotebookIcon />
            <p className="mt-4 text-lg font-medium">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

const NotebookIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);
