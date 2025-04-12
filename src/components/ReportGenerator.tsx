/*
 * src/components/ReportGenerator.tsx
 * Generates and provides options for exporting/sharing weekly reports.
 * UPDATED to use papaparse instead of json2csv.
 */
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Goal } from '../types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { format as formatFn, startOfWeek, endOfWeek, subWeeks, eachDayOfInterval, parseISO } from 'date-fns';
import { unparse } from 'papaparse'; // Import from papaparse
import { FaFileCsv, FaFileAlt, FaShareAlt, FaCalendarWeek, FaEye, FaTimes } from 'react-icons/fa';
import { formatTime } from '../utils/dateHelpers';

// Define the structure for CSV data rows
interface CsvDataRow {
    goal_id: string;
    goal_title: string;
    date: string;
    hour: string; // Format as HH:mm
    plan?: string;
    accomplishment?: string;
}

export const ReportGenerator: React.FC = () => {
    const { state } = useAppContext();
    const { goals } = state;
    const [weekOffset, setWeekOffset] = useState(1);
    const [previewText, setPreviewText] = useState<string | null>(null);

    // Calculate the date range for the selected week
    const { weekStart, weekEnd } = useMemo(() => {
        const today = new Date();
        const targetDate = subWeeks(today, weekOffset);
        const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
        return { weekStart, weekEnd };
    }, [weekOffset]);

    // Filter and process data for the selected week range
    const reportData = useMemo(() => {
        const data: CsvDataRow[] = [];
        const summary = { totalHoursPlanned: 0, totalHoursLogged: 0, planSummary: '', accomplishmentSummary: '' };
        // eslint-disable-next-line prefer-const
        let planTexts: string[] = []; let accomplishmentTexts: string[] = [];

        goals.forEach(goal => {
            const datesInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
            datesInWeek.forEach(day => {
                const dateStr = formatFn(day, 'yyyy-MM-dd');
                const availabilityForDate = goal.availability?.find(a => a.date === dateStr);
                const availableHours = availabilityForDate?.hours || [];
                const plansForDate = goal.plans?.[dateStr] || {};
                const accomplishmentsForDate = goal.accomplishments?.[dateStr] || {};

                for (let hour = 0; hour < 24; hour++) {
                    const plan = plansForDate[hour]; const accomplishment = accomplishmentsForDate[hour];
                    const isPlanned = availableHours.includes(hour);
                    if (isPlanned || plan || accomplishment) {
                        data.push({ goal_id: goal.id, goal_title: goal.title, date: dateStr, hour: formatTime(hour), plan: plan || '', accomplishment: accomplishment || '' });
                        if (isPlanned) summary.totalHoursPlanned++;
                        if (accomplishment) { summary.totalHoursLogged++; accomplishmentTexts.push(`- ${dateStr} ${formatTime(hour)} (${goal.title}): ${accomplishment}`); }
                        if (plan) { planTexts.push(`- ${dateStr} ${formatTime(hour)} (${goal.title}): ${plan}`); }
                    }
                }
            });
        });
        summary.planSummary = planTexts.length > 0 ? planTexts.join('\n') : 'No plans recorded for this period.';
        summary.accomplishmentSummary = accomplishmentTexts.length > 0 ? accomplishmentTexts.join('\n') : 'No accomplishments logged for this period.';
        return { csvData: data, summary };
    }, [goals, weekStart, weekEnd]);

    // --- Generate Text Summary String ---
    const generateTextSummary = (): string => {
        const { summary } = reportData;
        const weekStartDateStr = formatFn(weekStart, 'MMM d, yyyy');
        const weekEndDateStr = formatFn(weekEnd, 'MMM d, yyyy');
        return `FocusedTime Weekly Report\n=============================\nPeriod: ${weekStartDateStr} - ${weekEndDateStr}\n\nSummary:\n--------\nHours Planned This Week: ${summary.totalHoursPlanned}\nHours Logged This Week: ${summary.totalHoursLogged}\n\nAccomplishments Logged:\n-----------------------\n${summary.accomplishmentSummary}\n\nPlans Recorded:\n---------------\n${summary.planSummary}\n`;
    };

    // --- CSV Generation using Papaparse ---
    const generateCSV = () => {
        if (reportData.csvData.length === 0) { alert("No data available for the selected week to generate CSV."); return; }
        try {
            // Define the order of columns for the CSV
            const fields: (keyof CsvDataRow)[] = ['goal_id', 'goal_title', 'date', 'hour', 'plan', 'accomplishment'];
            // Use papaparse.unparse to convert JSON array to CSV string
            const csv = unparse(reportData.csvData, {
                columns: fields, // Specify column order
                header: true     // Include header row
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const weekStartDateStr = formatFn(weekStart, 'yyyyMMdd');
            link.download = `focusedTime_report_${weekStartDateStr}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("CSV report generated using papaparse.");
        } catch (err) {
            console.error("Error generating CSV:", err);
            alert(`Error generating CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

     // --- Download Text Summary ---
     const downloadTextSummary = () => {
        const summaryText = generateTextSummary();
        if (reportData.csvData.length === 0) { alert("No data available for the selected week to generate a text summary."); return; }
        try {
            const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const weekStartDateStr = formatFn(weekStart, 'yyyyMMdd');
            link.download = `focusedTime_report_${weekStartDateStr}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("Text summary downloaded.");
        } catch (err) {
            console.error("Error downloading text summary:", err);
            alert(`Error downloading summary: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
     };

     // --- Share Report ---
     const shareReport = async () => {
        const summaryText = generateTextSummary();
         if (reportData.csvData.length === 0) { alert("No data available for the selected week to share."); return; }
         if (!navigator.onLine) { alert("Sharing requires an internet connection."); return; }
         if (navigator.share) {
             try {
                 const weekStartDateStr = formatFn(weekStart, 'MMM d');
                 await navigator.share({ title: `FocusedTime Report (Week of ${weekStartDateStr})`, text: summaryText });
                 console.log('Report shared successfully');
             } catch (error) {
                 console.error('Error sharing report:', error);
                 if ((error as DOMException).name !== 'AbortError') { alert('Could not share the report.'); }
             }
         } else {
             try { await navigator.clipboard.writeText(summaryText); alert('Web Share not supported. Report copied to clipboard!'); }
             catch (err) { console.error('Failed to copy report to clipboard:', err); alert('Web Share not supported, and failed to copy report to clipboard.'); }
         }
    };

    // --- Handle Preview ---
    const handlePreview = () => {
         if (reportData.csvData.length === 0) { alert("No data available for the selected week to preview."); setPreviewText(null); return; }
        setPreviewText(generateTextSummary());
    };

    // Determine if actions should be disabled
    const noData = reportData.csvData.length === 0;

    return (
        <div className="p-4 md:p-6 space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Weekly Reports</h2>
             {/* Week Selection */}
             <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                 <label htmlFor="weekSelector" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300"><FaCalendarWeek className="mr-2" /> Select Report Week:</label>
                 <div className="flex items-center gap-2">
                     <select id="weekSelector" value={weekOffset} onChange={(e) => { setWeekOffset(parseInt(e.target.value, 10)); setPreviewText(null); }} className="block w-full max-w-xs pl-3 pr-10 py-2 text-base border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                         <option value={1}>Last Week</option><option value={0}>This Week</option><option value={2}>2 Weeks Ago</option><option value={3}>3 Weeks Ago</option><option value={4}>4 Weeks Ago</option>
                     </select>
                     <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">({formatFn(weekStart, 'MMM d')} - {formatFn(weekEnd, 'MMM d, yyyy')})</span>
                 </div>
             </div>
            {/* Report Actions & Preview */}
             <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
                  <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Generate & Export</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Generate reports for the week of {formatFn(weekStart, 'MMM d')}. Actions are disabled if no data exists.</p>
                 {/* Action Buttons */}
                 <div className={`flex flex-wrap gap-3 ${noData ? 'opacity-50' : ''}`}>
                     <button onClick={handlePreview} disabled={noData} className="px-4 py-2 border border-gray-500 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><FaEye /> Preview</button>
                     <button onClick={generateCSV} disabled={noData} className="px-4 py-2 border border-green-600 rounded-md text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><FaFileCsv /> Export CSV</button>
                     <button onClick={downloadTextSummary} disabled={noData} className="px-4 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"><FaFileAlt /> Export Text</button>
                     <button onClick={shareReport} disabled={noData} className="px-4 py-2 border border-indigo-600 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2" title={!navigator.share ? "Web Share not supported, will copy" : "Share Summary"}><FaShareAlt /> Share</button>
                 </div>
                 {/* Preview Area */}
                 {previewText !== null && (
                     <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md relative">
                         <button onClick={() => setPreviewText(null)} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-500 rounded-full" aria-label="Close preview"><FaTimes /></button>
                         <h4 className="text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Report Preview:</h4>
                         <pre className="text-xs whitespace-pre-wrap break-words font-mono bg-transparent text-slate-800 dark:text-slate-200 overflow-x-auto">{previewText}</pre>
                     </div>
                 )}
                 {noData && previewText === null && (<p className="text-sm text-center text-slate-500 dark:text-slate-400 italic py-4">No data found for selected week.</p>)}
             </div>
        </div>
    );
};