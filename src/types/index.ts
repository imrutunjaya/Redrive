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
  currentPath: string[];
  selectedFiles: string[];
  searchQuery: string;
  viewMode: 'grid' | 'list';
  isLoading: boolean;
}

export interface FolderPath {
  id: string;
  name: string;
}