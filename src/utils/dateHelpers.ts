/**
 * Calculates the current academic week (1-15) based on a semester start date.
 * Returns 1 if the current date is before the start date, and 15 if it exceeds the semester.
 */
export function calculateCurrentWeek(startDateString: string): number {
  const startDate = new Date(startDateString);
  const today = new Date();
  
  startDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const differenceInTime = today.getTime() - startDate.getTime();
  const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
  
  if (differenceInDays < 0) return 1;
  
  const currentWeek = Math.floor(differenceInDays / 7) + 1;
  
  if (currentWeek > 15) return 15;
  return currentWeek;
}

/**
 * Generates a clean readable date string range for a given week number
 */
export function getWeekRangeString(startDateString: string, weekNumber: number): string {
  const start = new Date(startDateString);
  start.setHours(0, 0, 0, 0);
  
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
}