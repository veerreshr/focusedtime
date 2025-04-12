/*
 * src/components/Settings.tsx
 * Component to manage application settings like reminders and data.
 */
import React, { useState, useCallback } from 'react'; // Added useCallback
import { useAppContext } from '../contexts/AppContext';
import { useNotifications } from '../hooks/useNotifications';
import { format as formatFn } from 'date-fns';
import { FaBell, FaBellSlash, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaUpload, FaDownload } from 'react-icons/fa'; // Import icons
import { AppState } from '../types';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
    // Get state and dispatch from the application context
    const { state, dispatch } = useAppContext();
    const { reminders } = state; // Destructure reminders settings from state

    // Use the custom notification hook
    const { requestNotificationPermission, permission } = useNotifications();

    // State for providing user feedback during export/import operations
    const [exportStatus, setExportStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' | '' }>({ message: '', type: '' });
    const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' | '' }>({ message: '', type: '' });

    // --- Reminder Settings Handlers ---

    // Toggle reminder enabled state and request permission if needed
    const handleToggleReminders = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const enabled = e.target.checked;
        dispatch({ type: 'UPDATE_REMINDER_SETTINGS', payload: { enabled } });
        // If enabling and permission is not granted, request it
        if (enabled && permission === 'default') {
            requestNotificationPermission();
        }
    }, [dispatch, permission, requestNotificationPermission]); // Memoize handler

    // Update reminder time (minutes before)
    const handleMinutesChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const minutesBefore = parseInt(e.target.value, 10) as 5 | 10 | 15;
        dispatch({ type: 'UPDATE_REMINDER_SETTINGS', payload: { minutesBefore } });
    }, [dispatch]); // Memoize handler

    // --- Data Management Handlers (Defined inside the component) ---

    // Handle Data Export
    const handleExportData = useCallback(() => {
        setExportStatus({ message: 'Exporting...', type: 'info' }); // Provide immediate feedback
        try {
            // Stringify the entire application state
            const dataStr = JSON.stringify(state, null, 2); // Pretty print JSON
            const blob = new Blob([dataStr], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            // Create a temporary link to trigger download
            const link = document.createElement('a');
            link.href = url;
            const timestamp = formatFn(new Date(), 'yyyyMMdd_HHmmss');
            link.download = `focusedTime_backup_${timestamp}.json`; // Filename with timestamp

            // Trigger download and cleanup
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log("Data exported successfully.");
            setExportStatus({ message: 'Data exported successfully!', type: 'success' });
            setTimeout(() => setExportStatus({ message: '', type: '' }), 3000); // Clear message after 3s
        } catch (error) {
            console.error("Failed to export data:", error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during export';
            setExportStatus({ message: `Error: ${errorMessage}`, type: 'error' });
            alert(`Error exporting data: ${errorMessage}`); // Also show alert for critical errors
             // Keep error message displayed longer or until next action
        }
    }, [state]); // Depends on the current state

    // Handle Data Import
    const handleImportData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setImportStatus({ message: 'Processing file...', type: 'info' });
        const file = event.target.files?.[0];

        // Reset file input value immediately to allow re-importing the same file
        if (event.target) {
            event.target.value = '';
        }

        if (!file) {
             setImportStatus({ message: 'No file selected.', type: 'info' });
             setTimeout(() => setImportStatus({ message: '', type: '' }), 3000);
             return;
        }

        // Check file type (basic check)
        if (!file.type.includes('json')) {
             setImportStatus({ message: 'Invalid file type. Please select a .json file.', type: 'error' });
             alert('Invalid file type. Please select a .json file.');
             return;
        }


        const reader = new FileReader();
        reader.onload = (e) => {
            let importedState: AppState | null = null;
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("Failed to read file content.");
                }
                importedState = JSON.parse(text);

                // **Validation:** Check if the imported data looks like our AppState structure
                if (
                    importedState && typeof importedState === 'object' &&
                    Array.isArray(importedState.goals) && // Check goals array
                    typeof importedState.reminders === 'object' && // Check reminders object
                    typeof importedState.reminders.enabled === 'boolean' && // Check specific property
                    typeof importedState.reminders.minutesBefore === 'number'
                    // TODO: Add more robust validation (check goal structure, date formats, etc.)
                   )
                {
                     // Ask for confirmation before overwriting
                     if (window.confirm("Importing this file will overwrite ALL your current data (goals, settings, etc.). This action cannot be undone. Are you sure?")) {
                         // Dispatch action to load the validated state
                         dispatch({ type: 'LOAD_STATE', payload: importedState as AppState });

                         // Re-check and set active goal after import based on the newly loaded state
                         // Ensure goals array exists and has items before accessing index 0
                         const firstGoalId = importedState.goals?.length > 0 ? importedState.goals[0].id : null;
                         dispatch({ type: 'SET_ACTIVE_GOAL', payload: { id: firstGoalId } });

                         setImportStatus({ message: "Data imported successfully!", type: 'success' });
                         console.log("Data imported successfully.");
                         alert("Data imported successfully! The application will now use the imported data."); // Inform user

                     } else {
                          setImportStatus({ message: 'Import cancelled by user.', type: 'info' });
                     }
                } else {
                     // Throw error if validation fails
                     throw new Error("Invalid file format. The imported file does not match the expected FocusedTime data structure.");
                }
            } catch (error) {
                // Handle JSON parsing errors or validation errors
                console.error("Failed to import data:", error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error during import';
                setImportStatus({ message: `Import Error: ${errorMessage}`, type: 'error' });
                alert(`Error importing data: ${errorMessage}`);
            } finally {
                 // Clear status message after a delay, unless it was an error
                 if (importStatus.type !== 'error') {
                    setTimeout(() => setImportStatus({ message: '', type: '' }), 5000);
                 }
            }
        };
        // Handle file reading errors
        reader.onerror = (e) => {
             console.error("File reading error:", e);
             setImportStatus({ message: "Error reading the selected file.", type: 'error' });
             alert("Error reading file.");
        };
        // Read the file content as text
        reader.readAsText(file);
    }, [dispatch, importStatus.type]); // Depends on dispatch

    // Helper to render status icons
    const renderStatusIcon = (statusType: 'success' | 'error' | 'info' | '') => {
        switch (statusType) {
            case 'success': return <FaCheckCircle className="text-green-500" aria-label="Success" />;
            case 'error': return <FaExclamationCircle className="text-red-500" aria-label="Error" />;
            case 'info': return <FaInfoCircle className="text-blue-500" aria-label="Info" />;
            default: return null;
        }
    };


    // --- Render Component ---
    return (
        <div className="p-4 md:p-6 space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Settings</h2>

            {/* Reminder Settings Section */}
            <section aria-labelledby="reminder-settings-heading" className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                 <h3 id="reminder-settings-heading" className="text-lg font-medium text-slate-700 dark:text-slate-300">Time Block Reminders</h3>
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                    <label htmlFor="enableReminders" className="text-sm font-medium text-slate-600 dark:text-slate-400 pr-4 cursor-pointer">
                        Enable reminder notifications
                    </label>
                    {/* Accessible Toggle Switch */}
                    <label htmlFor="enableReminders" className="relative inline-flex items-center cursor-pointer">
                         <input
                            type="checkbox"
                            id="enableReminders"
                            className="sr-only peer" // Hide default checkbox
                            checked={reminders.enabled}
                            onChange={handleToggleReminders}
                            aria-describedby="notification-permission-status"
                         />
                         {/* Custom toggle UI */}
                         <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-blue-500 dark:peer-focus:ring-offset-slate-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                         {/* Optional: Add visual indicator like an icon */}
                         <span className="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">
                             {reminders.enabled ? <FaBell className="inline-block w-4 h-4 text-green-500" /> : <FaBellSlash className="inline-block w-4 h-4 text-slate-400" />}
                         </span>
                    </label>
                </div>

                {/* Reminder Time Select (conditionally rendered) */}
                {reminders.enabled && (
                    <motion.div // Animate presence of select dropdown
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.2 }}
                        className="pt-2 overflow-hidden"
                    >
                        <label htmlFor="reminderTime" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Remind me before block starts:
                        </label>
                        <select
                            id="reminderTime"
                            value={reminders.minutesBefore}
                            onChange={handleMinutesChange}
                            className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                            disabled={!reminders.enabled} // Technically redundant due to conditional render, but safe
                        >
                            <option value={5}>5 minutes</option>
                            <option value={10}>10 minutes</option>
                            <option value={15}>15 minutes</option>
                        </select>
                    </motion.div>
                )}

                {/* Notification Permission Status/Action */}
                 <div id="notification-permission-status" className="text-xs text-slate-500 dark:text-slate-400 pt-1" aria-live="polite">
                    {/* Granted Status */}
                    {permission === 'granted' && reminders.enabled && <span className="text-green-600 dark:text-green-400 flex items-center"><FaCheckCircle className="mr-1"/> Notifications allowed and enabled.</span>}
                    {permission === 'granted' && !reminders.enabled && <span className="text-slate-500 dark:text-slate-400 flex items-center"><FaInfoCircle className="mr-1"/> Notifications allowed by browser, but reminders are turned off above.</span>}
                    {/* Denied Status */}
                    {permission === 'denied' && <span className="text-red-600 dark:text-red-400 flex items-center"><FaExclamationCircle className="mr-1"/> Notifications blocked. Enable in browser settings to receive reminders.</span>}
                    {/* Default (Prompt) Status */}
                    {permission === 'default' && (
                        <span className="text-orange-600 dark:text-orange-400">
                            <FaExclamationCircle className="inline-block mr-1 mb-px"/> Notification permission needed.
                            <button
                                onClick={requestNotificationPermission}
                                className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
                            >
                                Allow Notifications
                            </button>
                        </span>
                    )}
                 </div>
                 {/* Warning if Notification API not supported */}
                 {!('Notification' in window) && (
                     <p className="text-xs text-red-600 dark:text-red-400 pt-1 flex items-center"><FaExclamationCircle className="mr-1"/> Your browser doesn't support notifications.</p>
                 )}
            </section>

             {/* Data Management Section */}
             <section aria-labelledby="data-management-heading" className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                 <h3 id="data-management-heading" className="text-lg font-medium text-slate-700 dark:text-slate-300">Data Management</h3>
                 <p className="text-xs text-slate-500 dark:text-slate-400">Export your data for backup or import data from a previous backup file (.json format required).</p>

                 {/* Export */}
                 <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                     <button
                         onClick={handleExportData}
                         className="w-full sm:w-auto px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 inline-flex items-center justify-center gap-2"
                     >
                         <FaDownload /> Export Data (.json)
                     </button>
                      {/* Export Status Message */}
                      {exportStatus.message && (
                          <span className={`text-sm flex items-center gap-1 ${exportStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : exportStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {renderStatusIcon(exportStatus.type)} {exportStatus.message}
                          </span>
                      )}
                 </div>

                 {/* Import */}
                 <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                     {/* Visually styled label acting as a button */}
                     <label className="w-full sm:w-auto px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 dark:focus-within:ring-offset-slate-800 cursor-pointer inline-flex items-center justify-center gap-2">
                         <FaUpload /> Import Data (.json)
                         {/* Hidden actual file input */}
                         <input
                             type="file"
                             accept=".json,application/json" // Specify accepted MIME type and extension
                             onChange={handleImportData}
                             className="hidden"
                             aria-label="Select JSON file to import"
                         />
                     </label>
                     {/* Import Status Message */}
                     {importStatus.message && (
                          <span className={`text-sm flex items-center gap-1 ${importStatus.type === 'success' ? 'text-green-600 dark:text-green-400' : importStatus.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                              {renderStatusIcon(importStatus.type)} {importStatus.message}
                          </span>
                      )}
                 </div>
             </section>
        </div>
    );
};