// --- Context API ---
/*
 * src/contexts/AppContext.tsx
 * Manages the global application state using Context API and reducers.
 */
import React, { createContext, useReducer, useContext, useEffect, ReactNode, Dispatch } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AppState, AppAction, Goal, ReminderSettings, Availability } from '../types/index.ts';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { format, getDay, parseISO, isValid } from 'date-fns';
import { getDatesInRange } from '../utils/dateHelpers';

// --- Local Storage Keys ---
const LOCAL_STORAGE_KEY = 'focusedTimeAppState';

// --- Initial State ---
const initialState: AppState = {
  goals: [],
  activeGoalId: null,
  reminders: { enabled: false, minutesBefore: 15 },
};

// --- Helper Function to Apply Template ---
const applyTemplateToGoal = (goal: Goal): Goal => {
  if (!goal.templateAvailability || !goal.startDate || !goal.endDate) {
      // If no template or invalid dates, return goal as is (or with empty availability)
      return { ...goal, availability: goal.availability || [] };
  }

  const dates = getDatesInRange(goal.startDate, goal.endDate);
  const newAvailability: Availability[] = [];

  dates.forEach(dateStr => {
      try {
          const dateObj = parseISO(dateStr);
          if (isValid(dateObj)) {
              const dayOfWeek = getDay(dateObj); // 0 (Sun) to 6 (Sat)
              const templateHours = goal.templateAvailability?.[dayOfWeek];

              // Only add if template has hours defined for this day of the week
              if (templateHours && templateHours.length > 0) {
                  newAvailability.push({ date: dateStr, hours: [...templateHours].sort((a, b) => a - b) });
              }
          }
      } catch (e) {
          console.error(`Error processing date ${dateStr} for template application`, e);
      }
  });

  // Important: Merge with existing specific availability?
  // For now, let's assume template application *replaces* existing availability
  // when ADD_GOAL or UPDATE_GOAL is called with a template.
  // Manual overrides via UPDATE_AVAILABILITY will modify this generated list later.
  return { ...goal, availability: newAvailability };
};

// --- Reducer Logic ---
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      // Add basic validation before loading state
      if (action.payload && Array.isArray(action.payload.goals) && typeof action.payload.reminders === 'object') {
          // Ensure loaded goals have necessary fields (backward compatibility)
          const validatedGoals = action.payload.goals.map(g => ({
              ...g,
              availability: g.availability || [],
              plans: g.plans || {},
              accomplishments: g.accomplishments || {}
              // templateAvailability might be undefined in older saves
          }));
          return { ...action.payload, goals: validatedGoals };
      }
      console.warn("Attempted to load invalid state from storage. Using initial state.");
      return initialState; // Fallback to initial state if loaded state is invalid


    case 'ADD_GOAL': {
      // Apply template to generate initial availability before adding
      const goalWithAppliedTemplate = applyTemplateToGoal(action.payload);
      return {
          ...state,
          goals: [...state.goals, goalWithAppliedTemplate]
      };
    }

    case 'UPDATE_GOAL': {
      // Apply template to generate availability when updating goal details (dates or template itself)
      const goalWithAppliedTemplate = applyTemplateToGoal(action.payload);
      return {
        ...state,
        goals: state.goals.map(g => g.id === action.payload.id ? goalWithAppliedTemplate : g),
      };
    }

    case 'DELETE_GOAL':{
      const remainingGoals = state.goals.filter(g => g.id !== action.payload.id);
      const newActiveGoalId = state.activeGoalId === action.payload.id
          ? (remainingGoals.length > 0 ? remainingGoals[0].id : null)
          : state.activeGoalId;
      return {
        ...state,
        goals: remainingGoals,
        activeGoalId: newActiveGoalId,
      };
    }
     case 'SET_ACTIVE_GOAL':
       // Ensure the goal ID exists before setting it as active
       if (action.payload.id === null || state.goals.some(g => g.id === action.payload.id)) {
            return { ...state, activeGoalId: action.payload.id };
       }
       return state; // If goal ID doesn't exist, don't change active goal

    case 'UPDATE_AVAILABILITY': {
      // This action now handles manual overrides *after* the template has been applied.
      const { goalId, date, hour, selected } = action.payload;
      return {
        ...state,
        goals: state.goals.map(goal => {
          if (goal.id !== goalId) return goal;

          // Find the specific date entry in the goal's availability array
          const availabilityIndex = goal.availability.findIndex(a => a.date === date);
          // eslint-disable-next-line prefer-const
          let newAvailabilityArray = [...goal.availability]; // Copy the availability array

          if (availabilityIndex > -1) {
            // Date already has specific overrides, modify its hours
            const currentEntry = newAvailabilityArray[availabilityIndex];
            const currentHours = currentEntry.hours || []; // Ensure hours array exists
            let updatedHours: number[];

            if (selected) {
              // Add hour if not already present
              updatedHours = currentHours.includes(hour) ? currentHours : [...currentHours, hour].sort((a, b) => a - b);
            } else {
              // Remove hour
              updatedHours = currentHours.filter(h => h !== hour);
            }

            // Update the entry in the copied array
            newAvailabilityArray[availabilityIndex] = { ...currentEntry, hours: updatedHours };

            // If removing the last hour for a date that had specific overrides, remove the entry?
            // Let's keep the entry even if hours are empty, to signify it was explicitly modified.
            // Alternatively, could remove if updatedHours.length === 0

          } else if (selected) {
            // Date not found in specific overrides, and we are selecting an hour.
            // This means we are overriding the template (or lack thereof) for the first time for this date.
            // Create a new entry for this date.
            newAvailabilityArray.push({ date, hours: [hour] });
            newAvailabilityArray.sort((a, b) => a.date.localeCompare(b.date)); // Keep sorted
          }
          // If availabilityIndex is -1 and selected is false, do nothing (trying to deselect from template implicitly)

          return { ...goal, availability: newAvailabilityArray };
        }),
      };
    }

    case 'UPDATE_PLAN': {
        const { goalId, date, hour, text } = action.payload;
        return {
            ...state,
            goals: state.goals.map(goal => {
                if (goal.id !== goalId) return goal;
                const updatedPlans = JSON.parse(JSON.stringify(goal.plans || {})); // Deep copy
                if (!updatedPlans[date]) {
                    updatedPlans[date] = {};
                }
                if (text) {
                    updatedPlans[date][hour] = text;
                } else {
                    // Clean up empty entries if text is empty
                    delete updatedPlans[date][hour];
                    if (Object.keys(updatedPlans[date]).length === 0) {
                        delete updatedPlans[date];
                    }
                }
                return { ...goal, plans: updatedPlans };
            }),
        };
    }

    case 'UPDATE_ACCOMPLISHMENT': {
        const { goalId, date, hour, text } = action.payload;
        return {
            ...state,
            goals: state.goals.map(goal => {
                if (goal.id !== goalId) return goal;
                const updatedAccomplishments = JSON.parse(JSON.stringify(goal.accomplishments || {})); // Deep copy
                if (!updatedAccomplishments[date]) {
                    updatedAccomplishments[date] = {};
                }
                 if (text) {
                    updatedAccomplishments[date][hour] = text;
                 } else {
                     // Clean up empty entries if text is empty
                    delete updatedAccomplishments[date][hour];
                    if (Object.keys(updatedAccomplishments[date]).length === 0) {
                        delete updatedAccomplishments[date];
                    }
                 }
                return { ...goal, accomplishments: updatedAccomplishments };
            }),
        };
    }

    case 'UPDATE_REMINDER_SETTINGS':
      return {
        ...state,
        reminders: { ...state.reminders, ...action.payload },
      };

    default:
        // Ensure exhaustive check if using TypeScript, otherwise just return state
        // const _exhaustiveCheck: never = action;
      return state;
  }
};
// --- Context Definition ---
interface AppContextProps {
  state: AppState;
  dispatch: Dispatch<AppAction>;
  activeGoal: Goal | null; // Export the derived active goal object
}

const AppContext = createContext<AppContextProps>({
  state: initialState,
  dispatch: () => null,
  activeGoal: null,
});

// --- Context Provider Component ---
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // --- Load state from localStorage on initial mount ---
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedState) {
        const parsedState: AppState = JSON.parse(savedState);
         // Basic validation to ensure structure matches
        if (parsedState && parsedState.goals && parsedState.reminders) {
             dispatch({ type: 'LOAD_STATE', payload: parsedState });
             // Set the first goal as active if none is set and goals exist, and ID is valid
             if (!parsedState.activeGoalId && parsedState.goals.length > 0 && parsedState.goals[0]?.id) {
                 dispatch({ type: 'SET_ACTIVE_GOAL', payload: { id: parsedState.goals[0].id } });
             } else if (parsedState.activeGoalId && !parsedState.goals.some(g => g.id === parsedState.activeGoalId)) {
                 // If activeGoalId exists but doesn't match any goal, reset it
                 const firstValidId = parsedState.goals.length > 0 ? parsedState.goals[0].id : null;
                 dispatch({ type: 'SET_ACTIVE_GOAL', payload: { id: firstValidId } });
             }
        } else {
             console.warn("Stored state format is invalid. Using initial state.");
             localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid state
        }
      }
    } catch (error) {
      console.error("Failed to load or parse state from localStorage:", error);
      // Optionally clear corrupted storage
      // localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, []);

  // --- Save state to localStorage whenever it changes ---
  useEffect(() => {
    try {
        // Avoid saving the initial default state if nothing has been loaded or changed
        if (state !== initialState) {
             localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
        }
    } catch (error) {
        console.error("Failed to save state to localStorage:", error);
        // Handle potential storage errors (e.g., quota exceeded)
        // Consider implementing IndexedDB fallback here if needed
        alert("Error saving data. Local storage might be full.");
    }
  }, [state]);

  // --- Find the active goal (derived state) ---
  const activeGoal = state.goals.find(g => g.id === state.activeGoalId) || null;

  return (
    <AppContext.Provider value={{ state, dispatch, activeGoal }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Custom Hook to use AppContext ---
export const useAppContext = () => useContext(AppContext);
