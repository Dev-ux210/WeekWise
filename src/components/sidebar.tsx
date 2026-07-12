import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';


interface SidebarProps {
  currentWeek: number;
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWeek,
  selectedWeek,
  setSelectedWeek,
}) => {
  // Real-time task query from our local IndexedDB layer
  const allTasks = useLiveQuery<{ weekNumber: number; isCompleted: number }[]>(() =>
    db.tasks.toArray()
  ) || [];

  const getMilestoneGroup = (week: number) => {
    if (week <= 5) return 'Mid-Term 1 Preparation';
    if (week <= 10) return 'Mid-Term 2 Preparation';
    return 'Final Revision Mode';
  };

  const phases = ['Mid-Term 1 Preparation', 'Mid-Term 2 Preparation', 'Final Revision Mode'];

  return (
    <aside className="w-64 bg-zinc-900/60 border-r border-zinc-800/80 flex flex-col h-screen fixed left-0 top-0 select-none backdrop-blur-md">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-800/80">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          ꪝeekꪝise
        </h1>
        <p className="text-xs text-zinc-400 mt-1">Don't study for the semester. Master the week.</p>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {phases.map((phase) => {
          const weeksInPhase = Array.from({ length: 15 }, (_, i) => i + 1).filter(
            (w) => getMilestoneGroup(w) === phase
          );

          return (
            <div key={phase} className="space-y-1.5">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 px-2">
                {phase}
              </h3>
              <div className="space-y-0.5">
                {weeksInPhase.map((week) => {
                  const isCurrent = week === currentWeek;
                  const isSelected = week === selectedWeek;
                  
                  const weekTasks = allTasks.filter((t) => t.weekNumber === week);
                  const completedCount = weekTasks.filter((t) => t.isCompleted === 1).length;
                  const hasTasks = weekTasks.length > 0;

                  return (
                    <button
                      key={week}
                      onClick={() => setSelectedWeek(week)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-zinc-800 text-zinc-100 shadow-sm border-l-2 border-zinc-400'
                          : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>Week {week}</span>
                        {isCurrent && (
                          <span className="bg-emerald-500/10 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-black tracking-wide uppercase">
                            Now
                          </span>
                        )}
                      </div>

                      {hasTasks && (
                        <span className="text-xs font-mono text-zinc-500">
                          {completedCount}/{weekTasks.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 text-[10px] font-mono text-zinc-500 flex justify-between">
        <span>MODE: LOCAL-FIRST</span>
        <span className="text-emerald-500">● ONLINE</span>
      </div>
    </aside>
  );
};