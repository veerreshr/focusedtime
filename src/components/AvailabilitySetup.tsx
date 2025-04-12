import React from 'react';
import { useAppContext } from '../contexts/AppContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getDatesInRange, formatReadableDate } from '../utils/dateHelpers';
import { TimeGrid } from './TimeGrid';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';

export const AvailabilitySetup: React.FC = () => {
    const { activeGoal } = useAppContext(); // Use the derived activeGoal from context

    // Show message if no active goal
    if (!activeGoal) {
        return (
             <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                <FaCalendarAlt className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
                <p className="text-slate-500 dark:text-slate-400">
                    Select or create a goal from the sidebar to manage its availability schedule.
                </p>
            </div>
        );
    }

    // Get dates within the goal's range
    const dates = getDatesInRange(activeGoal.startDate, activeGoal.endDate);

    // Handle invalid date range
    if (dates.length === 0 && activeGoal.startDate && activeGoal.endDate) {
         return (
             <div className="p-6 text-center text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg m-4">
                 Invalid date range for the selected goal ({formatReadableDate(activeGoal.startDate)} to {formatReadableDate(activeGoal.endDate)}). Please check the goal's start and end dates.
             </div>
         );
    }

    // Render the availability setup UI
    return (
        <div className="p-4 md:p-6 space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-1">
                Manage Availability for "{activeGoal.title}"
             </h2>
             {/* Informational message about template and overrides */}
              <div className="flex items-start p-3 text-sm text-blue-700 bg-blue-50 rounded-lg dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700" role="alert">
                <FaInfoCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                    Your default weekly availability template (set in the goal's settings) has been applied. Use the grids below to make specific changes or exceptions for individual days within the goal period ({formatReadableDate(activeGoal.startDate)} to {formatReadableDate(activeGoal.endDate)}).
                </div>
             </div>
             {/* Map through dates and render TimeGrid for each */}
             {dates.map(date => (
                 <TimeGrid key={date} goalId={activeGoal.id} date={date} />
             ))}
        </div>
    );
};