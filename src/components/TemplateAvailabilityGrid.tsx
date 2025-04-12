/*
 * src/components/TemplateAvailabilityGrid.tsx
 * Reusable component for setting the weekly template availability.
 */
import React from 'react';
import { formatTime } from '../utils/dateHelpers';

interface TemplateAvailabilityGridProps {
    templateAvailability: Record<number, number[]>; // 0=Sun, ..., 6=Sat
    onHourToggle: (dayOfWeek: number, hour: number) => void;
}

const daysOfWeek = [
    { name: 'Sun', value: 0 },
    { name: 'Mon', value: 1 },
    { name: 'Tue', value: 2 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 6 },
];

export const TemplateAvailabilityGrid: React.FC<TemplateAvailabilityGridProps> = ({
    templateAvailability,
    onHourToggle,
}) => {
    return (
        <div className="space-y-2">
            {daysOfWeek.map(({ name, value: dayOfWeek }) => (
                <div key={dayOfWeek} className="flex items-center space-x-2">
                    <span className="w-5 sm:w-10 text-xs font-semibold text-slate-600 dark:text-slate-400 text-right">
                        {name}
                    </span>
                    <div className="flex-grow grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-1">
                        {Array.from({ length: 24 }).map((_, hour) => {
                            const isSelected = templateAvailability[dayOfWeek]?.includes(hour) || false;
                            return (
                                <button
                                    key={`${dayOfWeek}-${hour}`}
                                    type="button" // Prevent form submission
                                    onClick={() => onHourToggle(dayOfWeek, hour)}
                                    className={`p-1 rounded text-[10px] font-mono transition-colors duration-150 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 dark:focus:ring-offset-slate-800
                                        ${isSelected
                                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                                        }`}
                                    title={isSelected ? `Deselect ${name} ${formatTime(hour)}` : `Select ${name} ${formatTime(hour)}`}
                                    aria-pressed={isSelected}
                                >
                                    {String(hour).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
