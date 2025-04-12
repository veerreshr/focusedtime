/*
 * src/components/Sidebar.tsx
 * Navigation sidebar listing goals and providing access to actions.
 */
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { FaPlus, FaTrash, FaEdit, FaCalendarAlt, FaClock, FaCog, FaChartBar, FaList, FaAngleDown, FaAngleRight, FaComments, FaTimes } from 'react-icons/fa'; // Added angle icons
import { Logo } from './common/Logo';
import { GoalForm } from './GoalForm'; // Import GoalForm for the modal
import { AnimatePresence, motion } from 'framer-motion'; // Import motion
import { Goal } from '../types';
import { StreakCounter } from './StreakCounter';

interface SidebarProps {
    currentView: string;
    onNavigate: (view: string) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileOpen, setIsMobileOpen }) => {
    // Correctly destructure state and dispatch from the context
    const { state, dispatch } = useAppContext();
    // Access activeGoalId from the state object
    const { goals, activeGoalId } = state;

    const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
    const [goalToEdit, setGoalToEdit] = useState<Goal | null>(null);
    // State to track which goal's sub-menu is open (optional, could also derive from activeGoalId)
    // const [openGoalId, setOpenGoalId] = useState<string | null>(activeGoalId);

    const handleAddNewGoal = () => {
        setGoalToEdit(null); // Ensure we are creating a new goal
        setIsGoalFormOpen(true);
        setIsMobileOpen(false);
    };

    const handleEditGoal = (goal: Goal, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent goal selection when clicking edit
        setGoalToEdit(goal);
        setIsGoalFormOpen(true);
        setIsMobileOpen(false);
    };

    const handleDeleteGoal = (id: string, title: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent goal selection when clicking delete
        if (window.confirm(`Are you sure you want to delete the goal "${title}"? This action cannot be undone.`)) {
            dispatch({ type: 'DELETE_GOAL', payload: { id } });
            // If the deleted goal was the active one, navigate away from goal-specific views
            if (id === activeGoalId && (currentView === 'timeline' || currentView === 'availability')) {
                onNavigate('dashboard'); // Go back to dashboard or another default view
            }
            setIsMobileOpen(false);
        }
    };

    const handleSelectGoal = (id: string) => {
        const isAlreadyActive = id === activeGoalId;
        dispatch({ type: 'SET_ACTIVE_GOAL', payload: { id } });

        // Navigate to timeline only if selecting a *different* goal or if not already on a goal view
        if (!isAlreadyActive || (currentView !== 'timeline' && currentView !== 'availability')) {
            onNavigate('timeline'); // Navigate to timeline when a goal is selected/changed
        }
        setIsMobileOpen(false);
    };

    // Handle navigation for main sections (Dashboard, Reports, Settings)
    const handleNavigate = (view: string) => {
        // No need to deselect goal when navigating main sections
        onNavigate(view);
        setIsMobileOpen(false);
    }

    // Variants for goal sub-menu animation
    const subMenuVariants = {
        hidden: { opacity: 0, height: 0 },
        visible: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
        exit: { opacity: 0, height: 0, transition: { duration: 0.15 } }
    };


    return (
      <>
        {/* Sidebar container - Handles desktop visibility and mobile positioning/transition */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 dark:bg-slate-900 p-4 flex flex-col border-r border-slate-200 dark:border-slate-700 h-screen overflow-y-auto
                           transition-transform duration-300 ease-in-out transform md:translate-x-0 md:static md:inset-y-auto md:z-auto md:w-64 md:flex-shrink-0
                           ${
                             isMobileOpen
                               ? "translate-x-0 shadow-xl"
                               : "-translate-x-full"
                           }`} // Toggle transform for mobile slide-in/out
          aria-label="Sidebar"
        >
          {/* Close button for mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-2 right-2 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 md:hidden" // Only show on mobile when open
            aria-label="Close sidebar"
          >
            <FaTimes className="w-5 h-5" />
          </button>
          <div className="mb-6 px-2 pt-4 md:pt-0">
            <Logo />
          </div>
          <nav className="mb-6 flex-grow">
            <ul className="space-y-1">
              
              {/* Static Nav */}
              <li>
                <button
                  onClick={() => handleNavigate("dashboard")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "dashboard"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  aria-current={
                    currentView === "dashboard" ? "page" : undefined
                  }
                >
                  <FaChartBar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate("reports")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "reports"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  aria-current={currentView === "reports" ? "page" : undefined}
                >
                  <FaList className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Reports</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate("settings")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "settings"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  aria-current={currentView === "settings" ? "page" : undefined}
                >
                  <FaCog className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Settings</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigate("feedback")}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "feedback"
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                  }`}
                  aria-current={currentView === "feedback" ? "page" : undefined}
                >
                  <FaComments className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">Feedback</span>
                </button>
              </li>
              {/* Goals Header */}
              <li className="pt-4 pb-2 px-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Goals
              </li>
              {/* Goal List */}
              {goals.length === 0 && (
                <li className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 italic">
                  No goals created yet.
                </li>
              )}
              {goals.map((goal) => {
                const isActive = activeGoalId === goal.id;
                const isGoalViewActive =
                  isActive &&
                  (currentView === "timeline" ||
                    currentView === "availability");
                return (
                  <li key={goal.id}>
                    
                    <button
                      onClick={() => handleSelectGoal(goal.id)}
                      className={`w-full flex justify-between items-center group px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                      }`}
                      aria-current={isGoalViewActive ? "page" : undefined}
                      aria-expanded={isActive}
                    >
                      
                      <span className="flex items-center truncate mr-2">
                        {isActive ? (
                          <FaAngleDown className="w-3 h-3 mr-1.5 flex-shrink-0" />
                        ) : (
                          <FaAngleRight className="w-3 h-3 mr-1.5 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                        )}
                        <span className="truncate">{goal.title}</span>
                      </span>
                      <span
                        className={`flex-shrink-0 flex items-center space-x-1 ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
                        }`}
                      >
                        
                        <button
                          onClick={(e) => handleEditGoal(goal, e)}
                          title={`Edit goal: ${goal.title}`}
                          aria-label={`Edit goal: ${goal.title}`}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <FaEdit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteGoal(goal.id, goal.title, e)
                          }
                          title={`Delete goal: ${goal.title}`}
                          aria-label={`Delete goal: ${goal.title}`}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </span>
                    </button>
                    <AnimatePresence>
                      {isActive && (
                        <motion.ul
                          variants={subMenuVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="pl-6 mt-1 space-y-1 overflow-hidden"
                        >
                          
                          <li>
                            <button
                              onClick={() => handleNavigate("timeline")}
                              className={`w-full flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                currentView === "timeline"
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold"
                                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                              }`}
                              aria-current={
                                currentView === "timeline" ? "page" : undefined
                              }
                            >
                              <FaClock className="w-3 h-3 flex-shrink-0" />
                              <span>Timeline</span>
                            </button>
                          </li>
                          <li>
                            <button
                              onClick={() => handleNavigate("availability")}
                              className={`w-full flex items-center space-x-2 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                currentView === "availability"
                                  ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 font-semibold"
                                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                              }`}
                              aria-current={
                                currentView === "availability"
                                  ? "page"
                                  : undefined
                              }
                            >
                              <FaCalendarAlt className="w-3 h-3 flex-shrink-0" />
                              <span>Availability</span>
                            </button>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
              {/* Add New Goal Button */}
              <li>
                <button
                  onClick={handleAddNewGoal}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 mt-4 rounded-md text-sm font-medium border-2 border-dashed border-blue-400 dark:border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-600 dark:hover:border-blue-400 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <FaPlus className="w-4 h-4" />
                  <span>Add New Goal</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="mt-auto mb-4 px-1">
            <StreakCounter />
          </div>
        </aside>

        {/* Goal Form Modal (no changes needed for responsiveness here, handled by fixed/bg-opacity) */}
        <AnimatePresence>
          {isGoalFormOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="goal-form-heading"
            >
              
              <motion.div
                initial={{ scale: 0.95, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                
                <GoalForm
                  goalToEdit={goalToEdit}
                  onClose={() => setIsGoalFormOpen(false)}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
};
