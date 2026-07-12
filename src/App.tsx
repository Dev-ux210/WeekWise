import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database/db';
import { Sidebar } from './components/sidebar';
import { TaskList } from './components/tasklist';
import { LectureNotes } from './components/LectureNotes';
import { WeeklyInsights } from './components/WeeklyInsights';
import { GlobalSearch } from './components/GlobalSearch';
import { calculateCurrentWeek, getWeekRangeString } from './utils/dateHelpers';

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function App() {
  // Live reactive data queries from Dexie database tables
  const allTasks = useLiveQuery(() => db.tasks.toArray()) || [];
  const timetableSlots = useLiveQuery(() => db.timetable.toArray()) || [];

  const [semesterStartDate] = useState('2026-07-14');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Real Local Storage state for tracking the persistent day streak
  const [streak, setStreak] = useState(() => {
    return Number(localStorage.getItem('weekwise_streak')) || 3;
  });

  // Track selected calendar day index (0 = Sunday, 1 = Monday...)
  const [selectedDayIdx, setSelectedDayIdx] = useState(new Date().getDay());
  const [timetableInput, setTimetableInput] = useState('');

  const currentWeek = calculateCurrentWeek(semesterStartDate);
  const [selectedWeek, setSelectedWeek] = useState(currentWeek);

  // Sync timetable text input when switching between different calendar days
  useEffect(() => {
    const activeSlot = timetableSlots.find(s => s.dayIndex === selectedDayIdx);
    setTimetableInput(activeSlot ? activeSlot.note : '');
  }, [selectedDayIdx, timetableSlots]);

  // Global Ctrl + K Hotkey Handler to summon the search interface overlay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Increment Day Streak Handler
  const handleIncrementStreak = () => {
    const nextStreak = streak + 1;
    setStreak(nextStreak);
    localStorage.setItem('weekwise_streak', String(nextStreak));
  };

  // Save timetable entry to Dexie database
  const handleSaveTimetable = async () => {
    const existingSlot = timetableSlots.find(s => s.dayIndex === selectedDayIdx);
    if (existingSlot) {
      if (timetableInput.trim() === '') {
        await db.timetable.delete(existingSlot.id!);
      } else {
        await db.timetable.update(existingSlot.id!, { note: timetableInput });
      }
    } else if (timetableInput.trim() !== '') {
      await db.timetable.add({ dayIndex: selectedDayIdx, note: timetableInput });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex antialiased selection:bg-zinc-800 selection:text-white">
      {/* Structural Left Sidebar Panel */}
      <Sidebar
        currentWeek={currentWeek}
        selectedWeek={selectedWeek}
        setSelectedWeek={setSelectedWeek}
      />

      {/* Main Workspace Stream Container */}
      <div className="flex-1 ml-64 min-w-0 flex flex-col min-h-screen">
        
        {/* Modern Top Navigation Bar */}
        <header className="h-16 border-b border-zinc-800/60 px-8 flex items-center justify-between bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Week {selectedWeek} Workspace
            </h2>
            <span className="text-[11px] text-zinc-500 font-mono tracking-wide mt-0.5">
              ⏱️ {getWeekRangeString(semesterStartDate, selectedWeek)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Expanded Premium Custom Width Top Search Bar */}
            <div 
              onClick={() => setIsSearchOpen(true)}
              className="w-[450px] bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 px-3 py-1.5 rounded-lg flex items-center justify-between text-zinc-500 text-xs cursor-pointer transition-all shadow-inner group"
            >
              <span className="group-hover:text-zinc-400 transition-colors">Search tasks, topics...</span>
              <kbd className="text-[10px] font-mono bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800/60 text-zinc-600 group-hover:text-zinc-500">Ctrl K</kbd>
            </div>

            {/* Premium Streak Counter Widget (Click to increment!) */}
            <button 
              onClick={handleIncrementStreak}
              className="flex items-center gap-1.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-500 shadow-sm transition-all active:scale-95 group"
              title="Click to check in for today!"
            >
              <span className="group-hover:animate-bounce">🔥</span>
              <span>{streak} Day Streak</span>
            </button>

            {selectedWeek === currentWeek && (
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-md border border-emerald-500/20 font-medium tracking-wide">
                ● Active
              </span>
            )}
          </div>
        </header>

        {/* Dynamic Multi-Column Workspace Stream */}
        <div className="p-8 flex-1 grid grid-cols-3 gap-6 max-w-[1600px] w-full mx-auto">
          
          {/* LEFT 2 COLUMNS: Core Operational Trackers */}
          <div className="col-span-2 space-y-6">
            <WeeklyInsights selectedWeek={selectedWeek} />
            <TaskList selectedWeek={selectedWeek} />
            <LectureNotes selectedWeek={selectedWeek} />
          </div>

          {/* RIGHT COLUMN: Productivity Dashboard Widget Sidebar Panel */}
          <div className="col-span-1 space-y-6">
            
            {/* Widget A: Focus Tip Card (Interactive Random Engineering Quote Engine) */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm shadow-sm relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3 select-none">
                <span className="flex items-center gap-1.5">🎯 Focus Tip</span>
                <button 
                  onClick={() => {
                    const quotes = [
                      { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
                      { text: "An electrical engineer's job isn't just about signals; it's about making noise coherent.", author: "System Analogy" },
                      { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
                      { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman" },
                      { text: "First, solve the problem. Then, write the code.", author: "John Johnson" }
                    ];
                    const randomIdx = Math.floor(Math.random() * quotes.length);
                    const block = document.getElementById('quote-text');
                    const authorBlock = document.getElementById('quote-author');
                    if (block && authorBlock) {
                      block.innerText = `"${quotes[randomIdx].text}"`;
                      authorBlock.innerText = `— ${quotes[randomIdx].author}`;
                    }
                  }}
                  className="hover:text-zinc-300 cursor-pointer transition-all duration-200 active:rotate-180 text-sm"
                  title="Cycle Next Quote"
                >
                  ↻
                </button>
              </div>
              <blockquote id="quote-text" className="text-sm font-medium text-zinc-300 border-l-2 border-emerald-500/40 pl-3 py-0.5 italic leading-relaxed transition-all">
                "Discipline is choosing between what you want now and what you want most."
              </blockquote>
              <cite id="quote-author" className="block text-[11px] font-mono text-zinc-500 mt-2 text-right transition-all">— Abraham Lincoln</cite>
            </div>

            {/* Widget B: Auto-Aggregating Deadline Scan Dashboard */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm shadow-sm space-y-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-zinc-800/60 pb-2.5">
                <span>📅</span> Upcoming Deadlines
              </h4>
              <div className="max-h-[160px] overflow-y-auto pr-1 space-y-2 select-none">
                {allTasks.filter(t => (t.type === 'EXAM' || t.type === 'ASSIGNMENT') && t.isCompleted === 0).length === 0 ? (
                  <p className="text-xs text-zinc-500 italic py-5 text-center">
                    No pending assignments or exam targets remaining!
                  </p>
                ) : (
                  allTasks
                    .filter(t => (t.type === 'EXAM' || t.type === 'ASSIGNMENT') && t.isCompleted === 0)
                    .map(task => (
                      <div key={task.id} className="p-2.5 bg-zinc-950/40 border border-zinc-800/50 rounded-lg flex items-center justify-between text-xs hover:border-zinc-700 transition-colors">
                        <span className="text-zinc-300 truncate pr-2 font-medium">{task.title}</span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase border whitespace-nowrap ${
                          task.type === 'EXAM' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          Wk {task.weekNumber} · {task.type}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Widget C: Interactive Weekly Timetable and Calendar Engine */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800/60 pb-2.5">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>🗓️</span> Weekly Timetable
                </h4>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Select day to update
                </span>
              </div>

              {/* Day Grid Picker Row */}
              <div className="grid grid-cols-7 gap-1">
                {DAYS_OF_WEEK.map((day, idx) => {
                  const hasData = timetableSlots.some(s => s.dayIndex === idx);
                  const isSelected = selectedDayIdx === idx;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDayIdx(idx)}
                      className={`py-2 text-[11px] font-medium rounded-md flex flex-col items-center relative transition-all ${
                        isSelected 
                          ? 'bg-zinc-100 text-zinc-950 font-bold shadow' 
                          : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                      }`}
                    >
                      <span>{day[0]}</span>
                      {hasData && (
                        <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-zinc-950' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Day Details Form Field */}
              <div className="space-y-2 pt-1">
                <div className="text-xs text-zinc-400 font-medium">
                  {DAYS_OF_WEEK[selectedDayIdx]} Schedule:
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={timetableInput}
                    onChange={(e) => setTimetableInput(e.target.value)}
                    placeholder="e.g., 09:00 Labs, 14:00 Embedded Lectures..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTimetable(); }}
                  />
                  <button
                    onClick={handleSaveTimetable}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700/50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Global Hotkey Dialog Window Layer */}
      <GlobalSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectWeek={(week) => setSelectedWeek(week)}
      />
    </div>
  );
}