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
  List
} from 'lucide-react';
import { DriveItem } from '../types';

interface FileGridProps {
  items: DriveItem[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onItemClick: (item: DriveItem) => void;
  onItemEdit: (item: DriveItem) => void;
  onItemDelete: (item: DriveItem) => void;
  onItemSelect: (itemId: string) => void;
  selectedItems: string[];
}

export const FileGrid: React.FC<FileGridProps> = ({
  items,
  viewMode,
  onViewModeChange,
  onItemClick,
  onItemEdit,
  onItemDelete,
  onItemSelect,
  selectedItems
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: DriveItem } | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleContextMenu = (e: React.MouseEvent, item: DriveItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  React.useEffect(() => {
    const handleClick = () => handleCloseContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FolderOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500">Create your first folder or note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {items.length} {items.length === 1 ? 'item' : 'items'}
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
          {items.map((item) => (
            <div
              key={item.id}
              className={`group relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
                selectedItems.includes(item.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className={`p-3 rounded-full ${
                  item.type === 'folder' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {item.type === 'folder' ? (
                    <FolderOpen className="h-8 w-8 text-blue-600" />
                  ) : (
                    <FileText className="h-8 w-8 text-green-600" />
                  )}
                </div>
                
                <div className="text-center min-w-0 w-full">
                  <p className="font-medium text-gray-800 truncate" title={item.name}>
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(item.updatedAt)}
                  </p>
                  {item.size && (
                    <p className="text-xs text-gray-400">
                      {formatSize(item.size)}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, item);
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
          
          {items.map((item) => (
            <div
              key={item.id}
              className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-colors ${
                selectedItems.includes(item.id)
                  ? 'bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onItemClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              <div className="col-span-6 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  item.type === 'folder' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {item.type === 'folder' ? (
                    <FolderOpen className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <span className="font-medium text-gray-800 truncate">{item.name}</span>
              </div>
              
              <div className="col-span-2 text-sm text-gray-500">
                {formatDate(item.updatedAt)}
              </div>
              
              <div className="col-span-2 text-sm text-gray-500">
                {formatSize(item.size)}
              </div>
              
              <div className="col-span-2 flex items-center justify-between">
                <span className="text-sm text-gray-500 capitalize">{item.type}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleContextMenu(e, item);
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

      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              onItemEdit(contextMenu.item);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => {
              // onItemStar(contextMenu.item);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span>Add to Starred</span>
          </button>
          <button
            onClick={() => {
              // onItemShare(contextMenu.item);
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
              onItemDelete(contextMenu.item);
              handleCloseContextMenu();
            }}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};