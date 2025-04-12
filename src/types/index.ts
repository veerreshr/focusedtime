// --- Interfaces ---
/*
 * src/types/index.ts
 * Defines the core data structures used throughout the application.
 */

export interface Goal {
  id: string;
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  templateAvailability?: Record<number, number[]>; // e.g., { 1: [9, 10, 11, 12, 13, 14, 15, 16], 2: [9, 10, 11] }
  availability: Availability[]; // Hourly availability for each day
  plans: Record<string, Record<number, string>>; // { 'YYYY-MM-DD': { 0: 'Plan for hour 0', ... } }
  accomplishments: Record<string, Record<number, string>>; // { 'YYYY-MM-DD': { 0: 'Accomplishment for hour 0', ... } }
}

export interface Availability {
  date: string; // YYYY-MM-DD
  hours: number[]; // Array of hours (0-23) marked as available
}

export interface ReminderSettings {
  enabled: boolean;
  minutesBefore: 5 | 10 | 15;
}

export interface AppState {
  goals: Goal[];
  activeGoalId: string | null;
  reminders: ReminderSettings;
  // Streaks might be calculated dynamically or stored if needed
}

export type AppAction =
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: { id: string } }
  | { type: 'SET_ACTIVE_GOAL'; payload: { id: string | null } }
  | { type: 'UPDATE_AVAILABILITY'; payload: { goalId: string; date: string; hour: number; selected: boolean } }
  | { type: 'UPDATE_PLAN'; payload: { goalId: string; date: string; hour: number; text: string } }
  | { type: 'UPDATE_ACCOMPLISHMENT'; payload: { goalId: string; date: string; hour: number; text: string } }
  | { type: 'UPDATE_REMINDER_SETTINGS'; payload: Partial<ReminderSettings> }
  | { type: 'LOAD_STATE'; payload: AppState };

