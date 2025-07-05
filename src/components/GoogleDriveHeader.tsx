import React from 'react';
import { Search, User, LogOut, Bell, ArrowLeft, Menu, X } from 'lucide-react';
import { GoogleUser, FolderPath } from '../types';

interface GoogleDriveHeaderProps {
  user: GoogleUser;
  searchQuery: string;
  currentPath: FolderPath[];
  sidebarCollapsed: boolean;
  onSearchChange: (query: string) => void;
  onNavigateToPath: (index: number) => void;
  onToggleSidebar: () => void;
  onLogout: () => void;
}

export const GoogleDriveHeader: React.FC<GoogleDriveHeaderProps> = ({ 
  user, 
  searchQuery, 
  currentPath,
  sidebarCollapsed,
  onSearchChange, 
  onNavigateToPath,
  onToggleSidebar,
  onLogout 
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
            </button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Student Drive
            </h1>
            
            {/* Breadcrumb Navigation */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              {currentPath.map((folder, index) => (
                <React.Fragment key={folder.id}>
                  {index > 0 && <span className="text-gray-400">/</span>}
                  <button
                    onClick={() => onNavigateToPath(index)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {folder.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Search your Google Drive..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <div className="relative group">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-10 h-10 rounded-full ring-2 ring-gray-200 hover:ring-blue-500 transition-all cursor-pointer"
                />
                <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-medium text-gray-700">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};