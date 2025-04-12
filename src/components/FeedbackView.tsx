/*
 * src/components/FeedbackView.tsx NEW COMPONENT
 * Combines FeaturePoll and ContactInfo.
 */
import React from 'react';
import { FeaturePoll } from './FeaturePoll';
import { ContactInfo } from './ContactInfo.tsx';

export const FeedbackView: React.FC = () => {
    return (
        <div className="p-4 md:p-6 space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Feedback & Contact</h2>

            {/* Feature Poll Section */}
            <FeaturePoll />

            {/* Contact Info Section */}
            <ContactInfo />

            {/* Optional: Add Feedback Input Form here if needed later */}

        </div>
    );
};