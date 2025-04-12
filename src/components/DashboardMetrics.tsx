/*
 * src/components/DashboardMetrics.tsx
 * Displays key progress metrics for the active goal.
 * UPDATED with new stats and calculations.
 */
import React, { useMemo } from 'react';
// import { useAppContext } from '../contexts/AppContext';
import { parseISO, isAfter, isToday, startOfDay, isValid as isValidDate } from 'date-fns';
import { Goal } from '../types';
import { calculateTotalPossibleHours } from '../utils/dateHelpers'; // Import new helper

interface DashboardMetricsProps {
    goal: Goal; // Accept a goal object as a prop
}

// Updated helper function to calculate all required metrics
const calculateMetrics = (goal: Goal | null) => {
    if (!goal || !goal.startDate || !goal.endDate || !isValidDate(parseISO(goal.startDate)) || !isValidDate(parseISO(goal.endDate))) {
        return {
            totalPossibleHours: 0,
            totalAvailableHoursEntireGoal: 0,
            totalAvailableHoursFromNow: 0,
            hoursLogged: 0,
            progress: 0,
        };
    }

    const today = startOfDay(new Date());
    let totalAvailableHoursEntireGoal = 0;
    let totalAvailableHoursFromNow = 0;
    let hoursLogged = 0;

    // 1. Total Possible Hours in Goal Duration
    const totalPossibleHours = calculateTotalPossibleHours(goal.startDate, goal.endDate);

    // 2. Total Available Hours (Entire Goal) & 3. Available Hours Remaining (From Now)
    goal.availability?.forEach(avail => {
        try {
            const availDate = parseISO(avail.date);
            const hoursCount = avail.hours?.length || 0;
            if (isValidDate(availDate)) {
                totalAvailableHoursEntireGoal += hoursCount; // Sum all available hours
                if (isToday(availDate) || isAfter(availDate, today)) {
                    totalAvailableHoursFromNow += hoursCount; // Sum available hours from today onwards
                }
            }
        } catch (e) { console.warn(`Invalid date in availability: ${avail.date}`, e); }
    });

    // 4. Hours Logged
    Object.keys(goal.accomplishments || {}).forEach(date => {
        hoursLogged += Object.keys(goal.accomplishments[date] || {}).length;
    });

    // 5. Progress (Logged / Total Available for Entire Goal)
    const progress = totalAvailableHoursEntireGoal > 0
        ? Math.min(100, (hoursLogged / totalAvailableHoursEntireGoal) * 100)
        : (hoursLogged > 0 ? 100 : 0); // Show 100% if logged but no available hours planned


    return {
        totalPossibleHours,
        totalAvailableHoursEntireGoal,
        totalAvailableHoursFromNow,
        hoursLogged,
        progress: Math.max(0, progress), // Ensure progress isn't negative
    };
};


export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ goal }) => {

    // Calculate metrics using useMemo based on the passed 'goal' prop
    const {
        totalPossibleHours,
        totalAvailableHoursEntireGoal,
        totalAvailableHoursFromNow,
        hoursLogged,
        progress
    } = useMemo(() => calculateMetrics(goal), [goal]); // Dependency is the goal prop

    // Basic check if goal prop is valid
    if (!goal) {
        return null;
    }

    return (
        // Use slightly smaller padding/margins if multiple cards are shown
        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow">
            {/* Use smaller heading */}
            <h3 className="text-md font-semibold mb-3 text-blue-700 dark:text-blue-300 truncate">
                {goal.title}
            </h3>
            <div className="space-y-2 text-xs"> {/* Use smaller text */}
                {/* Stat Row 1 */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="text-slate-600 dark:text-slate-400">
                        <span className="block font-medium text-slate-700 dark:text-slate-200 text-lg">{totalPossibleHours}</span>
                        Total Hours
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                         <span className="block font-medium text-slate-700 dark:text-slate-200 text-lg">{totalAvailableHoursEntireGoal}</span>
                         Available (Planned)
                    </div>
                </div>
                 {/* Stat Row 2 */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-slate-600 dark:text-slate-400">
                        <span className="block font-medium text-slate-700 dark:text-slate-200 text-lg">{totalAvailableHoursFromNow}</span>
                        Available (Remaining)
                    </div>
                     <div className="text-slate-600 dark:text-slate-400">
                         <span className="block font-medium text-slate-700 dark:text-slate-200 text-lg">{hoursLogged}</span>
                         Hours Logged
                    </div>
                </div>
                {/* Progress Bar Section */}
                <div className="pt-2">
                    <div className="flex justify-between mb-1">
                         <span className="font-medium text-slate-600 dark:text-slate-300">Progress</span>
                         <span className="font-medium text-slate-700 dark:text-slate-200">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden"> {/* Smaller progress bar */}
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                            role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                            aria-label={`Progress ${progress.toFixed(0)}%`}
                        ></div>
                    </div>
                     <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 text-right"> {/* Extra small text */}
                         {hoursLogged} / {totalAvailableHoursEntireGoal} logged
                     </div>
                </div>
            </div>
        </div>
    );
};