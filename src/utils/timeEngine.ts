// timeEngine.ts
// Lógica pura para calcular bolsa de minutos, renovaciones y consumos de tiempo.

export interface DailyBalance {
  date: string; // YYYY-MM-DD (local date string)
  baseQuota: number; // In minutes
  unusedFromYesterday: number; // In minutes
  totalStartingBalance: number; // In minutes
  usedToday: number; // In seconds (for precision)
}

/**
 * Returns a YYYY-MM-DD string representing the local date for a given timestamp.
 */
export function getLocalDateString(timestamp: number = Date.now()): string {
  const d = new Date(timestamp);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the day difference between two local date strings (YYYY-MM-DD).
 */
export function getDaysDifference(dateStr1: string, dateStr2: string): number {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculates the new daily balance based on the previous day's record.
 * @param currentDate The current local date string (YYYY-MM-DD)
 * @param lastRecord The last recorded daily balance
 * @param baseQuota The base daily quota for the user (in minutes)
 */
export function calculateNewDayBalance(
  currentDate: string,
  lastRecord: DailyBalance | null,
  baseQuota: number
): DailyBalance {
  // First time using the app
  if (!lastRecord) {
    return {
      date: currentDate,
      baseQuota,
      unusedFromYesterday: 0,
      totalStartingBalance: baseQuota,
      usedToday: 0
    };
  }

  const daysDiff = getDaysDifference(lastRecord.date, currentDate);
  
  // Same day - return existing record, possibly updating baseQuota if admin changed it
  // (We'll keep the logic simple here: if same day, just return lastRecord)
  if (daysDiff === 0) {
    return lastRecord;
  }
  
  // Exactly 1 day passed - we apply the rollover rule:
  // (unused from yesterday / 2) -> rounded down or keeping half? Let's use Math.floor
  let unusedFromYesterday = 0;
  
  if (daysDiff === 1) {
    const yesterdayRemainingMinutes = lastRecord.totalStartingBalance - Math.floor(lastRecord.usedToday / 60);
    if (yesterdayRemainingMinutes > 0) {
      unusedFromYesterday = Math.floor(yesterdayRemainingMinutes / 2);
    }
  }
  // If daysDiff > 1, unusedFromYesterday is 0 (the surplus is lost).

  return {
    date: currentDate,
    baseQuota,
    unusedFromYesterday,
    totalStartingBalance: baseQuota + unusedFromYesterday,
    usedToday: 0
  };
}

/**
 * Formats seconds to MM:SS or HH:MM:SS
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
