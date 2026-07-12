import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';

interface TaskListProps {
  selectedWeek: number;
}

interface Task {
  id?: number;
  weekNumber: number;
  title: string;
  type: 'TASK' | 'ASSIGNMENT' | 'EXAM';
  // db stores this as a number; allow both 0/1 and number to match Dexie import types
  isCompleted: 0 | 1 | number;
}

export const TaskList: React.FC<TaskListProps> = ({ selectedWeek }) => {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskType, setTaskType] = useState<'TASK' | 'ASSIGNMENT' | 'EXAM'>('TASK');

  // Query tasks specific to the selected week from our local storage
  const tasks = useLiveQuery<Task[]>(
    () => db.tasks.where('weekNumber').equals(selectedWeek).toArray() as any,
    [selectedWeek]
  ) || [];

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    await db.tasks.add({
      weekNumber: selectedWeek,
      title: taskTitle.trim(),
      type: taskType,
      isCompleted: 0, // 0 for false
    });

    setTaskTitle('');
  };

  const toggleTask = async (id?: number, currentStatus?: number) => {
    if (id === undefined) return;
    await db.tasks.update(id, {
      isCompleted: currentStatus === 1 ? 0 : 1,
    });
  };

  const deleteTask = async (id?: number) => {
    if (id === undefined) return;
    await db.tasks.delete(id);
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 backdrop-blur-sm shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📋</span> Weekly Checklist
        </h3>
        <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
          {tasks.filter(t => t.isCompleted === 1).length}/{tasks.length} Completed
        </span>
      </div>

      {/* Task Input Form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <input
          type="text"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          placeholder="Add an assignment, task, or exam target..."
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700"
        />
        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-2 text-sm text-zinc-400 focus:outline-none"
        >
          <option value="TASK">Task</option>
          <option value="ASSIGNMENT">Assignment</option>
          <option value="EXAM">Exam</option>
        </select>
        <button
          type="submit"
          className="bg-zinc-200 hover:bg-white text-zinc-950 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Add
        </button>
      </form>

      {/* Task Stream Render */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-zinc-500 italic text-center py-4">
            No items logged for Week {selectedWeek}.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-zinc-950/40 border border-zinc-800/50 p-3 rounded-lg hover:border-zinc-800 group transition-all"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.isCompleted === 1}
                  onChange={() => toggleTask(task.id, task.isCompleted)}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-800 text-zinc-200 focus:ring-0 focus:ring-offset-0 accent-zinc-200 cursor-pointer"
                />
                <span
                  className={`text-sm truncate ${
                    task.isCompleted === 1 ? 'line-through text-zinc-600' : 'text-zinc-300'
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase ${
                    task.type === 'EXAM'
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : task.type === 'ASSIGNMENT'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-zinc-800 text-zinc-500 border-zinc-700/50'
                  }`}
                >
                  {task.type}
                </span>
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 p-1 rounded transition-all"
                title="Delete item"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};