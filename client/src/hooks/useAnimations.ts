import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Animation } from '@shared/schema';
import { Task } from '@/components/generator/ProgressTracker';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AnimationWithTasks extends Animation {
  tasks: Task[];
}

interface AnimationStats {
  averageRenderTime: string;
  preferredModel: string;
}

export const useAnimations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [stats, setStats] = useState<AnimationStats>({
    averageRenderTime: '30s',
    preferredModel: 'OpenAI GPT-4',
  });
  
  // Setup WebSocket for real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'animation_update' || data.type === 'task_update') {
          // Invalidate the specific animation query
          queryClient.invalidateQueries({ 
            queryKey: [`/api/animations/${data.animationId}`] 
          });
          
          // Also invalidate the animations list
          queryClient.invalidateQueries({ 
            queryKey: ['/api/animations'] 
          });
          
          // Show toast notification for important updates
          if (data.status === 'completed' && data.type === 'animation_update') {
            toast({
              title: 'Animation Completed!',
              description: 'Your animation has been generated successfully.',
            });
          } else if (data.status === 'failed' && data.error) {
            toast({
              title: 'Animation Failed',
              description: data.error,
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    // Clean up WebSocket on component unmount
    return () => {
      ws.close();
    };
  }, [queryClient, toast]);
  
  // Fetch all animations
  const { 
    data: animations, 
    isLoading: isLoadingAnimations,
    error: animationsError,
  } = useQuery({
    queryKey: ['/api/animations'],
    enabled: true,
  });
  
  // Calculate stats based on animations
  useEffect(() => {
    if (animations && animations.length > 0) {
      // Calculate average render time (this is a simplified version)
      const completedAnimations = animations.filter(a => a.status === 'completed');
      
      if (completedAnimations.length > 0) {
        // In a real app, this would calculate based on task completion times
        const avgTime = Math.round(30 - (completedAnimations.length * 2));
        setStats(prev => ({
          ...prev,
          averageRenderTime: `${Math.max(avgTime, 10)}s`,
        }));
      }
      
      // Determine preferred model
      const modelCounts: Record<string, number> = {};
      animations.forEach(animation => {
        modelCounts[animation.aiModel] = (modelCounts[animation.aiModel] || 0) + 1;
      });
      
      let preferredModel = 'OpenAI GPT-4';
      let maxCount = 0;
      
      Object.entries(modelCounts).forEach(([model, count]) => {
        if (count > maxCount) {
          maxCount = count;
          
          // Map model ID to display name
          const modelDisplayNames: Record<string, string> = {
            'openai': 'OpenAI GPT-4',
            'gemini': 'Google Gemini',
            'groq': 'Groq',
          };
          
          preferredModel = modelDisplayNames[model] || model;
        }
      });
      
      setStats(prev => ({
        ...prev,
        preferredModel,
      }));
    }
  }, [animations]);
  
  // Fetch specific animation by ID
  const getAnimation = (id: number) => {
    return useQuery({
      queryKey: [`/api/animations/${id}`],
      enabled: !!id,
    });
  };
  
  // Create animation mutation
  const createAnimation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/animations', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/animations'] });
    },
  });
  
  // Regenerate animation mutation
  const regenerateAnimation = useMutation({
    mutationFn: async ({ id, prompt }: { id: number, prompt?: string }) => {
      const response = await apiRequest('POST', `/api/animations/${id}/regenerate`, { prompt });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/animations/${variables.id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/animations'] });
    },
  });
  
  return {
    animations,
    stats,
    isLoadingAnimations,
    animationsError,
    getAnimation,
    createAnimation,
    regenerateAnimation,
  };
};
