export interface Post {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
}

export interface StoredImage {
  id: string;
  dataUrl: string; // Base64 or Blob URL
  name: string;
  createdAt: number;
}

export interface CustomLabels {
  blogTitle: string;
  blogSubtitle: string;
  allArticles: string;
  untitledDraft: string;
  searchPlaceholder: string;
  newPostButton: string;
  fileManagerButton: string;
  lockScreenText: string;
  editPlaceholder: string;
  clickToEdit: string;
}

export interface AppSettings {
  backgroundImageId: string | null;
  lockScreenImageId: string | null;
  labels: CustomLabels;
  editorFontSize: number;
  previewFontSize: number;
}

export type SortOption = 'title' | 'createdAt' | 'updatedAt';
export type SortDirection = 'asc' | 'desc';

export type ViewMode = 'home' | 'article' | 'images';
