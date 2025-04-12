/*
 * src/components/ContactInfo.tsx NEW COMPONENT
 * Displays static contact information.
 */
import React from 'react';
import { FaGithub, FaEnvelope } from 'react-icons/fa';

// Customize these details
const CONTACT_EMAIL = 'code.veeresh@gmail.com'; // <<< --- REPLACE THIS
const GITHUB_REPO_URL = 'https://github.com/veerreshr/focusedtime'; // <<< --- REPLACE THIS (optional)

export const ContactInfo: React.FC = () => {
    return (
        <section aria-labelledby="contact-info-heading" className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
            <h3 id="contact-info-heading" className="text-lg font-medium text-slate-700 dark:text-slate-300">Contact & Support</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
                Have other feedback, questions, or bug reports?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Email Link */}
                <a
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('FocusedTime App Feedback/Question')}`}
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                    <FaEnvelope /> Send an Email
                </a>

                {/* GitHub Link (Optional) */}
                {GITHUB_REPO_URL && (
                     <a
                        href={GITHUB_REPO_URL + '/issues'} // Link directly to issues page
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                    >
                        <FaGithub /> Report an Issue on GitHub
                    </a>
                )}
            </div>
        </section>
    );
};