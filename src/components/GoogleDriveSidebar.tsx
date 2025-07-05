import React from 'react';
import { 
  Home, 
  FolderOpen, 
  Star, 
  Clock, 
  Share2, 
  Trash2, 
  Settings,
  Plus,
  HardDrive,
  Calculator,
  BookOpen,
  Calendar,
  PenTool,
  Target,
  GraduationCap
} from 'lucide-react';
import { googleDriveService } from '../services/googleDrive';

interface GoogleDriveSidebarProps {
  currentPath: string;
  storageQuota: { used: string; total: string };
  collapsed: boolean;
  onNavigate: (path: string) => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
}

export const GoogleDriveSidebar: React.FC<GoogleDriveSidebarProps> = ({ 
  currentPath, 
  storageQuota,
  collapsed,
  onNavigate, 
  onCreateFolder, 
  onCreateFile 
}) => {
  const menuItems = [
    { icon: Home, label: 'My Drive', path: 'root', active: currentPath === 'root' },
    { icon: Star, label: 'Starred', path: 'starred', active: currentPath === 'starred' },
    { icon: Clock, label: 'Recent', path: 'recent', active: currentPath === 'recent' },
    { icon: Share2, label: 'Shared with me', path: 'shared', active: currentPath === 'shared' },
    { icon: Trash2, label: 'Trash', path: 'trash', active: currentPath === 'trash' },
  ];

  const studentTools = [
    { icon: Calculator, label: 'Calculator', path: 'tools' },
    { icon: BookOpen, label: 'Study Tools', path: 'tools' },
    { icon: Calendar, label: 'Planner', path: 'tools' },
    { icon: PenTool, label: 'Note Templates', path: 'tools' },
    { icon: Target, label: 'Goal Tracker', path: 'tools' },
    { icon: GraduationCap, label: 'GPA Calculator', path: 'tools' },
  ];

  const formatStorageSize = (bytes: string) => {
    return googleDriveService.formatFileSize(bytes);
  };

  const getStoragePercentage = () => {
    const used = parseInt(storageQuota.used);
    const total = parseInt(storageQuota.total);
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <aside className={`bg-white/50 backdrop-blur-lg border-r border-gray-200 p-4 transition-all duration-300 ${
      collapsed ? 'w-0 p-0 overflow-hidden' : 'w-64'
    }`}>
      <div className="space-y-4">
        {/* Create Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={onCreateFile}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </button>
          <button
            onClick={onCreateFolder}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 text-sm"
          >
            <FolderOpen className="h-4 w-4" />
            <span>Folder</span>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Student Tools Section */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 px-3">Student Tools</h3>
          <nav className="space-y-1">
            {studentTools.map((tool) => (
              <button
                key={tool.label}
                onClick={() => onNavigate(tool.path)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  currentPath === tool.path
                    ? 'bg-purple-50 text-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tool.icon className="h-4 w-4" />
                <span className="text-sm">{tool.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Storage Usage */}
        <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <HardDrive className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Storage</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{formatStorageSize(storageQuota.used)} used</span>
              <span>{formatStorageSize(storageQuota.total)} total</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(getStoragePercentage(), 100)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 text-center">
              {getStoragePercentage()}% used
            </p>
          </div>
        </div>

        {/* Settings */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => onNavigate('settings')}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
};