import React from 'react';
import { Link } from 'wouter';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Animation } from '@shared/schema';
import { useAnimations } from '@/hooks/useAnimations';

interface RecentAnimationsProps {
  limit?: number;
  className?: string;
}

const RecentAnimations: React.FC<RecentAnimationsProps> = ({ limit = 3, className }) => {
  const { animations, isLoading } = useAnimations();
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const recentAnimations = animations?.slice(0, limit) || [];
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Recent Animations</h2>
        <Link href="/history">
          <a className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
            View all
          </a>
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg animate-pulse">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700"></div>
              <div className="px-4 py-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : recentAnimations.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentAnimations.map((animation) => (
            <div key={animation.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  {animation.videoUrl ? (
                    <img 
                      src={animation.videoUrl} 
                      alt={animation.title} 
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {animation.status === 'processing' ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                      ) : (
                        <div className="text-gray-400 dark:text-gray-500">No preview</div>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                    <div className="text-white text-sm font-medium">{animation.title}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="absolute top-3 right-3 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Link href={`/generate/${animation.id}`}>
                        <a className="w-full">View Details</a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={`/generate/${animation.id}/edit`}>
                        <a className="w-full">Regenerate</a>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs font-medium rounded-md ${getStatusBadgeClass(animation.status)}`}>
                    {animation.status.charAt(0).toUpperCase() + animation.status.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(animation.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't created any animations yet. 
            <Link href="/generate">
              <a className="text-primary-600 dark:text-primary-400 ml-1">
                Create your first animation
              </a>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentAnimations;
