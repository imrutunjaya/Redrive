import React, { useState, useEffect } from 'react';
import { Save, X, FileText, ExternalLink, Eye, Code, Type } from 'lucide-react';
import { GoogleDriveFile } from '../types';
import { googleDriveService } from '../services/googleDrive';

interface GoogleFileEditorProps {
  file: GoogleDriveFile | null;
  onSave: (fileId: string, content: string, name: string) => void;
  onClose: () => void;
}

export const GoogleFileEditor: React.FC<GoogleFileEditorProps> = ({ file, onSave, onClose }) => {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file) {
      setName(file.name);
      setHasChanges(false);
      setError(null);
      loadFileContent();
    }
  }, [file]);

  const loadFileContent = async () => {
    if (!file) return;

    // If it's a Google Docs file, we can't edit it directly
    if (googleDriveService.isGoogleDoc(file)) {
      setContent('This is a Google Docs file. Click "Open in Google Drive" to edit it.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const fileContent = await googleDriveService.getFileContent(file.id);
      setContent(fileContent);
    } catch (error) {
      console.error('Error loading file content:', error);
      setError('Error loading file content. This file type may not be supported for editing.');
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!file || !hasChanges) return;

    try {
      setIsSaving(true);
      setError(null);
      
      await googleDriveService.updateFileContent(file.id, content);
      
      if (name !== file.name) {
        await googleDriveService.renameFile(file.id, name);
      }
      
      onSave(file.id, content, name);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving file:', error);
      setError('Failed to save file. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(true);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setHasChanges(true);
  };

  const getFileType = () => {
    if (!file) return 'text';
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'md':
      case 'markdown':
        return 'markdown';
      case 'json':
        return 'json';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'py':
        return 'python';
      default:
        return 'text';
    }
  };

  const renderPreview = () => {
    const fileType = getFileType();
    
    if (fileType === 'markdown') {
      // Simple markdown preview (you could use a proper markdown parser)
      return (
        <div className="prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans">{content}</pre>
        </div>
      );
    }
    
    if (fileType === 'json') {
      try {
        const formatted = JSON.stringify(JSON.parse(content), null, 2);
        return (
          <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">
            <code>{formatted}</code>
          </pre>
        );
      } catch {
        return <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto">{content}</pre>;
      }
    }
    
    return <pre className="text-sm bg-gray-50 p-4 rounded overflow-auto whitespace-pre-wrap">{content}</pre>;
  };

  if (!file) return null;

  const isGoogleDoc = googleDriveService.isGoogleDoc(file);
  const fileType = getFileType();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              {file.thumbnailLink ? (
                <img 
                  src={file.thumbnailLink} 
                  alt={file.name}
                  className="h-6 w-6 object-cover rounded"
                />
              ) : (
                <FileText className="h-6 w-6 text-green-600" />
              )}
            </div>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isGoogleDoc}
                className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
              />
              <p className="text-sm text-gray-500">
                Last modified: {new Date(file.modifiedTime).toLocaleString()}
                {file.size && ` • ${googleDriveService.formatFileSize(file.size)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isGoogleDoc && (
              <>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('edit')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'edit' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Code className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      viewMode === 'preview' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    Preview
                  </button>
                </div>
                
                <button
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </>
            )}
            
            {isGoogleDoc && file.webViewLink && (
              <button
                onClick={() => window.open(file.webViewLink, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in Google Drive</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded-lg">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading file content...</p>
              </div>
            </div>
          ) : (
            <div className="h-full p-6">
              {viewMode === 'edit' ? (
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  disabled={isGoogleDoc}
                  className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50"
                  placeholder={isGoogleDoc ? "This file can only be edited in Google Drive" : "Start writing..."}
                  style={{ 
                    fontFamily: fileType === 'markdown' || fileType === 'text' 
                      ? 'ui-sans-serif, system-ui, sans-serif' 
                      : 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}
                />
              ) : (
                <div className="h-full overflow-auto border border-gray-300 rounded-lg p-4">
                  {renderPreview()}
                </div>
              )}
            </div>
          )}
        </div>

        {hasChanges && !isGoogleDoc && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800 flex items-center justify-between">
            <span>You have unsaved changes. Don't forget to save before closing.</span>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Now'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};