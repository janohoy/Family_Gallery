export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  createdAt: number;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}
