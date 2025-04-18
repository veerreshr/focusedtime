
// --- Main App Component ---
/*
 * src/App.tsx
 * The root component that sets up the context, layout, and routing/view logic.
 */
import React, { useState } from 'react';
import { AppProvider, useAppContext } from './contexts/AppContext.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { DashboardMetrics } from './components/DashboardMetrics.tsx';
import { Timeline } from './components/Timeline.tsx';
import { AvailabilitySetup } from './components/AvailabilitySetup.tsx';
import { Settings } from './components/Settings.tsx';
import { ReportGenerator } from './components/ReportGenerator.tsx';
import { Goal } from './types/index.ts';
import { FeedbackView } from './components/FeedbackView'; // Import the new view
import { FaBars, FaChartBar } from 'react-icons/fa';
import { Logo } from './components/common/Logo.tsx';
import { ActivityHeatmap } from './components/ActivityHeatmap.tsx';
// import { useIdleTimer } from 'react-idle-timer'; // Import idle timer if needed

// Main application shell component
const AppShell: React.FC = () => {
    const [currentView, setCurrentView] = useState('dashboard'); // Default view
    const { state,activeGoal } = useAppContext(); // Get active goal to conditionally render views

    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    // --- Idle Timer Setup (Example) ---
    /*
    const handleOnIdle = event => {
        console.log('User is idle', event);
        // Potentially save data or show a notification
    }

    const handleOnActive = event => {
        console.log('User is active', event);
    }

    const { getRemainingTime, getLastActiveTime } = useIdleTimer({
        timeout: 1000 * 60 * 15, // 15 minutes
        onIdle: handleOnIdle,
        onActive: handleOnActive,
        debounce: 500
    })
    */

    const renderView = () => {
        switch (currentView) {
            case 'timeline':
                return activeGoal ? <Timeline /> : <DashboardView goals={state.goals} />; // Show dashboard if no goal selected for timeline
            case 'availability':
                return activeGoal ? <AvailabilitySetup /> : <DashboardView goals={state.goals} />; // Show dashboard if no goal selected for availability
            case 'settings':
                return <Settings />;
            case 'reports':
                return <ReportGenerator />;
            case 'feedback': 
            return <FeedbackView />;
            case 'dashboard':
            default:
                return <DashboardView goals={state.goals}/>;
        }
    };

    // Updated Dashboard View component to accept and display all goals
    const DashboardView: React.FC<{ goals: Goal[] }> = ({ goals }) => (
        <div className="p-4 md:p-6 space-y-6">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Dashboard</h2>

             <ActivityHeatmap />

             {/* Check if there are any goals */}
             {goals.length === 0 ? (
                 <div className="text-center text-slate-500 dark:text-slate-400 mt-10 p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
                     <FaChartBar className="w-12 h-12 mx-auto text-blue-400 dark:text-blue-500 mb-4" />
                     <p>Welcome to FocusedTime!</p>
                     <p className="mt-2">Create a goal using the button in the sidebar to get started.</p>
                 </div>
             ) : (
                 // Grid layout for displaying multiple goal metrics
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {goals.map(goal => (
                         // Render the DashboardMetrics component for each goal
                         <DashboardMetrics key={goal.id} goal={goal} />
                     ))}
                 </div>
             )}
             {/* You could add other dashboard elements here */}
        </div>
    );



    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 font-inter text-slate-900 dark:text-slate-100">
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={() => setIsMobileSidebarOpen(false)}
                    aria-hidden="true"
                ></div>
            )}
            <Sidebar currentView={currentView} onNavigate={setCurrentView} isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen}/>
            <main className="flex-1 overflow-y-auto" id="main-content" role="main">
                {/* Header bar for mobile hamburger button */}
                <div className="sticky top-0 z-10 md:hidden px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center">
                    <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        aria-label="Open sidebar"
                    >
                        <FaBars className="w-5 h-5" />
                    </button>
                     <div className="ml-4"><Logo /></div>
                </div>

                {/* Render the currently selected view */}
                <div className="p-4 md:p-0"> {/* Remove padding here, add it in specific views */}
                    {renderView()}
                </div>
            </main>
        </div>
    );
};

// Root component wrapping the shell with the provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
};

export default App;