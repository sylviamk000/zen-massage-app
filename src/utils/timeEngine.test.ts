import { describe, it, expect } from 'vitest';
import { 
  getLocalDateString, 
  getDaysDifference, 
  calculateNewDayBalance, 
  DailyBalance 
} from './timeEngine';

describe('Time Engine Rollover Logic', () => {
  it('should format date string correctly', () => {
    // 2026-07-29T12:00:00.000Z
    const timestamp = 1785326400000; 
    const dateStr = getLocalDateString(timestamp);
    // Depends on local timezone, but generally matches YYYY-MM-DD
    expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should calculate day difference correctly', () => {
    expect(getDaysDifference('2026-07-01', '2026-07-02')).toBe(1);
    expect(getDaysDifference('2026-07-01', '2026-07-05')).toBe(4);
    expect(getDaysDifference('2026-07-01', '2026-07-01')).toBe(0);
  });

  it('should return initial balance if no last record exists', () => {
    const result = calculateNewDayBalance('2026-07-02', null, 20);
    expect(result).toEqual({
      date: '2026-07-02',
      baseQuota: 20,
      unusedFromYesterday: 0,
      totalStartingBalance: 20,
      usedToday: 0
    });
  });

  it('should rollover half of unused minutes if 1 day passed', () => {
    const lastRecord: DailyBalance = {
      date: '2026-07-01',
      baseQuota: 20,
      unusedFromYesterday: 0,
      totalStartingBalance: 20,
      usedToday: 12 * 60 // 12 minutes used -> 8 remaining
    };
    const result = calculateNewDayBalance('2026-07-02', lastRecord, 20);
    
    // 8 unused / 2 = 4 rollover
    // Total = 20 + 4 = 24
    expect(result.unusedFromYesterday).toBe(4);
    expect(result.totalStartingBalance).toBe(24);
    expect(result.usedToday).toBe(0);
  });

  it('should floor the unused minutes if odd', () => {
    const lastRecord: DailyBalance = {
      date: '2026-07-01',
      baseQuota: 20,
      unusedFromYesterday: 0,
      totalStartingBalance: 20,
      usedToday: 13 * 60 // 13 minutes used -> 7 remaining
    };
    const result = calculateNewDayBalance('2026-07-02', lastRecord, 20);
    
    // 7 unused / 2 = 3.5 -> floor(3.5) = 3
    expect(result.unusedFromYesterday).toBe(3);
    expect(result.totalStartingBalance).toBe(23);
  });

  it('should not rollover anything if more than 1 day passed (lost remaining)', () => {
    const lastRecord: DailyBalance = {
      date: '2026-07-01',
      baseQuota: 20,
      unusedFromYesterday: 0,
      totalStartingBalance: 20,
      usedToday: 0 // 20 minutes remaining
    };
    // 2 days later
    const result = calculateNewDayBalance('2026-07-03', lastRecord, 20);
    
    expect(result.unusedFromYesterday).toBe(0);
    expect(result.totalStartingBalance).toBe(20);
  });
});
