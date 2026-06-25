import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Last updated: June 20, 2026
          </p>
        </div>
        
        <div className="space-y-6 text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">1. Information We Collect</h2>
            <p>
              At SmartPark, we take your privacy seriously. To provide our parking slots booking service, we may collect 
              personal information such as your name, email address, vehicle registration details, and payment processing information.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">2. How We Use Your Information</h2>
            <p>The data we collect is utilized strictly to enhance your experience:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To reserve and manage your parking allocations.</li>
              <li>To send booking confirmations and real-time updates.</li>
              <li>To ensure secure processing of transactions.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">3. Data Security</h2>
            <p>
              We implement industry-standard security measures to safeguard your sensitive information against unauthorized access, 
              alteration, or disclosure.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;