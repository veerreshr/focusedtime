import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { formatTime, isHourPast, isHourCurrent, getCurrentHourProgress } from '../utils/dateHelpers';
import { motion } from 'framer-motion';

interface TimelineHourProps {
  goalId: string;
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  plan: string;
  accomplishment: string;
  isAvailable: boolean;
}

export const TimelineHour: React.FC<TimelineHourProps> = React.memo(({
    goalId, date, hour, plan: initialPlan, accomplishment: initialAccomplishment, isAvailable
}) => {
    const { dispatch } = useAppContext();
    const [plan, setPlan] = useState(initialPlan || '');
    const [accomplishment, setAccomplishment] = useState(initialAccomplishment || '');
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [isEditingAccomplishment, setIsEditingAccomplishment] = useState(false);

    const planInputRef = useRef<HTMLTextAreaElement>(null);
    const accomplishmentInputRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<number | null>(null); // Ref for auto-save timeout

    const isPast = isHourPast(date, hour);
    const isCurrent = isHourCurrent(date, hour);
    const currentProgress = isCurrent ? getCurrentHourProgress(date, hour) : 0;

    // --- Auto-save Logic ---
    const debounceSave = useCallback((type: 'plan' | 'accomplishment', value: string) => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = window.setTimeout(() => {
            if (type === 'plan') {
                 dispatch({ type: 'UPDATE_PLAN', payload: { goalId, date, hour, text: value } });
            } else {
                 dispatch({ type: 'UPDATE_ACCOMPLISHMENT', payload: { goalId, date, hour, text: value } });
            }
             console.log(`Auto-saved ${type} for ${date} ${hour}:00`);
        }, 1000); // Auto-save after 1 second of inactivity
    }, [dispatch, goalId, date, hour]);

    // --- Handlers for Plan ---
    const handlePlanChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
         if (value.length <= 200) {
             setPlan(value);
             debounceSave('plan', value);
         }
    };

    const handlePlanBlur = () => {
        setIsEditingPlan(false);
         // Ensure final value is saved immediately on blur
         if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
         dispatch({ type: 'UPDATE_PLAN', payload: { goalId, date, hour, text: plan } });
    };

    const handlePlanClick = () => {
        // if (!isPast && !isCurrent)
        setIsEditingPlan(true);
    };

    // --- Handlers for Accomplishment ---
    const handleAccomplishmentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
         const value = e.target.value;
         if (value.length <= 500) {
             setAccomplishment(value);
             debounceSave('accomplishment', value);
         }
    };

    const handleAccomplishmentBlur = () => {
        setIsEditingAccomplishment(false);
         // Ensure final value is saved immediately on blur
         if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
         dispatch({ type: 'UPDATE_ACCOMPLISHMENT', payload: { goalId, date, hour, text: accomplishment } });
    };

     const handleAccomplishmentClick = () => {
        if (isPast || isCurrent) { // Allow editing accomplishment for past and current hours
             setIsEditingAccomplishment(true);
        }
    };

    // --- Focus input when editing starts ---
    useEffect(() => {
        if (isEditingPlan && planInputRef.current) {
            planInputRef.current.focus();
        }
    }, [isEditingPlan]);

     useEffect(() => {
        if (isEditingAccomplishment && accomplishmentInputRef.current) {
            accomplishmentInputRef.current.focus();
        }
    }, [isEditingAccomplishment]);

     // --- Cleanup timeout on unmount ---
     useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);


    // --- Styling based on time ---
    let bgColor = 'bg-white dark:bg-slate-800'; // Future default
    let textColor = 'text-slate-800 dark:text-slate-200';
    let borderColor = 'border-slate-200 dark:border-slate-700';
    let timeColor = 'text-slate-400 dark:text-slate-500';
    let hoverEffect = 'hover:bg-slate-50 dark:hover:bg-slate-700';
    let glowEffect = ''; // For active hour

    if (!isAvailable) {
         bgColor = 'bg-slate-50 dark:bg-slate-800/30'; // Very light grey if not available
         textColor = 'text-slate-400 dark:text-slate-600';
         hoverEffect = ''; // No hover effect if not available
         borderColor = 'border-slate-100 dark:border-slate-700/50';
    } else if (isPast) {
        bgColor = 'bg-gray-100 dark:bg-gray-700/60'; // Grey (#6B7280) - using Tailwind's gray
        textColor = 'text-gray-500 dark:text-gray-400';
        timeColor = 'text-gray-400 dark:text-gray-500';
        hoverEffect = 'hover:bg-gray-200 dark:hover:bg-gray-700';
    } else if (isCurrent) {
        // Gradient background for current hour - applied via style prop
        bgColor = ''; // Background is handled by style
        textColor = 'text-blue-800 dark:text-blue-200';
        timeColor = 'text-blue-500 dark:text-blue-400 font-semibold';
        hoverEffect = ''; // No hover needed for current hour maybe? Or subtle one.
        glowEffect = 'shadow-lg shadow-blue-100/30 dark:shadow-blue-400/20 ring-2 ring-blue-200 dark:ring-blue-400 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'; // Glow effect
    }

    const backgroundStyle = isCurrent && isAvailable
        ? { background: `linear-gradient(to right,rgb(190 219 255) ${currentProgress}%, white ${currentProgress}%)` } // Blue to white gradient
        : isCurrent 
            ? { background: `linear-gradient(to right, rgb(190 219 255) ${currentProgress}%, rgb(248 250 252) ${currentProgress}%)` } 
            : {};

    const darkBackgroundStyle = isCurrent && isAvailable
        ? { background: `linear-gradient(to right, #3B82F6 ${currentProgress}%, #1E293B ${currentProgress}%)` } // Blue to slate-900 gradient for dark mode
        : isCurrent 
            ? { background: `linear-gradient(to right, #3B82F6 ${currentProgress}%, #1E293B ${currentProgress}%)` } 
            : {};


    return (
        <motion.div
            className={`relative flex items-start space-x-3 p-3 border-b ${borderColor} ${bgColor} ${hoverEffect} transition-all duration-150 ease-in-out rounded-sm ${glowEffect}`}
            style={
                document.documentElement.classList.contains('dark') ? darkBackgroundStyle : backgroundStyle} // Apply gradient style conditionally
            data-is-current-hour={isCurrent ? 'true' : undefined}
        >
            {/* Time Column */}
            <div className={`w-12 text-right font-mono text-xs pt-1 flex-shrink-0 ${timeColor}`}>
                {formatTime(hour)}
            </div>

            {/* Content Column */}
            <div className="flex-grow min-w-0">
                {/* Plan Section */}
                {isAvailable && (
                    <div className="mb-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Plan:</label>
                        {isEditingPlan ? (
                            <textarea
                                ref={planInputRef}
                                value={plan}
                                onChange={handlePlanChange}
                                onBlur={handlePlanBlur}
                                placeholder="What do you plan to do?"
                                rows={2}
                                maxLength={200}
                                className="w-full p-1 text-sm border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-100 resize-none"
                            />
                        ) : (
                            <div
                                onClick={handlePlanClick}
                                className={`text-sm min-h-[2em] p-1 rounded ${plan ? textColor : 'text-slate-400 dark:text-slate-500 italic'} cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700`}
                            >
                                {plan || ( 'Click to add plan...' )}
                            </div>
                        )}
                    </div>
                )}

                 {/* Accomplishment Section */}
                {isAvailable && (
                    <div>
                         <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">Accomplished:</label>
                         {isEditingAccomplishment ? (
                             <textarea
                                ref={accomplishmentInputRef}
                                value={accomplishment}
                                onChange={handleAccomplishmentChange}
                                onBlur={handleAccomplishmentBlur}
                                placeholder="What did you achieve?"
                                rows={2}
                                maxLength={500}
                                className="w-full p-1 text-sm border border-blue-300 dark:border-blue-700 rounded bg-white dark:bg-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none text-slate-800 dark:text-slate-100 resize-none"
                            />
                         ) : (
                             <div
                                onClick={handleAccomplishmentClick}
                                className={`text-sm min-h-[2em] p-1 rounded ${accomplishment ? textColor : 'text-slate-400 dark:text-slate-500 italic'} ${(isPast || isCurrent) ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700' : 'cursor-default'}`}
                            >
                                {accomplishment || ( (isPast || isCurrent) ? 'Click to log accomplishment...' : 'Pending...')}
                            </div>
                         )}
                    </div>
                )}

                {/* Message for unavailable hours */}
                {!isAvailable && (
                     <div className="text-sm text-slate-400 dark:text-slate-600 italic pt-1">
                         Not scheduled
                     </div>
                )}
            </div>
        </motion.div>
       // </motion.div>
    );
});