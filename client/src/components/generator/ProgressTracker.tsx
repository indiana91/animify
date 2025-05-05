import React from 'react';
import { Check, Loader2, Hourglass } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface Task {
  id: number;
  taskType: string;
  status: string;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress?: number;
}

interface ProgressTrackerProps {
  tasks: Task[];
  className?: string;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ tasks, className }) => {
  // Get tasks by type
  const scriptTask = tasks.find(task => task.taskType === 'script_generation');
  const codeTask = tasks.find(task => task.taskType === 'code_generation');
  const renderingTask = tasks.find(task => task.taskType === 'rendering');

  // Calculate completion times
  const getCompletionTime = (task?: Task) => {
    if (!task || !task.startedAt || !task.completedAt) return null;
    
    const start = new Date(task.startedAt).getTime();
    const end = new Date(task.completedAt).getTime();
    const seconds = Math.round((end - start) / 1000);
    
    return `${seconds}s`;
  };

  const scriptCompletionTime = getCompletionTime(scriptTask);
  const codeCompletionTime = getCompletionTime(codeTask);
  const renderingCompletionTime = getCompletionTime(renderingTask);

  return (
    <div className={className}>
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Generation Progress</h2>
      <div className="space-y-4">
        {/* Script Generation */}
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full
            ${scriptTask?.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
              scriptTask?.status === 'processing' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
              scriptTask?.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
              'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
            {scriptTask?.status === 'completed' ? <Check className="h-4 w-4" /> :
             scriptTask?.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
             scriptTask?.status === 'failed' ? <span className="text-xs">✕</span> :
             <Hourglass className="h-4 w-4" />}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Script Generation</h3>
            {scriptTask?.status === 'completed' && scriptCompletionTime && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed in {scriptCompletionTime}</p>
            )}
            {scriptTask?.status === 'processing' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Processing...</p>
            )}
            {scriptTask?.status === 'failed' && scriptTask.error && (
              <p className="text-sm text-red-500 dark:text-red-400">{scriptTask.error}</p>
            )}
            {scriptTask?.status === 'pending' && (
              <p className="text-sm text-gray-400 dark:text-gray-500">Waiting to start</p>
            )}
          </div>
        </div>

        {/* Code Generation */}
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full
            ${codeTask?.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
              codeTask?.status === 'processing' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
              codeTask?.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
              'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
            {codeTask?.status === 'completed' ? <Check className="h-4 w-4" /> :
             codeTask?.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
             codeTask?.status === 'failed' ? <span className="text-xs">✕</span> :
             <Hourglass className="h-4 w-4" />}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Code Generation</h3>
            {codeTask?.status === 'completed' && codeCompletionTime && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed in {codeCompletionTime}</p>
            )}
            {codeTask?.status === 'processing' && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Processing...</p>
            )}
            {codeTask?.status === 'failed' && codeTask.error && (
              <p className="text-sm text-red-500 dark:text-red-400">{codeTask.error}</p>
            )}
            {codeTask?.status === 'pending' && (
              <p className="text-sm text-gray-400 dark:text-gray-500">Waiting to start</p>
            )}
          </div>
        </div>

        {/* Rendering Animation */}
        <div className="flex items-center">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full
            ${renderingTask?.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
              renderingTask?.status === 'processing' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
              renderingTask?.status === 'failed' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
              'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
            {renderingTask?.status === 'completed' ? <Check className="h-4 w-4" /> :
             renderingTask?.status === 'processing' ? <Loader2 className="h-4 w-4 animate-spin" /> :
             renderingTask?.status === 'failed' ? <span className="text-xs">✕</span> :
             <Hourglass className="h-4 w-4" />}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Rendering Animation</h3>
            {renderingTask?.status === 'completed' && renderingCompletionTime && (
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed in {renderingCompletionTime}</p>
            )}
            {renderingTask?.status === 'processing' && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  In progress ({renderingTask.progress || 0}%)
                </p>
                <Progress value={renderingTask.progress} className="mt-2 h-2.5" />
              </div>
            )}
            {renderingTask?.status === 'failed' && renderingTask.error && (
              <p className="text-sm text-red-500 dark:text-red-400">{renderingTask.error}</p>
            )}
            {renderingTask?.status === 'pending' && (
              <p className="text-sm text-gray-400 dark:text-gray-500">Waiting to start</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
