/*
 * src/components/
 * Groups TimelineHour components for a single day.
 */
import React from 'react';
import { TimelineHour } from './TimelineHour';
import { formatReadableDate } from '../utils/dateHelpers';
import { Goal } from '../types';

interface TimelineDayProps {
  goal: Goal;
  date: string; // YYYY-MM-DD
}

export const TimelineDay: React.FC<TimelineDayProps> = React.memo(({ goal, date }) => {
    const availabilityForDate = goal.availability?.find(a => a.date === date);
    const availableHours = availabilityForDate?.hours || [];
    const plansForDate = goal.plans?.[date] || {};
    const accomplishmentsForDate = goal.accomplishments?.[date] || {};

    // Create hour blocks for 0-23, marking availability
    const hours = Array.from({ length: 24 }).map((_, hour) => ({
        hour,
        isAvailable: availableHours.includes(hour),
        plan: plansForDate[hour] || '',
        accomplishment: accomplishmentsForDate[hour] || '',
    }));

    // Optimization: Only render the day if there's availability or logged data
    // const hasContent = availableHours.length > 0 || Object.keys(plansForDate).length > 0 || Object.keys(accomplishmentsForDate).length > 0;
    // if (!hasContent) return null;
    // --> Decided against this optimization for now to show all days consistently.

    return (
        <div className="mb-6">
            <h4 className="text-md font-semibold text-slate-700 dark:text-slate-300 mb-2 sticky top-0 bg-slate-100 dark:bg-slate-800/80 backdrop-blur-sm py-2 px-3 rounded-t-md z-10">
                {formatReadableDate(date)}
            </h4>
            <div className="border border-slate-200 dark:border-slate-700 rounded-b-md overflow-hidden">
                {/* Consider using react-virtuoso here for long timelines */}
                {hours.map(({ hour, isAvailable, plan, accomplishment }) => (
                    <TimelineHour
                        key={`${date}-${hour}`}
                        goalId={goal.id}
                        date={date}
                        hour={hour}
                        plan={plan}
                        accomplishment={accomplishment}
                        isAvailable={isAvailable}
                    />
                ))}
            </div>
        </div>
    );
});