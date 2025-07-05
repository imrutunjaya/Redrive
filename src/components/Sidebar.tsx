import React from 'react';
import { 
  Home, 
  FolderOpen, 
  Star, 
  Clock, 
  Share2, 
  Trash2, 
  Settings,
  Plus
} from 'lucide-react';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentPath, 
  onNavigate, 
  onCreateFolder, 
  onCreateFile 
}) => {
  const menuItems = [
    { icon: Home, label: 'Home', path: '/', active: currentPath === '/' },
    { icon: FolderOpen, label: 'My Files', path: '/files', active: currentPath === '/files' },
    { icon: Star, label: 'Starred', path: '/starred', active: currentPath === '/starred' },
    { icon: Clock, label: 'Recent', path: '/recent', active: currentPath === '/recent' },
    { icon: Share2, label: 'Shared', path: '/shared', active: currentPath === '/shared' },
    { icon: Trash2, label: 'Trash', path: '/trash', active: currentPath === '/trash' },
  ];

  return (
    <aside className="w-64 bg-white/50 backdrop-blur-lg border-r border-gray-200 p-4">
      <div className="space-y-4">
        <div className="flex space-x-2">
          <button
            onClick={onCreateFile}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Note</span>
          </button>
          <button
            onClick={onCreateFolder}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 text-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Folder</span>
          </button>
        </div>

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

        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => onNavigate('/settings')}
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