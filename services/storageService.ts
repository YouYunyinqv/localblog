import { Post, Category, StoredImage, AppSettings, CustomLabels } from '../types';

const STORAGE_KEY = 'rosetint_blog_data_v3';

interface AppData {
  posts: Post[];
  categories: Category[];
  images: StoredImage[];
  settings: AppSettings;
}

const DEFAULT_LABELS: CustomLabels = {
  blogTitle: 'RoseTint',
  blogSubtitle: '复古版',
  allArticles: '所有文章',
  untitledDraft: '未命名草稿',
  searchPlaceholder: '搜索文章...',
  newPostButton: '新建文章',
  fileManagerButton: '资源管理器',
  lockScreenText: '按任意键解锁',
  editPlaceholder: '开始创作...',
  clickToEdit: '双击此处开始编辑文章...'
};

const INITIAL_DATA: AppData = {
  posts: [
    {
      id: '1',
      title: '你好，世界',
      content: '# 欢迎来到 RoseTint\n\n这是一个支持 **Markdown** 的复古风格博客。\n\n点击标题即可开始编辑！\n\n支持图片上传、实时预览和暗色模式。',
      categoryId: 'general',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
  ],
  categories: [
    { id: 'general', name: '默认分类' },
    { id: 'tech', name: '技术笔记' },
    { id: 'life', name: '生活随想' }
  ],
  images: [],
  settings: {
    backgroundImageId: null,
    lockScreenImageId: null,
    labels: DEFAULT_LABELS,
    editorFontSize: 100,
    previewFontSize: 100
  }
};

export const getAppData = (): AppData => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  const parsed = JSON.parse(data);
  
  // Migrations
  if (!parsed.settings) {
    parsed.settings = INITIAL_DATA.settings;
  }
  if (!parsed.settings.labels) {
    parsed.settings.labels = DEFAULT_LABELS;
  }
  if (!parsed.settings.lockScreenImageId) {
    parsed.settings.lockScreenImageId = null;
  }
  if (!parsed.settings.editorFontSize) {
    parsed.settings.editorFontSize = 100;
  }
  if (!parsed.settings.previewFontSize) {
    parsed.settings.previewFontSize = 100;
  }

  return parsed;
};

export const saveAppData = (data: AppData) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const cleanupImages = (posts: Post[], images: StoredImage[]): StoredImage[] => {
  // Find all used image URLs in markdown
  const usedUrls = new Set<string>();
  const regex = /!\[.*?\]\((.*?)\)/g;
  
  posts.forEach(post => {
    let match;
    while ((match = regex.exec(post.content)) !== null) {
      usedUrls.add(match[1]);
    }
  });

  // Filter images that are present in the usedUrls set
  return images.filter(img => usedUrls.has(img.dataUrl));
};
