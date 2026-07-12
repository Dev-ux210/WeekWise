import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';

interface WeeklyInsightsProps {
  selectedWeek: number;
}

export const WeeklyInsights: React.FC<WeeklyInsightsProps> = ({ selectedWeek }) => {
  const tasks = useLiveQuery(() => db.tasks.where('weekNumber').equals(selectedWeek).toArray(), [selectedWeek]) || [];
  const lectures = useLiveQuery(() => db.lectures.where('weekNumber').equals(selectedWeek).toArray(), [selectedWeek]) || [];

  const completedTasks = tasks.filter(t => t.isCompleted === 1).length;
  const reviewedLectures = lectures.filter(l => l.isReviewed === 1).length;

  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const lectureProgress = lectures.length > 0 ? Math.round((reviewedLectures / lectures.length) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 bg-zinc-900/20 border border-zinc-800/60 rounded-xl p-4 backdrop-blur-sm">
      {/* Checklist Completion Gauge */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-zinc-500">Checklist Completion</span>
          <h4 className="text-2xl font-bold text-white mt-1">{taskProgress}%</h4>
        </div>
        <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-zinc-200 h-full transition-all duration-500" 
            style={{ width: `${taskProgress}%` }}
          />
        </div>
      </div>

      {/* Revision Coverage Gauge */}
      <div className="bg-zinc-950/40 border border-zinc-900 rounded-lg p-4 flex flex-col justify-between">
        <div>
          <span className="text-xs font-mono tracking-wider uppercase text-zinc-500">Lecture Retention Rate</span>
          <h4 className="text-2xl font-bold text-emerald-400 mt-1">{lectureProgress}%</h4>
        </div>
        <div className="w-full bg-zinc-900 h-1.5 rounded-full mt-4 overflow-hidden">
          <div 
            className="bg-emerald-500 h-full transition-all duration-500" 
            style={{ width: `${lectureProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
};