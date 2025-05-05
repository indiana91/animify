import React from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Wand2, Shield, Code, FileVideo, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Home: React.FC = () => {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    } else {
      setLocation('/signup');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-blue-500">
              Create Beautiful Math Animations
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-500 dark:text-gray-400 sm:text-xl md:mt-5 md:max-w-3xl">
              Generate stunning animations powered by AI and Manim. Turn your ideas into captivating mathematical visualizations with just a text prompt.
            </p>
            <div className="mt-10 flex justify-center">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="rounded-md px-8 py-3 flex items-center"
              >
                Get Started 
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="ml-4 rounded-md px-8 py-3"
                onClick={() => setLocation('/login')}
              >
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Powerful Animation Features
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
              Everything you need to create professional-quality animations
            </p>
          </div>

          <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-500 rounded-md p-3">
                    <Wand2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">AI-Powered Generation</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Use natural language to describe your animation and our AI will transform it into Manim code automatically.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Multiple AI Models</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Choose between OpenAI, Google Gemini, or Groq for different animation styles and capabilities.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <Code className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Manim Integration</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Leverages the powerful Manim library created for mathematical animations with professional quality.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FileVideo className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">High-Quality Renders</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Get beautifully rendered animations in high definition, ready to use in presentations or videos.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">User Authentication</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Secure user accounts with authentication to save and organize your generated animations.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-gray-700 overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 12V8H4V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 4V16M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 16V20H20V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className="ml-4 text-lg font-medium text-gray-900 dark:text-white">Easy Downloading</h3>
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">
                  Download your animations in MP4 format for easy sharing and integration into your projects.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-primary-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start creating?</span>
            <span className="block text-primary-200">Try Animify today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                Get Started
              </Button>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-primary-500 border-transparent text-white hover:bg-primary-700"
                onClick={() => setLocation('/login')}
              >
                {isAuthenticated ? 'Dashboard' : 'Login'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} Animify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
