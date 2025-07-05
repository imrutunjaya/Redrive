import React, { useState, useEffect } from 'react';
import { FileText, FolderOpen, Clock, TrendingUp, Star } from 'lucide-react';
import { GoogleDriveFile } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface GoogleDriveDashboardProps {
  files: GoogleDriveFile[];
  storageQuota: { used: string; total: string };
  onFileClick: (file: GoogleDriveFile) => void;
  getRecentFiles: () => Promise<GoogleDriveFile[]>;
}

export const GoogleDriveDashboard: React.FC<GoogleDriveDashboardProps> = ({ 
  files,
  storageQuota,
  onFileClick,
  getRecentFiles
}) => {
  const [recentFiles, setRecentFiles] = useState<GoogleDriveFile[]>([]);

  useEffect(() => {
    loadRecentFiles();
  }, []);

  const loadRecentFiles = async () => {
    try {
      const recent = await getRecentFiles();
      setRecentFiles(recent);
    } catch (error) {
      console.error('Error loading recent files:', error);
    }
  };

  const totalFiles = files.filter(file => !googleDriveService.isFolder(file)).length;
  const totalFolders = files.filter(file => googleDriveService.isFolder(file)).length;

  const stats = [
    { 
      icon: FileText, 
      label: 'Total Files', 
      value: totalFiles, 
      color: 'text-blue-600', 
      bg: 'bg-blue-100' 
    },
    { 
      icon: FolderOpen, 
      label: 'Total Folders', 
      value: totalFolders, 
      color: 'text-green-600', 
      bg: 'bg-green-100' 
    },
    { 
      icon: Clock, 
      label: 'Recent Items', 
      value: recentFiles.length, 
      color: 'text-purple-600', 
      bg: 'bg-purple-100' 
    },
    { 
      icon: TrendingUp, 
      label: 'Storage Used', 
      value: googleDriveService.formatFileSize(storageQuota.used), 
      color: 'text-orange-600', 
      bg: 'bg-orange-100' 
    },
  ];

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome back! Here's your Google Drive overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white/70 backdrop-blur-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Files</h3>
          <Clock className="h-5 w-5 text-gray-500" />
        </div>
        
        {recentFiles.length > 0 ? (
          <div className="space-y-3">
            {recentFiles.map((file) => (
              <div
                key={file.id}
                onClick={() => onFileClick(file)}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    {file.thumbnailLink ? (
                      <img 
                        src={file.thumbnailLink} 
                        alt={file.name}
                        className="h-5 w-5 object-cover rounded"
                      />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {googleDriveService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{formatDate(file.modifiedTime)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recent files yet. Start creating to see them here!</p>
          </div>
        )}
      </div>
    </div>
  );
};