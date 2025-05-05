import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import MainLayout from '@/components/layout/MainLayout';
import PromptForm from '@/components/generator/PromptForm';
import ProgressTracker from '@/components/generator/ProgressTracker';
import VideoPlayer from '@/components/generator/VideoPlayer';
import ScriptViewer from '@/components/generator/ScriptViewer';
import { useAnimations } from '@/hooks/useAnimations';
import { Loader2 } from 'lucide-react';

const Generate: React.FC = () => {
  const [match, params] = useRoute('/generate/:id?');
  const [isEditing, setIsEditing] = useState(false);
  const animationId = params?.id ? parseInt(params.id) : undefined;
  
  const { getAnimation, regenerateAnimation } = useAnimations();
  const { data: animation, isLoading, error } = animationId ? getAnimation(animationId) : { data: undefined, isLoading: false, error: null };
  
  useEffect(() => {
    if (match && params?.id && window.location.pathname.includes('/edit')) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [match, params]);
  
  const handleEditContent = (type: 'script' | 'code', content: string) => {
    // In a real implementation, we would send this updated content to the backend
    console.log(`Updating ${type} for animation ${animationId}:`, content);
  };
  
  const handleRegenerationSuccess = () => {
    setIsEditing(false);
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {isEditing 
                ? 'Edit Animation' 
                : animationId 
                  ? `Animation: ${animation?.title || 'Loading...'}`
                  : 'Generate Animation'
              }
            </h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Show form if creating new or editing */}
            {(!animationId || isEditing) && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {isEditing ? 'Update Animation Description' : 'Animation Description'}
                </h2>
                
                <PromptForm 
                  defaultValues={animation ? {
                    prompt: animation.prompt,
                    title: animation.title,
                    aiModel: animation.aiModel,
                    duration: animation.duration,
                  } : undefined}
                  isEdit={isEditing}
                  animationId={animationId}
                  onSuccess={handleRegenerationSuccess}
                />
              </div>
            )}
            
            {/* Show progress tracker and results only if we have an animation */}
            {animation && (
              <>
                {/* Generation Progress */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                  <ProgressTracker tasks={animation.tasks || []} />
                </div>

                {/* Result Preview Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <VideoPlayer 
                      videoUrl={animation.videoUrl} 
                      isProcessing={animation.status === 'processing'} 
                      title={animation.title} 
                    />
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                    <ScriptViewer 
                      script={animation.script} 
                      manimCode={animation.manimCode} 
                      isEditable={false}
                      onEdit={handleEditContent}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Generate;
