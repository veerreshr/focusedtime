/*
 * src/components/FeaturePoll.tsx NEW COMPONENT
 * Allows users to indicate interest in potential features via mailto links.
 */
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FaEnvelope, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

// Define the structure for potential features
interface PotentialFeature {
    id: string; // Unique identifier for the feature
    name: string;
    description: string;
}

const potentialFeatures: PotentialFeature[] = [
    { id: 'cloud_sync', name: 'Cloud Sync', description: 'Sync data across multiple devices.' },
    { id: 'adv_reporting', name: 'Advanced Reporting', description: 'More detailed charts and filtering options.' },
    { id: 'custom_themes', name: 'Custom Themes', description: 'Personalize the app appearance.' },
    { id: 'pomodoro', name: 'Pomodoro Timer', description: 'Integrate a Pomodoro timer for focus sessions.' },
    { id: 'mobile_app', name: 'Mobile App', description: 'Native iOS/Android application.' },
];

const FEEDBACK_EMAIL = 'code.veeresh@gmail.com';

export const FeaturePoll: React.FC = () => {

    // Function to generate the mailto link
    const generateMailtoLink = (feature: PotentialFeature): string => {
        const subject = `Feature Interest: ${feature.name}`;
        const body = `Hi,\n\nI'm interested in the "${feature.name}" feature (${feature.description}) for the FocusedTime app.\n\nThanks!`;
        // Encode components for URL safety
        return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <section aria-labelledby="feature-poll-heading" className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
            <h3 id="feature-poll-heading" className="text-lg font-medium text-slate-700 dark:text-slate-300">Future Features Interest</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Interested in any of these potential future features? Click the button to open a pre-filled email draft in your default mail client to let us know!
            </p>
            <ul className="space-y-3">
                {potentialFeatures.map((feature) => (
                    <li key={feature.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md flex items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{feature.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{feature.description}</p>
                        </div>
                        <a
                            href={generateMailtoLink(feature)}
                            target="_blank" // Open in new tab/window if it's a webmail client
                            rel="noopener noreferrer" // Security best practice
                            className="flex-shrink-0 px-3 py-1.5 border border-blue-500 rounded-md text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 inline-flex items-center gap-1.5"
                            title={`Indicate interest in ${feature.name} via email`}
                        >
                            <FaEnvelope />
                            I'm Interested
                        </a>
                    </li>
                ))}
            </ul>
             <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                Note: Clicking a button will open your email app. You still need to press 'Send'.
             </p>
        </section>
    );
};