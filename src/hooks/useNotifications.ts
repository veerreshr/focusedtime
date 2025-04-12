/*
 * src/hooks/useNotifications.ts
 * Handles requesting permission and scheduling browser notifications.
 */
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { calculateReminderTime, formatTime, isPast } from '../utils/dateHelpers';

interface ScheduledNotification {
    id: string; // Unique ID (e.g., goalId-date-hour)
    timeoutId: number; // NodeJS.Timeout type in Node, number in browser
}

export const useNotifications = () => {
    const { state } = useAppContext();
    const { goals, reminders } = state;
    const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);
    const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

    // --- Request Permission ---
    const requestNotificationPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.error('This browser does not support desktop notification');
            alert('This browser does not support notifications.');
            setPermission('denied'); // Treat as denied if not supported
            return;
        }
        if (permission !== 'granted') {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result === 'denied') {
                // Optionally show a custom toast/alert explaining why notifications are useful
                console.warn('Notification permission denied.');
                 alert('Notifications are blocked. You can enable them in your browser settings.');
            }
        }
    }, [permission]);

    // --- Check permission on mount ---
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        } else {
            setPermission('denied'); // Not supported
        }
    }, []);

    // --- Clear all scheduled timeouts ---
    const clearAllTimeouts = useCallback(() => {
        scheduledNotifications.forEach(notif => clearTimeout(notif.timeoutId));
        setScheduledNotifications([]);
         console.log("Cleared all scheduled notification timeouts.");
    }, [scheduledNotifications]);

    // --- Schedule Notifications based on state ---
    useEffect(() => {
        // Clear existing timeouts before scheduling new ones
        clearAllTimeouts();

        if (permission !== 'granted' || !reminders.enabled || !goals) {
            return; // Don't schedule if disabled, permission denied, or no goals
        }

        const newScheduledNotifications: ScheduledNotification[] = [];
        const now = new Date();

        goals.forEach(goal => {
            goal.availability?.forEach(avail => {
                avail.hours.forEach(hour => {
                    const reminderTime = calculateReminderTime(avail.date, hour, reminders.minutesBefore);

                    if (reminderTime && !isPast(reminderTime)) {
                        const delay = reminderTime.getTime() - now.getTime();
                        if (delay > 0) { // Ensure delay is positive
                            const notificationId = `${goal.id}-${avail.date}-${hour}`;
                            const timeoutId = window.setTimeout(() => { // Use window.setTimeout for browser compatibility
                                console.log(`Triggering notification for: ${goal.title} at ${formatTime(hour)} on ${avail.date}`);
                                new Notification(`Upcoming Block: ${goal.title}`, {
                                    body: `Your scheduled block for "${goal.title}" at ${formatTime(hour)} starts in ${reminders.minutesBefore} minutes.`,
                                    icon: '/logo192.png', // Use your app's icon
                                    tag: notificationId, // Helps prevent duplicate notifications if scheduled multiple times
                                });
                                // Remove from scheduled list after firing
                                setScheduledNotifications(prev => prev.filter(n => n.id !== notificationId));
                            }, delay);

                            newScheduledNotifications.push({ id: notificationId, timeoutId });
                        }
                    }
                });
            });
        });

        setScheduledNotifications(newScheduledNotifications);
        console.log(`Scheduled ${newScheduledNotifications.length} notifications.`);

        // Cleanup function to clear timeouts when component unmounts or dependencies change
        return () => {
            clearAllTimeouts();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goals, reminders, permission]); // Rerun when goals, reminders, or permission change

    return { requestNotificationPermission, permission };
};