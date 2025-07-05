import React, { useState, useEffect } from 'react';
import { GoogleLoginForm } from './components/GoogleLoginForm';
import { GoogleDriveHeader } from './components/GoogleDriveHeader';
import { GoogleDriveSidebar } from './components/GoogleDriveSidebar';
import { GoogleDriveDashboard } from './components/GoogleDriveDashboard';
import { GoogleDriveGrid } from './components/GoogleDriveGrid';
import { GoogleFileEditor } from './components/GoogleFileEditor';
import { StudentTools } from './components/StudentTools';
import { useGoogleAuth } from './hooks/useGoogleAuth';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { GoogleDriveFile } from './types';

function App() {
  const { user, isAuthenticated, isLoading: authLoading, login, logout } = useGoogleAuth();
  const {
    files,
    currentFolderId,
    currentPath,
    selectedFiles,
    searchQuery,
    viewMode,
    isLoading: driveLoading,
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
    refreshFiles,
  } = useGoogleDrive(isAuthenticated);

  const [editingFile, setEditingFile] = useState<GoogleDriveFile | null>(null);
  const [currentView, setCurrentView] = useState<string>('root');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleFileClick = (file: GoogleDriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      navigateToFolder(file.id, file.name);
    } else {
      setEditingFile(file);
    }
  };

  const handleCreateFolder = async () => {
    const name = prompt('Enter folder name:');
    if (name) {
      await createFolder(name);
    }
  };

  const handleCreateFile = async () => {
    const name = prompt('Enter file name (with extension):');
    if (name) {
      const newFile = await createFile(name, '# New Note\n\nStart writing your note here...');
      if (newFile) {
        setEditingFile(newFile);
      }
    }
  };

  const handleSaveFile = async (fileId: string, content: string, name: string) => {
    setEditingFile(null);
    await refreshFiles();
  };

  const handleDeleteFile = async (file: GoogleDriveFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      await deleteFile(file.id);
    }
  };

  const handleSearch = (query: string) => {
    searchFiles(query);
  };

  const handleNavigateToPath = (index: number) => {
    navigateToPath(index);
    setCurrentView('root');
  };

  const handleSidebarNavigate = (path: string) => {
    setCurrentView(path);
    if (path === 'root') {
      navigateToFolder(null, 'My Drive');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <GoogleLoginForm onLogin={login} isLoading={authLoading} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <GoogleDriveHeader
        user={user}
        searchQuery={searchQuery}
        currentPath={currentPath}
        sidebarCollapsed={sidebarCollapsed}
        onSearchChange={handleSearch}
        onNavigateToPath={handleNavigateToPath}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={logout}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <GoogleDriveSidebar
          currentPath={currentView}
          storageQuota={storageQuota}
          collapsed={sidebarCollapsed}
          onNavigate={handleSidebarNavigate}
          onCreateFolder={handleCreateFolder}
          onCreateFile={handleCreateFile}
        />
        
        <main className={`flex-1 overflow-auto transition-all duration-300 ${
          sidebarCollapsed ? 'ml-0' : ''
        }`}>
          {currentView === 'tools' ? (
            <StudentTools />
          ) : currentView === 'root' && currentFolderId === null ? (
            <GoogleDriveDashboard
              files={files}
              storageQuota={storageQuota}
              onFileClick={handleFileClick}
              getRecentFiles={getRecentFiles}
            />
          ) : (
            <GoogleDriveGrid
              files={files}
              viewMode={viewMode}
              isLoading={driveLoading}
              onViewModeChange={setViewMode}
              onFileClick={handleFileClick}
              onFileEdit={setEditingFile}
              onFileDelete={handleDeleteFile}
              onFileSelect={toggleFileSelection}
              selectedFiles={selectedFiles}
            />
          )}
        </main>
      </div>

      {editingFile && (
        <GoogleFileEditor
          file={editingFile}
          onSave={handleSaveFile}
          onClose={() => setEditingFile(null)}
        />
      )}
    </div>
  );
}

export default App;