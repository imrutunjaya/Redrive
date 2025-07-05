import { googleAuthService } from './googleAuth';
import { GoogleDriveFile } from '../types';

class GoogleDriveService {
  private getGapi() {
    const gapi = googleAuthService.getGapi();
    if (!gapi || !gapi.client) {
      throw new Error('Google API not initialized');
    }
    return gapi;
  }

  private getAccessToken() {
    const gapi = this.getGapi();
    const token = gapi.client.getToken();
    if (!token || !token.access_token) {
      throw new Error('No access token available');
    }
    return token.access_token;
  }

  async listFiles(folderId: string | null = null, query: string = ''): Promise<GoogleDriveFile[]> {
    try {
      const gapi = this.getGapi();
      let q = "trashed=false";
      
      if (folderId) {
        q += ` and '${folderId}' in parents`;
      } else {
        q += " and 'root' in parents";
      }

      if (query) {
        q += ` and name contains '${query}'`;
      }

      const response = await gapi.client.drive.files.list({
        q,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink,shared,starred,exportLinks)',
        orderBy: 'folder,name',
        pageSize: 100,
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

  async createFolder(name: string, parentId: string | null = null): Promise<GoogleDriveFile> {
    try {
      const gapi = this.getGapi();
      const metadata = {
        name,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : ['root'],
      };

      const response = await gapi.client.drive.files.create({
        resource: metadata,
        fields: 'id,name,mimeType,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink',
      });

      return response.result;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  async createFile(name: string, content: string, parentId: string | null = null): Promise<GoogleDriveFile> {
    try {
      const accessToken = this.getAccessToken();
      
      const metadata = {
        name,
        parents: parentId ? [parentId] : ['root'],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: 'text/plain' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating file:', error);
      throw error;
    }
  }

  async getFileContent(fileId: string): Promise<string> {
    try {
      const accessToken = this.getAccessToken();
      
      // First, get file metadata to check if it's a Google Workspace file
      const gapi = this.getGapi();
      const fileInfo = await gapi.client.drive.files.get({
        fileId,
        fields: 'mimeType,exportLinks'
      });

      const mimeType = fileInfo.result.mimeType;
      
      // Handle Google Workspace files
      if (this.isGoogleDoc({ mimeType } as GoogleDriveFile)) {
        if (fileInfo.result.exportLinks) {
          // Try to export as plain text
          const exportUrl = fileInfo.result.exportLinks['text/plain'] || 
                           fileInfo.result.exportLinks['text/html'];
          
          if (exportUrl) {
            const response = await fetch(exportUrl, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            });
            
            if (response.ok) {
              return await response.text();
            }
          }
        }
        throw new Error('This Google Workspace file cannot be edited directly. Please use Google Drive.');
      }

      // Handle regular files
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle different content types
      if (mimeType?.startsWith('image/')) {
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      }

      return await response.text();
    } catch (error) {
      console.error('Error getting file content:', error);
      throw error;
    }
  }

  async updateFileContent(fileId: string, content: string): Promise<void> {
    try {
      const accessToken = this.getAccessToken();
      
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'text/plain',
        },
        body: content,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating file content:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const gapi = this.getGapi();
      await gapi.client.drive.files.delete({
        fileId,
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async renameFile(fileId: string, newName: string): Promise<void> {
    try {
      const gapi = this.getGapi();
      await gapi.client.drive.files.update({
        fileId,
        resource: { name: newName },
      });
    } catch (error) {
      console.error('Error renaming file:', error);
      throw error;
    }
  }

  async getFileInfo(fileId: string): Promise<GoogleDriveFile> {
    try {
      const gapi = this.getGapi();
      const response = await gapi.client.drive.files.get({
        fileId,
        fields: 'id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink,shared,starred,exportLinks',
      });

      return response.result;
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  async searchFiles(query: string): Promise<GoogleDriveFile[]> {
    try {
      const gapi = this.getGapi();
      const response = await gapi.client.drive.files.list({
        q: `name contains '${query}' and trashed=false`,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink,shared,starred)',
        orderBy: 'relevance',
        pageSize: 50,
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Error searching files:', error);
      throw error;
    }
  }

  async getRecentFiles(): Promise<GoogleDriveFile[]> {
    try {
      const gapi = this.getGapi();
      const response = await gapi.client.drive.files.list({
        q: "trashed=false and mimeType!='application/vnd.google-apps.folder'",
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,parents,webViewLink,thumbnailLink,iconLink,shared,starred)',
        orderBy: 'modifiedTime desc',
        pageSize: 10,
      });

      return response.result.files || [];
    } catch (error) {
      console.error('Error getting recent files:', error);
      throw error;
    }
  }

  async getStorageQuota(): Promise<{ used: string; total: string }> {
    try {
      const gapi = this.getGapi();
      const response = await gapi.client.drive.about.get({
        fields: 'storageQuota',
      });

      const quota = response.result.storageQuota;
      return {
        used: quota.usage || '0',
        total: quota.limit || '0',
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
      return { used: '0', total: '0' };
    }
  }

  isFolder(file: GoogleDriveFile): boolean {
    return file.mimeType === 'application/vnd.google-apps.folder';
  }

  isGoogleDoc(file: GoogleDriveFile): boolean {
    const googleMimeTypes = [
      'application/vnd.google-apps.document',
      'application/vnd.google-apps.spreadsheet',
      'application/vnd.google-apps.presentation',
      'application/vnd.google-apps.drawing',
      'application/vnd.google-apps.form',
      'application/vnd.google-apps.site'
    ];
    return googleMimeTypes.includes(file.mimeType || '');
  }

  isEditableFile(file: GoogleDriveFile): boolean {
    const editableMimeTypes = [
      'text/plain',
      'text/markdown',
      'text/html',
      'text/css',
      'text/javascript',
      'application/json',
      'text/csv',
      'application/x-javascript',
      'text/x-python'
    ];
    
    return editableMimeTypes.includes(file.mimeType || '') || 
           file.name.endsWith('.txt') || 
           file.name.endsWith('.md') || 
           file.name.endsWith('.json') ||
           file.name.endsWith('.csv') ||
           file.name.endsWith('.js') ||
           file.name.endsWith('.ts') ||
           file.name.endsWith('.css') ||
           file.name.endsWith('.html') ||
           file.name.endsWith('.py');
  }

  formatFileSize(bytes: string | undefined): string {
    if (!bytes) return '';
    const size = parseInt(bytes);
    if (isNaN(size)) return '';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (size === 0) return '0 B';
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return Math.round(size / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileTypeIcon(file: GoogleDriveFile): string {
    const mimeType = file.mimeType || '';
    
    if (this.isFolder(file)) return 'folder';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'document';
    if (mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('presentation')) return 'presentation';
    
    return 'file';
  }
}

export const googleDriveService = new GoogleDriveService();