import React from 'react';
import { Film, Clock, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAnimations } from '@/hooks/useAnimations';

interface UsageStatsProps {
  className?: string;
}

const UsageStats: React.FC<UsageStatsProps> = ({ className }) => {
  const { user } = useAuth();
  const { stats } = useAnimations();
  
  const generatedCount = 10 - (user?.generationsRemaining || 0);
  const remainingCount = user?.generationsRemaining || 0;
  const percentageUsed = (generatedCount / 10) * 100;
  
  return (
    <div className={`mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {/* Animations Generated */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                <Film className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Animations Generated
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {generatedCount}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <span className="font-medium text-primary-600 dark:text-primary-400">
                {remainingCount} generations remaining
              </span>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${percentageUsed}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Average Render Time */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Average Render Time
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.averageRenderTime || '30s'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <a href="/history" className="font-medium text-green-500 hover:text-green-600 dark:hover:text-green-400">
                View rendering statistics
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferred AI Model */}
      <Card>
        <CardContent className="p-0">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Preferred AI Model
                  </dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.preferredModel || 'OpenAI GPT-4'}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <a href="/settings" className="font-medium text-purple-500 hover:text-purple-600 dark:hover:text-purple-400">
                Change AI model
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageStats;
