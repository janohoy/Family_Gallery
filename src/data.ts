import { MediaItem, Folder } from './types';

export const INITIAL_FOLDERS: Folder[] = [
  { id: '1', name: 'Family Vacation', createdAt: Date.now() - 200000 },
  { id: '2', name: 'Weddings', createdAt: Date.now() - 150000 },
];

export const INITIAL_MEDIA: MediaItem[] = [
  { id: '1', url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Family Picnic', createdAt: Date.now() - 100000, folderId: '1' },
  { id: '2', url: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Wedding Gathering', createdAt: Date.now() - 90000, folderId: '2' },
  { id: '3', url: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Generations', createdAt: Date.now() - 80000, folderId: '1' },
  { id: '4', url: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Event Slides', createdAt: Date.now() - 70000, folderId: '2' },
  { id: '5', url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Holiday Room', createdAt: Date.now() - 60000, folderId: '1' },
  { id: '6', url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?q=80&w=1000&auto=format&fit=crop', type: 'image', name: 'Reunion', createdAt: Date.now() - 50000, folderId: '1' },
];
