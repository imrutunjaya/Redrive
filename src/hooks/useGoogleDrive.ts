import { useState, useEffect } from 'react';
import { GoogleDriveFile, DriveState, FolderPath } from '../types';
import { googleDriveService } from '../services/googleDrive';

export const useGoogleDrive = (isAuthenticated: boolean) => {
  const [driveState, setDriveState] = useState<DriveState>({
    files: [],
    currentFolderId: null,
    currentPath: [{ id: 'root', name: 'My Drive' }],
    selectedFiles: [],
    searchQuery: '',
    viewMode: 'grid',
    isLoading: false,
  });

  const [storageQuota, setStorageQuota] = useState({ used: '0', total: '0' });

  useEffect(() => {
    if (isAuthenticated) {
      // Add a small delay to ensure Google API is fully initialized
      const timer = setTimeout(() => {
        loadFiles();
        loadStorageQuota();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && driveState.currentFolderId !== null) {
      loadFiles();
    }
  }, [driveState.currentFolderId]);

  const loadFiles = async () => {
    if (!isAuthenticated) return;
    
    try {
      setDriveState(prev => ({ ...prev, isLoading: true }));
      const files = await googleDriveService.listFiles(driveState.currentFolderId, driveState.searchQuery);
      setDriveState(prev => ({ ...prev, files, isLoading: false }));
    } catch (error) {
      console.error('Error loading files:', error);
      setDriveState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const loadStorageQuota = async () => {
    if (!isAuthenticated) return;
    
    try {
      const quota = await googleDriveService.getStorageQuota();
      setStorageQuota(quota);
    } catch (error) {
      console.error('Error loading storage quota:', error);
    }
  };

  const navigateToFolder = async (folderId: string | null, folderName: string) => {
    if (folderId === driveState.currentFolderId) return;

    let newPath: FolderPath[];
    
    if (folderId === null) {
      // Navigate to root
      newPath = [{ id: 'root', name: 'My Drive' }];
    } else {
      // Navigate to subfolder
      newPath = [...driveState.currentPath, { id: folderId, name: folderName }];
    }

    setDriveState(prev => ({
      ...prev,
      currentFolderId: folderId,
      currentPath: newPath,
      selectedFiles: [],
    }));
  };

  const navigateToPath = (pathIndex: number) => {
    const newPath = driveState.currentPath.slice(0, pathIndex + 1);
    const targetFolder = newPath[newPath.length - 1];
    
    setDriveState(prev => ({
      ...prev,
      currentFolderId: targetFolder.id === 'root' ? null : targetFolder.id,
      currentPath: newPath,
      selectedFiles: [],
    }));
  };

  const createFolder = async (name: string): Promise<GoogleDriveFile | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const folder = await googleDriveService.createFolder(name, driveState.currentFolderId);
      await loadFiles();
      return folder;
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
      return null;
    }
  };

  const createFile = async (name: string, content: string = ''): Promise<GoogleDriveFile | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const file = await googleDriveService.createFile(name, content, driveState.currentFolderId);
      await loadFiles();
      return file;
    } catch (error) {
      console.error('Error creating file:', error);
      alert('Failed to create file. Please try again.');
      return null;
    }
  };

  const deleteFile = async (fileId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      await googleDriveService.deleteFile(fileId);
      await loadFiles();
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
      return false;
    }
  };

  const renameFile = async (fileId: string, newName: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      await googleDriveService.renameFile(fileId, newName);
      await loadFiles();
      return true;
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename file. Please try again.');
      return false;
    }
  };

  const searchFiles = async (query: string) => {
    if (!isAuthenticated) return;
    
    try {
      setDriveState(prev => ({ ...prev, searchQuery: query, isLoading: true }));
      const files = query ? await googleDriveService.searchFiles(query) : await googleDriveService.listFiles(driveState.currentFolderId);
      setDriveState(prev => ({ ...prev, files, isLoading: false }));
    } catch (error) {
      console.error('Error searching files:', error);
      setDriveState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getRecentFiles = async (): Promise<GoogleDriveFile[]> => {
    if (!isAuthenticated) return [];
    
    try {
      return await googleDriveService.getRecentFiles();
    } catch (error) {
      console.error('Error getting recent files:', error);
      return [];
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setDriveState(prev => ({
      ...prev,
      selectedFiles: prev.selectedFiles.includes(fileId)
        ? prev.selectedFiles.filter(id => id !== fileId)
        : [...prev.selectedFiles, fileId],
    }));
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    setDriveState(prev => ({ ...prev, viewMode: mode }));
  };

  const clearSearch = () => {
    setDriveState(prev => ({ ...prev, searchQuery: '' }));
    loadFiles();
  };

  return {
    ...driveState,
    storageQuota,
    navigateToFolder,
    navigateToPath,
    createFolder,
    createFile,
    deleteFile,
    renameFile,
    searchFiles,
    getRecentFiles,
    toggleFileSelection,
    setViewMode,
    clearSearch,
    refreshFiles: loadFiles,
  };
};