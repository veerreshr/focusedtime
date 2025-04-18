/*
 * src/components/Timeline.tsx
 * The main timeline view, showing TimelineDay components for the active goal.
 */
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getDatesInRange } from '../utils/dateHelpers';
import { TimelineDay } from './TimelineDay';

export const Timeline: React.FC = () => {
    const { activeGoal } = useAppContext();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, setTick] = useState(0); // State to force re-render every minute

    // --- Force re-render every minute for current hour update ---
    useEffect(() => {
        const intervalId = setInterval(() => {
            setTick(prevTick => prevTick + 1);
        }, 60000); // 60 seconds

        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

        // Scroll to current hour on mount or when active goal changes
        useEffect(() => {
            if (activeGoal) {
                // Use requestAnimationFrame to ensure DOM is ready after potential re-renders
                requestAnimationFrame(() => {
                    // Find the element marking the current hour
                     const currentHourElement = document.querySelector('[data-is-current-hour="true"]');
                     if (currentHourElement) {
                        currentHourElement.scrollIntoView({
                            behavior: 'smooth', 
                            block: 'center',
                            inline: 'nearest'
                        });
                     } else {
                        // Optional: If no current hour found (e.g., goal doesn't include today), scroll to top or first day?
                        // console.log("Current hour element not found for scrolling.");
                     }
                });
            }
        }, [activeGoal]); 

    if (!activeGoal) {
        return <div className="text-center text-slate-500 dark:text-slate-400 mt-10">Select or create a goal to view the timeline.</div>;
    }

    const dates = getDatesInRange(activeGoal.startDate, activeGoal.endDate);

     if (dates.length === 0) {
         return <div className="text-center text-slate-500 dark:text-slate-400 mt-10">Invalid date range for the selected goal.</div>;
     }

    // --- Render Timeline ---
    return (
        <div className="p-4 space-y-4">
             <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
                Hourly Timeline for "{activeGoal.title}"
             </h3>
             {dates.length > 0 ? (
                dates.map(date => (
                    <TimelineDay key={date} goal={activeGoal} date={date} />
                ))
             ) : (
                 <div className="text-center text-slate-500 dark:text-slate-400 mt-6">
                     No dates found for this goal's range. Check the start and end dates.
                 </div>
             )}
        </div>
    );
};