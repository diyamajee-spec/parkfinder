import React from 'react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Terms of Condition
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: June 20, 2026
          </p>
        </div>
        
        <div className="space-y-6 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the SmartPark application, you agree to be bound by these Terms of Condition and all 
              applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">2. User Responsibilities</h2>
            <p>
              Users are required to provide accurate information when booking parking slots and must abide by the specific rules 
              and timings outlined by individual parking facility providers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;