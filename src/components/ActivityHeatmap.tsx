import React, { useMemo } from 'react';
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import { Tooltip as ReactTooltip } from 'react-tooltip'; // Using react-tooltip for tooltips
import { startOfDay, endOfDay, subMonths } from 'date-fns';
import { useAppContext } from '../contexts/AppContext';
import { formatDate } from '../utils/dateHelpers';


// type HeatmapCallbackValue = { date: string; count: number } | null | undefined;
type TooltipDataAttrs = { [key: string]: string | number | boolean | undefined };

export const ActivityHeatmap: React.FC = () => {
    const { state } = useAppContext();
    const { goals } = state;

    const today = endOfDay(new Date()); 
    const startDate = startOfDay(subMonths(today,12)); 
    const endDate = today;

    // Process accomplishment data into daily counts
    const heatmapData = useMemo(() => {
        const dailyCounts: Record<string, number> = {};

        goals.forEach(goal => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            Object.entries(goal.availability || {}).forEach(([_,data]) => {
                const dateKey = formatDate(data.date); // Ensure consistent YYYY-MM-DD format
                dailyCounts[dateKey] = 0;
            });
        });

        goals.forEach(goal => {
            Object.entries(goal.accomplishments || {}).forEach(([dateStr, hourMap]) => {
                const dateKey = formatDate(dateStr); // Ensure consistent YYYY-MM-DD format
                const accomplishmentCount = Object.keys(hourMap || {}).length;
                if (accomplishmentCount > 0) {
                    dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + accomplishmentCount;
                }
            });
        });
        console.log(dailyCounts, 'dailyCounts'); // Debugging output
        // Convert to array format required by react-calendar-heatmap
        return Object.entries(dailyCounts).map(([date, count]) => ({
            date: date,
            count: count,
        }));
    }, [goals]);

    // Function to determine the CSS class (color intensity) based on count
    // Adjust thresholds and classes as needed
    const getClassForValue = (value: ReactCalendarHeatmapValue<string> | undefined ): string => {
        if (!value || value.count === 0) {
            return 'color-empty'; // Default empty color
        }
        if (value.count <= 1) {
            return 'color-scale-1'; // Lightest color
        }
        if (value.count <= 3) {
            return 'color-scale-2';
        }
        if (value.count <= 5) {
            return 'color-scale-3';
        }
        return 'color-scale-4'; // Darkest color
    };

    const getTooltipDataAttrs = (value: ReactCalendarHeatmapValue<string> | undefined): TooltipDataAttrs => {
        const baseAttrs = { 'data-tooltip-id': 'heatmap-tooltip' };
        if (!value || !value.date) {
            // Provide minimal content or rely on tooltip library to not show for empty data
            return { ...baseAttrs, 'data-tooltip-content': 'No data' };
        }
        // Date should already be in YYYY-MM-DD format from heatmapData processing
        const dateStr = value.date;
        const countText = value.count ? `${value.count} hour${value.count !== 1 ? 's' : ''} logged` : 'No hours logged';
        return {
            ...baseAttrs,
            'data-tooltip-content': `${dateStr}: ${countText}`,
        };
   };

    return (
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow lg:pr-10 lg:max-w-[1024px]">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">Activity Overview (Last Year)</h3>
            <div className="overflow-x-auto w-auto"> {/* Allow horizontal scroll on small screens if needed */}
                <div className="min-w-[750px]">
                    <CalendarHeatmap
                        startDate={startDate}
                        endDate={endDate}
                        values={heatmapData}
                        classForValue={getClassForValue}
                        // Tooltip setup using react-tooltip (make sure to install react-tooltip)
                        tooltipDataAttrs={getTooltipDataAttrs}
                        showWeekdayLabels={true}
                        showMonthLabels={true}
                        gutterSize={2} // Adjust spacing between squares
                        showOutOfRangeDays={true}
                    />
                 </div>
            </div>
             {/* Tooltip component from react-tooltip effect="solid"*/}
             <ReactTooltip id="heatmap-tooltip" place="top"  className="text-xs !bg-slate-700 dark:!bg-slate-100 !text-white dark:!text-black" />
             {/* Legend (Optional but recommended) */}
             <div className="flex justify-end items-center space-x-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                 <span>Less</span>
                 <span className="w-3 h-3 rounded-sm color-empty border border-slate-300 dark:border-slate-600"></span>
                 <span className="w-3 h-3 rounded-sm bg-blue-200"></span>
                 <span className="w-3 h-3 rounded-sm bg-blue-400"></span>
                 <span className="w-3 h-3 rounded-sm bg-blue-600"></span>
                 <span className="w-3 h-3 rounded-sm bg-blue-800"></span>
                 <span>More</span>
             </div>
        </div>
    );
};