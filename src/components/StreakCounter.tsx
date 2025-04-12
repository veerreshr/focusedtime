/*
 * src/components/StreakCounter.tsx
 * Displays the current consecutive day streak of logged hours.
 */
import React, { useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { calculateStreak } from '../utils/dateHelpers';
import { FaFire } from 'react-icons/fa';

export const StreakCounter: React.FC = () => {
    const { state } = useAppContext();
    // Calculate streak based on *all* goals' accomplishments
    const currentStreak = useMemo(() => calculateStreak(state.goals), [state.goals]);

    if (currentStreak === 0) {
        return null; // Don't display if streak is zero
    }

    return (
        <div className="flex items-center space-x-2 p-3 bg-amber-100 dark:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-lg shadow-sm">
            <FaFire className="w-5 h-5 text-amber-500 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Current Streak: {currentStreak} day{currentStreak > 1 ? 's' : ''}
            </span>
        </div>
    );
};