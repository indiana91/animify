import React, { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Bot, RefreshCw, ArrowLeft, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ProgressTracker from '@/components/generator/ProgressTracker';
import VideoPlayer from '@/components/generator/VideoPlayer';
import ScriptViewer from '@/components/generator/ScriptViewer';
import { useAnimations } from '@/hooks/useAnimations';
import { useToast } from '@/hooks/use-toast';

const AnimationDetail: React.FC = () => {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/animation/:id');
  const { toast } = useToast();
  
  const animationId = params?.id ? parseInt(params.id) : undefined;
  const { getAnimation, regenerateAnimation } = useAnimations();
  const { data: animation, isLoading, error } = animationId ? getAnimation(animationId) : { data: undefined, isLoading: false, error: null };

  useEffect(() => {
    if (!match || !animationId) {
      setLocation('/history');
    }
  }, [match, animationId, setLocation]);

  if (!animation || isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="py-6">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300">Error loading animation</h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                {error instanceof Error ? error.message : "An unknown error occurred"}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setLocation('/history')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to History
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegenerateClick = async () => {
    try {
      setLocation(`/generate/${animation.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start regeneration",
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="py-6">
        <div className="max-w-full mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {animation.title}
              </h1>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {animation.duration} seconds
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  Created on {formatDate(animation.createdAt)}
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Bot className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  {animation.aiModel === 'openai' ? 'OpenAI GPT-4' : 
                   animation.aiModel === 'gemini' ? 'Google Gemini' : 
                   animation.aiModel === 'groq' ? 'Groq' : animation.aiModel}
                </div>
              </div>
            </div>
            <div className="mt-5 flex lg:mt-0 lg:ml-4">
              <Button variant="outline" onClick={() => setLocation('/history')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to History
              </Button>
              <Button
                className="ml-3"
                onClick={handleRegenerateClick}
                disabled={animation.status === 'processing'}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Prompt</h2>
            <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <p className="text-gray-600 dark:text-gray-300">{animation.prompt}</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Animation Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer
                  videoUrl={animation.videoUrl}
                  isProcessing={animation.status === 'processing'}
                  title={animation.title}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generation Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker tasks={animation.tasks || []} />
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Code & Script</CardTitle>
              </CardHeader>
              <CardContent>
                <ScriptViewer
                  script={animation.script}
                  manimCode={animation.manimCode}
                  isEditable={false}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnimationDetail;
