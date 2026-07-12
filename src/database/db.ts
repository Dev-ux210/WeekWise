import Dexie, { type Table } from 'dexie';

export interface Lecture {
  id?: number;
  weekNumber: number;
  courseCode: string;
  title: string;
  content: string;
  isReviewed: number;
  lastSaved: string;
}

export interface Task {
  id?: number;
  weekNumber: number;
  title: string;
  type: 'TASK' | 'ASSIGNMENT' | 'EXAM';
  isCompleted: number;
}

export interface WeeklySummary {
  id?: number;
  weekNumber: number;
  summaryText: string;
}

// New interface for the sidebar calendar widget
export interface TimetableSlot {
  id?: number;
  dayIndex: number; // 0 for Sunday, 1 for Monday, etc.
  note: string;
}

class WeekWiseDatabase extends Dexie {
  lectures!: Table<Lecture>;
  tasks!: Table<Task>;
  summaries!: Table<WeeklySummary>;
  timetable!: Table<TimetableSlot>; // Declaring the new table

  constructor() {
    super('WeekWiseDatabase');
    
    // We define version 1 first so Dexie knows how historical databases were built
    this.version(1).stores({
      lectures: '++id, weekNumber, courseCode, isReviewed',
      tasks: '++id, weekNumber, type, isCompleted',
      summaries: '++id, &weekNumber',
    });

    // Bumping to Version 2 adds the timetable table safely without breaking existing user data!
    this.version(2).stores({
      lectures: '++id, weekNumber, courseCode, isReviewed',
      tasks: '++id, weekNumber, type, isCompleted',
      summaries: '++id, &weekNumber',
      timetable: '++id, dayIndex', // Added new tracking store
    });
  }
}

export const db = new WeekWiseDatabase();