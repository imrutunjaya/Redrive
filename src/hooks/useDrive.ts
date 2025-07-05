import { useState, useEffect } from 'react';
import { DriveItem, DriveState } from '../types';

const STORAGE_KEY = 'student_drive_items';

const mockInitialItems: DriveItem[] = [
  {
    id: '1',
    name: 'Computer Science',
    type: 'folder',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    path: '/Computer Science',
    tags: ['academics'],
  },
  {
    id: '2',
    name: 'Mathematics',
    type: 'folder',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
    path: '/Mathematics',
    tags: ['academics'],
  },
  {
    id: '3',
    name: 'Personal Notes',
    type: 'folder',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
    path: '/Personal Notes',
    tags: ['personal'],
  },
  {
    id: '4',
    name: 'Data Structures.md',
    type: 'file',
    size: 2048,
    content: '# Data Structures\n\n## Arrays\n\nArrays are fundamental data structures...',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    path: '/Computer Science/Data Structures.md',
    parentId: '1',
    tags: ['notes', 'programming'],
  },
  {
    id: '5',
    name: 'Calculus Notes.md',
    type: 'file',
    size: 1536,
    content: '# Calculus\n\n## Derivatives\n\nThe derivative of a function...',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    path: '/Mathematics/Calculus Notes.md',
    parentId: '2',
    tags: ['notes', 'math'],
  },
];

export const useDrive = (userId?: string) => {
  const [driveState, setDriveState] = useState<DriveState>({
    items: [],
    currentPath: '/',
    selectedItems: [],
    searchQuery: '',
    viewMode: 'grid',
  });

  useEffect(() => {
    if (userId) {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      const storedItems = localStorage.getItem(storageKey);
      if (storedItems) {
        try {
          const items = JSON.parse(storedItems).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt),
          }));
          setDriveState(prev => ({ ...prev, items }));
        } catch (error) {
          setDriveState(prev => ({ ...prev, items: mockInitialItems }));
        }
      } else {
        setDriveState(prev => ({ ...prev, items: mockInitialItems }));
      }
    }
  }, [userId]);

  const saveToStorage = (items: DriveItem[]) => {
    if (userId) {
      const storageKey = `${STORAGE_KEY}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  };

  const createItem = (name: string, type: 'file' | 'folder', content?: string) => {
    const newItem: DriveItem = {
      id: Date.now().toString(),
      name,
      type,
      content,
      size: content ? content.length : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      path: driveState.currentPath === '/' ? `/${name}` : `${driveState.currentPath}/${name}`,
      parentId: driveState.currentPath === '/' ? undefined : getCurrentFolderId(),
      tags: [],
    };

    const newItems = [...driveState.items, newItem];
    setDriveState(prev => ({ ...prev, items: newItems }));
    saveToStorage(newItems);
    return newItem;
  };

  const updateItem = (id: string, updates: Partial<DriveItem>) => {
    const newItems = driveState.items.map(item => 
      item.id === id 
        ? { ...item, ...updates, updatedAt: new Date() }
        : item
    );
    setDriveState(prev => ({ ...prev, items: newItems }));
    saveToStorage(newItems);
  };

  const deleteItem = (id: string) => {
    const newItems = driveState.items.filter(item => item.id !== id);
    setDriveState(prev => ({ ...prev, items: newItems }));
    saveToStorage(newItems);
  };

  const getCurrentFolderId = () => {
    const folder = driveState.items.find(item => 
      item.type === 'folder' && item.path === driveState.currentPath
    );
    return folder?.id;
  };

  const navigateToPath = (path: string) => {
    setDriveState(prev => ({ ...prev, currentPath: path, selectedItems: [] }));
  };

  const setSearchQuery = (query: string) => {
    setDriveState(prev => ({ ...prev, searchQuery: query }));
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    setDriveState(prev => ({ ...prev, viewMode: mode }));
  };

  const toggleItemSelection = (id: string) => {
    setDriveState(prev => ({
      ...prev,
      selectedItems: prev.selectedItems.includes(id)
        ? prev.selectedItems.filter(itemId => itemId !== id)
        : [...prev.selectedItems, id]
    }));
  };

  const getFilteredItems = () => {
    let filtered = driveState.items.filter(item => {
      const isInCurrentPath = driveState.currentPath === '/' 
        ? !item.parentId 
        : item.parentId === getCurrentFolderId();
      
      const matchesSearch = !driveState.searchQuery || 
        item.name.toLowerCase().includes(driveState.searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(driveState.searchQuery.toLowerCase()));

      return isInCurrentPath && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'folder' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const getRecentItems = () => {
    return driveState.items
      .filter(item => item.type === 'file')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  };

  return {
    ...driveState,
    createItem,
    updateItem,
    deleteItem,
    navigateToPath,
    setSearchQuery,
    setViewMode,
    toggleItemSelection,
    getFilteredItems,
    getRecentItems,
  };
};