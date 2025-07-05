import React, { useState, useEffect } from 'react';
import { Save, X, FileText } from 'lucide-react';
import { DriveItem } from '../types';

interface NoteEditorProps {
  item: DriveItem | null;
  onSave: (id: string, content: string, name: string) => void;
  onClose: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ item, onSave, onClose }) => {
  const [content, setContent] = useState('');
  const [name, setName] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (item) {
      setContent(item.content || '');
      setName(item.name);
      setHasChanges(false);
    }
  }, [item]);

  const handleSave = () => {
    if (item) {
      onSave(item.id, content, name);
      setHasChanges(false);
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

  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-xl font-semibold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0"
              />
              <p className="text-sm text-gray-500">
                Last modified: {new Date(item.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 p-6">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full min-h-[400px] resize-none border-none focus:outline-none focus:ring-0 text-gray-800 leading-relaxed"
            placeholder="Start writing your note..."
            style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
          />
        </div>

        {hasChanges && (
          <div className="px-6 py-3 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-800">
            You have unsaved changes. Don't forget to save before closing.
          </div>
        )}
      </div>
    </div>
  );
};