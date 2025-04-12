import React from 'react';
import { FaHourglassHalf } from 'react-icons/fa'; // Using react-icons

export const Logo: React.FC = () => {
    return (
        <div className="flex items-center space-x-2">
            <FaHourglassHalf className="text-blue-500 w-6 h-6" />
            <span className="font-inter font-bold text-xl text-slate-800 dark:text-slate-200">
                FocusedTime
            </span>
        </div>
    );
};