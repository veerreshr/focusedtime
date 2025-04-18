import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatReadableDate, formatTime } from '../utils/dateHelpers';
import { isToday, parseISO } from 'date-fns';

interface TimeGridProps {
  goalId: string;
  date: string; // YYYY-MM-DD format
}

export const TimeGrid: React.FC<TimeGridProps> = React.memo(({ goalId, date }) => {
  const { state, dispatch } = useAppContext();
  const goal = state.goals.find(g => g.id === goalId);
  const availabilityForDate = goal?.availability.find(a => a.date === date);
  const selectedHours = availabilityForDate?.hours || [];

  const isCurrentDate = isToday(parseISO(date));

  const handleHourToggle = (hour: number) => {
    const isSelected = selectedHours.includes(hour);
    dispatch({
      type: 'UPDATE_AVAILABILITY',
      payload: { goalId, date, hour, selected: !isSelected },
    });
  };

  return (
    <div className={`p-4 border border-slate-200 dark:border-slate-700 rounded-l ${isCurrentDate?'bg-blue-100 dark:bg-blue-900':''}`} data-is-current-date={isCurrentDate?'true':undefined}>
       <h4 className="text-sm font-semibold mb-3 text-center text-slate-700 dark:text-slate-300">
           {formatReadableDate(date)} - Available Hours
       </h4>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1">
        {Array.from({ length: 24 }).map((_, hour) => {
          const isSelected = selectedHours.includes(hour);
          return (
            <button
              key={hour}
              onClick={() => handleHourToggle(hour)}
              className={`p-1.5 rounded text-xs font-mono transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
                ${isSelected
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' // Selected: #3B82F6
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300' // Not selected
                }`}
              title={isSelected ? `Deselect ${formatTime(hour)}` : `Select ${formatTime(hour)}`}
              aria-pressed={isSelected}
            >
              {String(hour).padStart(2, '0')} {/* Display hour like 00, 01, ... 23 */}
            </button>
          );
        })}
      </div>
    </div>
  );
});
