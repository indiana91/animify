import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Wand2, History, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <svg className="h-8 w-8 text-primary-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 12V8H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 4V16M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 16V20H20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Animify</span>
        </div>
      </div>
      <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
        <ul className="px-2 space-y-1">
          <li>
            <Link href="/dashboard">
              <a className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive("/dashboard") 
                  ? "bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}>
                <Home className="w-5 h-5 mr-3" />
                Dashboard
              </a>
            </Link>
          </li>
          <li>
            <Link href="/generate">
              <a className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive("/generate") 
                  ? "bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}>
                <Wand2 className="w-5 h-5 mr-3" />
                Generate Animation
              </a>
            </Link>
          </li>
          <li>
            <Link href="/history">
              <a className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive("/history") 
                  ? "bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}>
                <History className="w-5 h-5 mr-3" />
                History
              </a>
            </Link>
          </li>
          <li>
            <Link href="/settings">
              <a className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-md",
                isActive("/settings") 
                  ? "bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              )}>
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </a>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.username.substring(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.username}</p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
