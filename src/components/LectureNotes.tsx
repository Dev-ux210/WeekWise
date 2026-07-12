import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../database/db';

interface LectureNotesProps {
  selectedWeek: number;
}

export const LectureNotes: React.FC<LectureNotesProps> = ({ selectedWeek }) => {
  const [courseCode, setCourseCode] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Read all lectures pinned to this week from IndexedDB
  const lectures = useLiveQuery(
    () => db.lectures.where('weekNumber').equals(selectedWeek).toArray(),
    [selectedWeek]
  ) || [];

  // When switching weeks, clean the workspace select state
  useEffect(() => {
    setSelectedNoteId(null);
    setCourseCode('');
    setNoteTitle('');
    setNoteContent('');
  }, [selectedWeek]);

  // Handle auto-saving content with a debounce mechanic
  useEffect(() => {
    if (selectedNoteId === null) return;

    setIsSaving(true);
    const delayDebounceFn = setTimeout(async () => {
      await db.lectures.update(selectedNoteId, {
        courseCode: courseCode.trim().toUpperCase(),
        title: noteTitle.trim(),
        content: noteContent,
        lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      setIsSaving(false);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [courseCode, noteTitle, noteContent, selectedNoteId]);

  const handleCreateNewNote = async () => {
    const newId = await db.lectures.add({
      weekNumber: selectedWeek,
      courseCode: 'COURSE',
      title: 'Untitled Lecture Log',
      content: '',
      isReviewed: 0,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    setSelectedNoteId(newId);
    setCourseCode('COURSE');
    setNoteTitle('Untitled Lecture Log');
    setNoteContent('');
  };

  const handleSelectNote = (id?: number) => {
    if (!id) return;
    const note = lectures.find((l) => l.id === id);
    if (note) {
      setSelectedNoteId(id);
      setCourseCode(note.courseCode);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    }
  };

  const toggleReviewed = async (id?: number, status?: number) => {
    if (!id) return;
    await db.lectures.update(id, { isReviewed: status === 1 ? 0 : 1 });
  };

  const handleDeleteNote = async (id?: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!id) return;
    await db.lectures.delete(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-6 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-6 backdrop-blur-sm shadow-sm h-[500px]">
      
      {/* Lecture Sidebar Index */}
      <div className="col-span-1 border-r border-zinc-800/60 pr-4 flex flex-col justify-between h-full">
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Lecture Logs</h4>
            <button
              onClick={handleCreateNewNote}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-2 py-1 rounded border border-zinc-700/50 transition-colors"
            >
              + New Log
            </button>
          </div>

          <div className="space-y-1">
            {lectures.length === 0 ? (
              <p className="text-xs text-zinc-600 italic py-2">No lectures logged yet.</p>
            ) : (
              lectures.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleSelectNote(note.id)}
                  className={`p-2.5 rounded-lg text-left cursor-pointer group flex items-start justify-between border select-none transition-all ${
                    selectedNoteId === note.id
                      ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100'
                      : 'bg-zinc-950/20 border-transparent hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-300'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-zinc-950 px-1 py-0.5 rounded text-zinc-500">
                        {note.courseCode || 'LOG'}
                      </span>
                      {note.isReviewed === 1 && (
                        <span className="text-emerald-400 text-[10px]">✓</span>
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{note.title}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNote(note.id, e)}
                    className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 self-center text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 pt-2 border-t border-zinc-800/40">
          AUTO-SAVE ENGINE READY
        </div>
      </div>

      {/* Note Canvas Main Interface */}
      <div className="col-span-2 flex flex-col h-full pl-2">
        {selectedNoteId === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 space-y-2">
            <span className="text-2xl">📝</span>
            <p className="text-xs font-mono">Select or create a lecture log to launch workspace canvas</p>
          </div>
        ) : (
          <div className="flex flex-col h-full space-y-4">
            {/* Meta Control Area */}
            <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                placeholder="CS101"
                className="w-20 bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs font-mono text-center text-zinc-300 uppercase focus:outline-none focus:border-zinc-700"
              />
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Lecture Title..."
                className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-zinc-700"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleReviewed(selectedNoteId, lectures.find(l => l.id === selectedNoteId)?.isReviewed)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    lectures.find(l => l.id === selectedNoteId)?.isReviewed === 1
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-zinc-800 text-zinc-500 hover:text-zinc-400'
                  }`}
                >
                  {lectures.find(l => l.id === selectedNoteId)?.isReviewed === 1 ? 'Reviewed ✓' : 'Mark Reviewed'}
                </button>
                <span className="text-[10px] font-mono text-zinc-500 w-14 text-right">
                  {isSaving ? 'Saving...' : 'Saved'}
                </span>
              </div>
            </div>

            {/* Note Text Area Canvas */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Paste raw lecture logs, structure system configurations, or sketch out architectural logic components here..."
              className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none font-sans leading-relaxed custom-scrollbar"
            />
          </div>
        )}
      </div>
    </div>
  );
};