import { useState, useEffect } from 'react';
import { GoogleUser, AuthState } from '../types';
import { googleAuthService } from '../services/googleAuth';

const STORAGE_KEY = 'google_drive_auth';

export const useGoogleAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: null,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await googleAuthService.initialize();
        
        // Check for stored auth data
        const storedAuth = localStorage.getItem(STORAGE_KEY);
        if (storedAuth) {
          try {
            const { user, accessToken } = JSON.parse(storedAuth);
            googleAuthService.setAccessToken(accessToken);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              accessToken,
            });
          } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initializeAuth();
  }, []);

  const login = async (): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { user, accessToken } = await googleAuthService.signIn();
      
      const authData = { user, accessToken };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        accessToken,
      });
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    googleAuthService.signOut();
    localStorage.removeItem(STORAGE_KEY);
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      accessToken: null,
    });
  };

  return {
    ...authState,
    login,
    logout,
  };
};