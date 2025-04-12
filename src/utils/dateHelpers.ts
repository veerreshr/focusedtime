// --- Utility Functions ---
/*
 * src/utils/dateHelpers.ts
 * Helper functions for date manipulation and calculations.
 */
import {
    eachDayOfInterval,
    format as formatFn, // Alias to avoid conflict
    parseISO,
    isBefore,
    isSameDay,
    differenceInDays,
    startOfDay,
    getHours,
    getMinutes,
    isPast,
    subMinutes,
    isValid,
    // getDay as getDayFn, // Alias getDay to avoid naming conflicts
    differenceInCalendarDays as differenceInCalendarDaysFn
} from 'date-fns';
import { Goal } from '../types';

// --- Date Formatting ---
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
     if (!isValid(dateObj)) return "Invalid Date";
    return formatFn(dateObj, 'yyyy-MM-dd');
};

export const formatReadableDate = (date: Date | string): string => {
     const dateObj = typeof date === 'string' ? parseISO(date) : date;
     if (!isValid(dateObj)) return "Invalid Date";
    return formatFn(dateObj, 'EEE, MMM d, yyyy'); // e.g., Mon, Apr 14, 2025
};

export const formatTime = (hour: number): string => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return formatFn(date, 'HH:mm'); // 00:00, 01:00, etc.
};

// --- Date Generation ---
export const getDatesInRange = (startDate: string, endDate: string): string[] => {
    try {
        const start = parseISO(startDate);
        const end = parseISO(endDate);
        if (!isValid(start) || !isValid(end) || isBefore(end, start)) {
            return [];
        }
        return eachDayOfInterval({ start, end }).map(date => formatDate(date));
    } catch (e) {
        console.error("Error getting dates in range:", e);
        return [];
    }
};

// --- Date Calculation ---
export const calculateTotalPossibleHours = (startDate: string, endDate: string): number => {
    try {
       const start = parseISO(startDate);
       const end = parseISO(endDate);
       if (!isValid(start) || !isValid(end) || isBefore(end, start)) {
           return 0;
       }
       // Calculate the number of days inclusive
       const numDays = differenceInCalendarDaysFn(end, start) + 1;
       return numDays * 24;
   } catch (e) {
       console.error("Error calculating total possible hours:", e);
       return 0;
   }
};

// --- Streak Calculation ---
export const calculateStreak = (goals: Goal[]): number => {
    if (!goals || goals.length === 0) return 0;

    const accomplishmentDates = new Set<string>();

    // Collect all unique dates with accomplishments across all goals
    goals.forEach(goal => {
        Object.keys(goal.accomplishments || {}).forEach(date => {
            if (Object.keys(goal.accomplishments[date]).length > 0) {
                accomplishmentDates.add(formatDate(parseISO(date))); // Ensure consistent format
            }
        });
    });

    if (accomplishmentDates.size === 0) return 0;

    // Sort dates chronologically
    const sortedDates : Date[] = Array.from(accomplishmentDates).map((dateString) => parseISO(dateString)).sort((a, b) => a.getTime() - b.getTime());

    let currentStreak = 0;
    let longestStreak = 0; // Keep track of the longest streak found so far
    const today = startOfDay(new Date());

    // Check if the most recent accomplishment was yesterday or today
    if (sortedDates.length > 0) {
        const lastAccomplishmentDate = startOfDay(sortedDates[sortedDates.length - 1]);
        const daysSinceLast = differenceInDays(today, lastAccomplishmentDate);

        // Streak continues only if last accomplishment was today or yesterday
        if (daysSinceLast <= 1) {
            currentStreak = 1; // Start with 1 if today/yesterday had accomplishment
            // Iterate backwards from the second to last date
            for (let i = sortedDates.length - 2; i >= 0; i--) {
                const currentDate = startOfDay(sortedDates[i]);
                const previousDate = startOfDay(sortedDates[i + 1]);
                // Check if the difference is exactly 1 day
                if (differenceInDays(previousDate, currentDate) === 1) {
                    currentStreak++;
                } else {
                    // Break the loop if dates are not consecutive
                    break;
                }
            }
             longestStreak = currentStreak; // The current calculation represents the most recent streak ending today/yesterday
        }
    }


    // Note: This calculates the *current* streak ending today or yesterday.
    // If you need the *longest historical* streak, the logic would need adjustment
    // to track the longest sequence found during the loop, regardless of when it ended.
    // For this implementation, we focus on the current active streak.
    return longestStreak;
};


// --- Time Comparison ---
export const isHourPast = (date: string, hour: number): boolean => {
    try {
        const targetDateTime = parseISO(`${date}T${String(hour).padStart(2, '0')}:59:59.999`);
         if (!isValid(targetDateTime)) return false;
        return isPast(targetDateTime);
    } catch {
        return false;
    }
};

export const isHourCurrent = (date: string, hour: number): boolean => {
    try {
        const now = new Date();
        const targetDate = parseISO(date);
         if (!isValid(targetDate)) return false;
        return isSameDay(now, targetDate) && getHours(now) === hour;
    } catch {
        return false;
    }
};

export const getCurrentHourProgress = (date: string, hour: number): number => {
     if (!isHourCurrent(date, hour)) return 0;
     const now = new Date();
     return (getMinutes(now) / 60) * 100; // Percentage of the hour passed
};


// --- Notification Time Calculation ---
export const calculateReminderTime = (date: string, hour: number, minutesBefore: number): Date | null => {
    try {
        const targetDateTime = parseISO(`${date}T${String(hour).padStart(2, '0')}:00:00`);
         if (!isValid(targetDateTime)) return null;
        return subMinutes(targetDateTime, minutesBefore);
    } catch {
        return null;
    }
};

export { isPast };
