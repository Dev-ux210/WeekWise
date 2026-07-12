import React, { useState, useEffect, useRef } from 'react';
import { db, type Lecture, type Task } from '../database/db';

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectWeek: (week: number) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onSelectWeek }) => {
  const [query, setQuery] = useState('');
  const [lectureResults, setLectureResults] = useState<Lecture[]>([]);
  const [taskResults, setTaskResults] = useState<Task[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Keyboard listener to close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Execute database text scan on query change
  useEffect(() => {
    if (!query.trim()) {
      setLectureResults([]);
      setTaskResults([]);
      return;
    }

    const performSearch = async () => {
      const lowerQuery = query.toLowerCase();

      // Scan all lectures matching course code, title, or body text
      const allLectures = await db.lectures.toArray();
      const filteredLectures = allLectures.filter(
        (l) =>
          l.courseCode.toLowerCase().includes(lowerQuery) ||
          l.title.toLowerCase().includes(lowerQuery) ||
          l.content.toLowerCase().includes(lowerQuery)
      );

      // Scan all tasks matching titles
      const allTasks = await db.tasks.toArray();
      const filteredTasks = allTasks.filter((t) =>
        t.title.toLowerCase().includes(lowerQuery)
      );

      setLectureResults(filteredLectures);
      setTaskResults(filteredTasks);
    };

    const debounceTimer = setTimeout(performSearch, 150);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-[10vh] p-4 animate-fade-in">
      {/* Backdrop Click Closer */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-zinc-900 border border-zinc-800 w-1000 max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden relative z-10">
        
        {/* Search Input Box */}
        <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
          <span className="text-zinc-500 text-lg">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lectures, code topics, tasks across all 15 weeks..."
            className="flex-1 bg-transparent border-none text-zinc-100 placeholder-zinc-600 focus:outline-none text-sm"
          />
          <kbd className="text-[10px] font-mono bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-500 select-none">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!query.trim() ? (
            <div className="text-center py-8 text-zinc-600 text-xs font-mono">
              Type keywords to query your local engine store...
            </div>
          ) : lectureResults.length === 0 && taskResults.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs italic">
              No local records matching "{query}" found.
            </div>
          ) : (
            <>
              {/* Lecture Matches */}
              {lectureResults.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Lecture Logs ({lectureResults.length})
                  </h4>
                  {lectureResults.map((lecture) => (
                    <div
                      key={lecture.id}
                      onClick={() => {
                        onSelectWeek(lecture.weekNumber);
                        onClose();
                      }}
                      className="p-3 bg-zinc-950/40 border border-zinc-800/60  rounded-lg hover:border-zinc-700 cursor-pointer transition-all flex items-start justify-between group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-mono font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                            {lecture.courseCode}
                          </span>
                          <span className="text-white text-xs font-medium truncate">
                            {lecture.title}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 truncate font-sans">
                          {lecture.content || <span className="italic text-zinc-700">Empty notebook canvas</span>}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-2 py-1 rounded whitespace-nowrap self-center group-hover:text-zinc-400 transition-colors">
                        Week {lecture.weekNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Checklist Item Matches */}
              {taskResults.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 px-1">
                    Checklist Items ({taskResults.length})
                  </h4>
                  {taskResults.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => {
                        onSelectWeek(task.weekNumber);
                        onClose();
                      }}
                      className="p-3 bg-zinc-950/40 border border-zinc-800/60 rounded-lg hover:border-zinc-700 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-xs ${task.isCompleted ? 'text-zinc-600 line-through' : 'text-zinc-300'} truncate`}>
                          {task.isCompleted ? '✓ ' : '○ '} {task.title}
                        </span>
                        <span className="text-[9px] font-mono px-1 border border-zinc-800 bg-zinc-900/40 text-zinc-500 rounded uppercase">
                          {task.type}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-600 bg-zinc-950 border border-zinc-900 px-2 py-1 rounded whitespace-nowrap group-hover:text-zinc-400 transition-colors">
                        Week {task.weekNumber}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};