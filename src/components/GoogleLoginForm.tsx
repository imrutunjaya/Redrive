import React, { useState } from 'react';
import { LogIn, BookOpen, Shield, Cloud, Zap } from 'lucide-react';

interface GoogleLoginFormProps {
  onLogin: () => Promise<boolean>;
  isLoading: boolean;
}

export const GoogleLoginForm: React.FC<GoogleLoginFormProps> = ({ onLogin, isLoading }) => {
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const success = await onLogin();
    if (!success) {
      setError('Failed to sign in with Google. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Drive</h1>
            <p className="text-gray-600">Connect to your Google Drive for seamless file management</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Cloud className="h-5 w-5 text-blue-500" />
              <span>Access your real Google Drive files</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Secure authentication with Google</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Zap className="h-5 w-5 text-purple-500" />
              <span>Beautiful interface for student productivity</span>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-300 transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-sm hover:shadow-md"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to connect your Google Drive account. 
              Your files remain secure and private.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};