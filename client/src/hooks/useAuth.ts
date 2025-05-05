import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  email: string;
  generationsRemaining: number;
}

export const useAuth = () => {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  
  // Fetch user data
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery<User | null, Error>({
    queryKey: ['/api/auth/user'],
    enabled: true,
    retry: 1,
    retryDelay: 1000,
    gcTime: 0, // Don't cache
    staleTime: 0, // Always refetch
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.status === 401) {
          console.log("User not authenticated");
          return null;
        }
        
        if (!response.ok) {
          throw new Error(`Error fetching user: ${response.status}`);
        }
        
        const userData = await response.json();
        console.log("User data retrieved successfully:", userData);
        setUser(userData);
        return userData;
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUser(null);
        throw error;
      }
    }
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (userData: User) => {
      console.log("Setting user data in auth context:", userData);
      setUser(userData);
      // Refetch current user data to ensure session is valid
      setTimeout(() => {
        refetch();
      }, 500);
      return userData;
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      console.log("Logging out user");
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
        return await response.json();
      } catch (error) {
        console.error("Error during logout:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Clear user from state
      setUser(null);
      
      // Clear all queries
      queryClient.clear();
      
      // Redirect to login page
      setLocation('/login');
    },
  });
  
  // Login function
  const login = (userData: User) => {
    loginMutation.mutate(userData);
  };
  
  // Logout function
  const logout = () => {
    logoutMutation.mutate();
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  return {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    error,
    refetchUser: refetch,
  };
};
