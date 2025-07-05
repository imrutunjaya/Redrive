import React, { useState, useEffect } from 'react';
import { Save, X, FileText, ExternalLink } from 'lucide-react';
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

  useEffect(() => {
    if (file) {
      setName(file.name);
      setHasChanges(false);
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
      const fileContent = await googleDriveService.getFileContent(file.id);
      setContent(fileContent);
    } catch (error) {
      console.error('Error loading file content:', error);
      setContent('Error loading file content. This file type may not be supported for editing.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!file || !hasChanges) return;

    try {
      setIsSaving(true);
      await googleDriveService.updateFileContent(file.id, content);
      
      if (name !== file.name) {
        await googleDriveService.renameFile(file.id, name);
      }
      
      onSave(file.id, content, name);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file. Please try again.');
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

  if (!file) return null;

  const isGoogleDoc = googleDriveService.isGoogleDoc(file);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col m-4">
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
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isGoogleDoc && file.webViewLink && (
              <button
                onClick={() => window.open(file.webViewLink, '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Open in Google Drive</span>
              </button>
            )}
            
            {!isGoogleDoc && (
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
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              disabled={isGoogleDoc}
              className="w-full h-full min-h-[400px] resize-none border-none focus:outline-none focus:ring-0 text-gray-800 leading-relaxed disabled:cursor-not-allowed disabled:bg-gray-50"
              placeholder={isGoogleDoc ? "This file can only be edited in Google Drive" : "Start writing..."}
              style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
            />
          )}
        </div>

        {hasChanges && !isGoogleDoc && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
            You have unsaved changes. Don't forget to save before closing.
          </div>
        )}
      </div>
    </div>
  );
};