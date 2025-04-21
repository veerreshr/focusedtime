# FocusedTime - Hourly Goal Tracker

A simple, offline-first web application designed to help you plan, track, and report progress towards your goals with granular hourly scheduling.

https://focusedtime.netlify.app

![1000018591](https://github.com/user-attachments/assets/f93c46ed-9f7d-4656-b114-1c3df0d09088)


## Core Features

* **Goal Configuration:** Define goals with titles, descriptions, start dates, and end dates.
* **Hourly Availability:** Set your available hours for each day within a goal's timeframe using a weekly template and make specific overrides per day.
* **Hourly Timeline:** Plan what you intend to do each available hour and log what you actually accomplished. See the current hour update in real-time.
* **Dashboard:** View key stats for all your goals, including total vs. available vs. logged hours, and overall progress. Track your daily work streak.
* **Weekly Reports:** Generate summaries of your logged hours and accomplishments for the previous weeks. Export reports as CSV or Text files, or share them.
* **Reminders:** Set optional browser notifications to remind you before a scheduled block starts.
* **Offline First:** All data (goals, plans, accomplishments, settings) is stored locally in your browser's `localStorage`. No cloud or server interaction is required for core functionality.
* **Data Management:** Export all your application data to a JSON file for backup and import it back later.
* **Feedback:** Indicate interest in potential future features and find contact information.

## Tech Stack

* **Frontend:** React 18+ with TypeScript
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **State Management:** React Context API with useReducer
* **Date/Time:** `date-fns`
* **Libraries:** `react-datepicker`, `formik`, `papaparse` (for CSV export), `react-icons`, `framer-motion` (for animations)

## Setup & Running

1.  **Prerequisites:** Node.js (v18+) and npm (or yarn).
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    This will usually open the app in your browser at `http://localhost:3000`.
4.  **Build for Production:**
    ```bash
    npm run build
    ```
    This creates an optimized build in the `build` directory.

## Important Notes

* **Offline Data:** All your data is stored only in your browser. Clearing your browser's site data for this app will erase your goals and progress. Use the Export/Import feature in Settings for backups.
* **Feedback:** The "Feature Interest" buttons in the Feedback section use `mailto:` links, which will open your default email client to send feedback manually.
* **PWA:** Progressive Web App features (like full offline asset caching) can be enabled by installing `vite-plugin-pwa` and configuring it in `vite.config.ts`.
