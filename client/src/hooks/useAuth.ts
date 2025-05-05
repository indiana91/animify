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
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    enabled: true,
    retry: false,
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      setUser(null);
    },
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (userData: User) => {
      setUser(userData);
      return userData;
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout');
      return response.json();
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
  };
};
