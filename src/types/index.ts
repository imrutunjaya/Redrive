export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
  shared?: boolean;
  starred?: boolean;
  trashed?: boolean;
}

export interface AuthState {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
}

export interface DriveState {
  files: GoogleDriveFile[];
  currentFolderId: string | null;
  currentPath: FolderPath[];
  selectedFiles: string[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

export interface FolderPath {
  id: string;
  name: string;
}

// Legacy types for compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  studentId: string;
  university: string;
  avatar?: string;
}

export interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  path: string;
  parentId?: string;
  tags: string[];
}