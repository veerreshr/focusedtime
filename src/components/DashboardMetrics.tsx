/*
 * src/components/DashboardMetrics.tsx
 * Displays key progress metrics for the active goal.
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

    return {
        totalPossibleHours,
        totalAvailableHoursEntireGoal,
        totalAvailableHoursFromNow,
        hoursLogged
    };
};


export const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ goal }) => {

    // Calculate metrics using useMemo based on the passed 'goal' prop
    const {
        totalPossibleHours,
        totalAvailableHoursEntireGoal,
        totalAvailableHoursFromNow,
        hoursLogged
    } = useMemo(() => calculateMetrics(goal), [goal]); // Dependency is the goal prop

    
    // Calculate the third segment: Past Available but Not Logged
    // Ensure it's not negative (e.g., if logged hours somehow exceed past available)
    const pastAvailableNotLogged = Math.max(0, totalAvailableHoursEntireGoal - totalAvailableHoursFromNow - hoursLogged);

     // Calculate percentages for the bar segments
     const loggedPercent = totalAvailableHoursEntireGoal > 0
     ? (hoursLogged / totalAvailableHoursEntireGoal) * 100
     : 0;
    const futurePercent = totalAvailableHoursEntireGoal > 0
        ? (totalAvailableHoursFromNow / totalAvailableHoursEntireGoal) * 100
        : 0;
    // Calculate the last segment ensuring total doesn't exceed 100% due to rounding
    const pastNotLoggedPercent = Math.max(0, 100 - loggedPercent - futurePercent);



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

                {/* 3-Segment Progress Bar Section */}
                <div className="pt-2">
                     <div
                         className="w-full flex rounded-full h-2 overflow-hidden" // Increased height slightly
                         title={`Logged: ${hoursLogged}, Future Available: ${totalAvailableHoursFromNow}, Past Unlogged: ${pastAvailableNotLogged}`}
                     >
                         {/* Logged Segment (Past) */}
                         <div
                             className="bg-blue-600 h-full transition-all duration-500 ease-out"
                             style={{ width: `${loggedPercent}%` }}
                             role="progressbar"
                             aria-valuenow={hoursLogged}
                             aria-valuemin={0}
                             aria-valuemax={totalAvailableHoursEntireGoal}
                             aria-label={`${hoursLogged} hours logged`}
                         ></div>
                         {/* Past Available, Not Logged Segment */}
                         <div
                             className="bg-slate-300 dark:bg-slate-600 h-full transition-all duration-500 ease-out"
                             style={{ width: `${pastNotLoggedPercent}%` }}
                             aria-hidden="true"
                         ></div>
                         {/* Future Available Segment */}
                         <div
                             className="bg-green-400 h-full transition-all duration-500 ease-out"
                             style={{ width: `${futurePercent}%` }}
                             aria-hidden="true"
                         ></div>
                     </div>
                     {/* Legend for the bar */}
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                         <span className="flex items-center" title={`${hoursLogged} hours`}>
                            <span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1"></span>Logged({loggedPercent.toFixed(1)}%)
                         </span>
                         <span className="flex items-center" title={`${pastAvailableNotLogged} hours`}>
                            <span className="inline-block w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mr-1"></span>Past Unlogged({pastNotLoggedPercent.toFixed(1)}%)
                         </span>
                         <span className="flex items-center" title={`${totalAvailableHoursFromNow} hours`}>
                            <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-1"></span>Future({futurePercent.toFixed(1)}%)
                         </span>
                     </div>
                </div>
            </div>
        </div>
    );
};