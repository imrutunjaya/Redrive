import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Share2,
  Star,
  Grid,
  List,
  Download,
  ExternalLink,
  Image,
  FileVideo,
  FileAudio,
  File
} from 'lucide-react';
import { GoogleDriveFile } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface GoogleDriveGridProps {
  files: GoogleDriveFile[];
  viewMode: 'grid' | 'list';
  isLoading: boolean;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFileClick: (file: GoogleDriveFile) => void;
  onFileEdit: (file: GoogleDriveFile) => void;
  onFileDelete: (file: GoogleDriveFile) => void;
  onFileSelect: (fileId: string) => void;
  selectedFiles: string[];
}

export const GoogleDriveGrid: React.FC<GoogleDriveGridProps> = ({
  files,
  viewMode,
  isLoading,
  onViewModeChange,
  onFileClick,
  onFileEdit,
  onFileDelete,
  onFileSelect,
  selectedFiles
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: GoogleDriveFile } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getFileIcon = (file: GoogleDriveFile) => {
    if (googleDriveService.isFolder(file)) {
      return <FolderOpen className="h-8 w-8 text-blue-600" />;
    }
    
    const mimeType = file.mimeType || '';
    
    if (mimeType.startsWith('image/')) {
      return <Image className="h-8 w-8 text-green-600" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-8 w-8 text-red-600" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-8 w-8 text-purple-600" />;
    } else if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="h-8 w-8 text-blue-600" />;
    }
    
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const getFileIconSmall = (file: GoogleDriveFile) => {
    if (googleDriveService.isFolder(file)) {
      return <FolderOpen className="h-5 w-5 text-blue-600" />;
    }
    
    const mimeType = file.mimeType || '';
    
    if (mimeType.startsWith('image/')) {
      return <Image className="h-5 w-5 text-green-600" />;
    } else if (mimeType.startsWith('video/')) {
      return <FileVideo className="h-5 w-5 text-red-600" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FileAudio className="h-5 w-5 text-purple-600" />;
    } else if (mimeType.includes('document') || mimeType.includes('text')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    }
    
    return <File className="h-5 w-5 text-gray-600" />;
  };

  const getFileThumbnail = (file: GoogleDriveFile) => {
    // Use Google Drive thumbnail if available
    if (file.thumbnailLink) {
      return (
        <img 
          src={file.thumbnailLink} 
          alt={file.name}
          className="h-8 w-8 object-cover rounded"
          onError={(e) => {
            // Fallback to icon if thumbnail fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    // Use icon link if available
    if (file.iconLink) {
      return (
        <img 
          src={file.iconLink} 
          alt={file.name}
          className="h-8 w-8 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    return getFileIcon(file);
  };

  const getFileThumbnailSmall = (file: GoogleDriveFile) => {
    if (file.thumbnailLink) {
      return (
        <img 
          src={file.thumbnailLink} 
          alt={file.name}
          className="h-5 w-5 object-cover rounded"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    if (file.iconLink) {
      return (
        <img 
          src={file.iconLink} 
          alt={file.name}
          className="h-5 w-5 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    
    return getFileIconSmall(file);
  };

  const handleContextMenu = (e: React.MouseEvent, file: GoogleDriveFile) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const handleFilePreview = async (file: GoogleDriveFile) => {
    if (file.mimeType?.startsWith('image/')) {
      try {
        const content = await googleDriveService.getFileContent(file.id);
        setImagePreview(content);
      } catch (error) {
        console.error('Error loading image preview:', error);
      }
    }
  };

  const canEditFile = (file: GoogleDriveFile) => {
    const editableMimeTypes = [
      'text/plain',
      'text/markdown',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'text/csv'
    ];
    
    return editableMimeTypes.includes(file.mimeType || '') || 
           file.name.endsWith('.txt') || 
           file.name.endsWith('.md') || 
           file.name.endsWith('.json') ||
           file.name.endsWith('.csv') ||
           file.name.endsWith('.js') ||
           file.name.endsWith('.css') ||
           file.name.endsWith('.html');
  };

  React.useEffect(() => {
    const handleClick = () => handleCloseContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No files found</h3>
          <p className="text-gray-500">Create your first file or folder to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {files.length} {files.length === 1 ? 'item' : 'items'}
        </h2>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedFiles.includes(file.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-full relative ${
                  googleDriveService.isFolder(file) ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {getFileThumbnail(file)}
                  
                  {/* Preview overlay for images */}
                  {file.mimeType?.startsWith('image/') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFilePreview(file);
                      }}
                      className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <ExternalLink className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
                
                <div className="text-center min-w-0 w-full">
                  <p className="font-medium text-gray-800 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(file.modifiedTime)}
                  </p>
                  {file.size && (
                    <p className="text-xs text-gray-400">
                      {googleDriveService.formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, file);
                }}
                className="absolute top-2 right-2 p-1 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-700">
            <div className="col-span-6">Name</div>
            <div className="col-span-2">Modified</div>
            <div className="col-span-2">Size</div>
            <div className="col-span-2">Type</div>
          </div>
          
          {files.map((file) => (
            <div
              key={file.id}
              className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                selectedFiles.includes(file.id)
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onFileClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
            >
              <div className="col-span-6 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  googleDriveService.isFolder(file) ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {getFileThumbnailSmall(file)}
                </div>
                <span className="font-medium text-gray-800 truncate">{file.name}</span>
              </div>
              
              <div className="col-span-2 text-sm text-gray-500">
                {formatDate(file.modifiedTime)}
              </div>
              
              <div className="col-span-2 text-sm text-gray-500">
                {googleDriveService.formatFileSize(file.size)}
              </div>
              
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {googleDriveService.isFolder(file) ? 'Folder' : 'File'}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, file);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <MoreVertical className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {!googleDriveService.isFolder(contextMenu.file) && canEditFile(contextMenu.file) && (
            <button
              onClick={() => {
                onFileEdit(contextMenu.file);
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}
          
          {contextMenu.file.webViewLink && (
            <button
              onClick={() => {
                window.open(contextMenu.file.webViewLink, '_blank');
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in Google Drive</span>
            </button>
          )}
          
          {!googleDriveService.isFolder(contextMenu.file) && (
            <button
              onClick={() => {
                if (contextMenu.file.webViewLink) {
                  window.open(contextMenu.file.webViewLink.replace('/view', '/export?format=pdf'), '_blank');
                }
                handleCloseContextMenu();
              }}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </button>
          )}
          
          <button
            onClick={() => {
              // onFileShare(contextMenu.file);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </button>
          
          <hr className="my-2" />
          
          <button
            onClick={() => {
              onFileDelete(contextMenu.file);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="max-w-4xl max-h-4xl p-4">
            <img 
              src={imagePreview} 
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setImagePreview(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};