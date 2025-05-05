import React from 'react';
import { Link } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import UsageStats from '@/components/dashboard/UsageStats';
import RecentAnimations from '@/components/dashboard/RecentAnimations';
import PromptForm from '@/components/generator/PromptForm';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        </div>
        
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          {/* Usage Stats Cards */}
          <UsageStats />
          
          {/* Recent Animations Grid */}
          <RecentAnimations className="mt-8" limit={3} />
          
          {/* Generate New Animation Card */}
          <Card className="mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Generate New Animation</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-400">
                <p>Describe the animation you want to create. Be specific about objects, movements, colors, and timing.</p>
              </div>
              
              <div className="mt-5">
                <PromptForm />
              </div>
            </CardContent>
          </Card>
          
          {/* Upgrade Section - Show only if user has less than 3 generations left */}
          {user && user.generationsRemaining < 3 && (
            <div className="mt-8 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-primary-800 dark:text-primary-300">
                    Running low on generations
                  </h3>
                  <div className="mt-2 text-sm text-primary-700 dark:text-primary-400">
                    <p>
                      You have {user.generationsRemaining} generation{user.generationsRemaining !== 1 ? 's' : ''} remaining. 
                      Soon we'll offer premium subscription plans with unlimited generations.
                    </p>
                  </div>
                  <div className="mt-4">
                    <div className="-mx-2 -my-1.5 flex">
                      <Link href="/settings">
                        <a className="px-2 py-1.5 rounded-md text-sm font-medium text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                          Learn more
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
