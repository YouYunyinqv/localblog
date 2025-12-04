import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './components/HomeView';
import { ArticleView } from './components/ArticleView';
import { ImageManager } from './components/ImageManager';
import { SettingsModal } from './components/SettingsModal';
import { LockScreen } from './components/LockScreen';
import { 
  getAppData, 
  saveAppData, 
  generateId, 
  cleanupImages 
} from './services/storageService';
import { 
  Post, Category, StoredImage, SortOption, SortDirection, ViewMode, AppSettings, CustomLabels
} from './types';

// --- Capacitor Imports ---
import { Capacitor } from '@capacitor/core';
import { CapacitorHttpServer } from '@capacitor-community/http-server';
import { Network } from '@capacitor/network';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    backgroundImageId: null, 
    lockScreenImageId: null,
    labels: {} as CustomLabels,
    editorFontSize: 100,
    previewFontSize: 100
  });
  
  const [view, setView] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  
  const [sortOption, setSortOption] = useState<SortOption>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // --- Server State ---
  const [serverUrl, setServerUrl] = useState<string | null>(null);

  // --- Initial Load ---
  useEffect(() => {
    const data = getAppData();
    setPosts(data.posts);
    setCategories(data.categories);
    setImages(data.images);
    setSettings(data.settings);
  }, []);

  // --- Server & Network Logic ---
  useEffect(() => {
    const initServer = async () => {
      if (!Capacitor.isNativePlatform()) return;

      try {
        // 1. Get IP Address
        const status = await Network.getStatus();
        if (status.connectionType === 'wifi') {
          // Attempt to start server
          // Port 8080, serving the 'public' folder (which Capacitor maps to our dist)
          await CapacitorHttpServer.start({ port: 8080 });
          
          // Find the IPv4 address
          // Note: This is a simplified check. Real IP detection can be complex, 
          // but we will try to construct it or ask user to check settings.
          // Actually, let's just show the message that it's running.
          
          // For displaying specific IP, we need a plugin that returns IP, 
          // Network plugin mostly returns status. 
          // For now, we will display a generic message or try to use location.hostname if possible in webview? No.
          // Let's assume standard local IP class C.
          
          setServerUrl("Running on Port 8080"); 
        }
      } catch (e) {
        console.error("Server Start Failed", e);
      }
    };
    
    initServer();
  }, []);

  // --- Persistence ---
  useEffect(() => {
    saveAppData({ posts, categories, images, settings });
  }, [posts, categories, images, settings]);

  // --- Key Handlers ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            if (isLocked) return;
            if (showSettings) { setShowSettings(false); return; }
            if (view === 'home') setIsLocked(true);
            else if (view === 'images') setView('home');
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isLocked, showSettings]);

  // --- Mouse Navigation ---
  useEffect(() => {
      const handleMouseUp = (e: MouseEvent) => {
          if (view !== 'article') return;
          if (e.button === 3) {
              e.preventDefault();
              if (historyIndex > 0) {
                  const prevPostId = history[historyIndex - 1];
                  const prevPost = posts.find(p => p.id === prevPostId);
                  if (prevPost) {
                      setSlideDirection('left');
                      setHistoryIndex(prev => prev - 1);
                      setActivePost(prevPost);
                  }
              }
          } else if (e.button === 4) {
              e.preventDefault();
              if (historyIndex < history.length - 1) {
                  const nextPostId = history[historyIndex + 1];
                  const nextPost = posts.find(p => p.id === nextPostId);
                  if (nextPost) {
                      setSlideDirection('right');
                      setHistoryIndex(prev => prev + 1);
                      setActivePost(nextPost);
                  }
              }
          }
      };
      window.addEventListener('mouseup', handleMouseUp);
      return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [view, history, historyIndex, posts]);

  // --- Derived Data ---
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    if (activeCategory) filtered = filtered.filter(p => p.categoryId === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q));
    }
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortOption === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); } 
      else { valA = a[sortOption]; valB = b[sortOption]; }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [posts, activeCategory, searchQuery, sortOption, sortDirection]);

  // --- Handlers ---
  const handleCreatePost = () => {
    const newPost: Post = {
      id: generateId(),
      title: settings.labels.untitledDraft,
      content: '',
      categoryId: activeCategory || categories[0]?.id || 'general',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setPosts([newPost, ...posts]);
    navigateToPost(newPost);
  };

  const navigateToPost = (post: Post) => {
      if (activePost?.id !== post.id) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(post.id);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setSlideDirection('none');
      }
      setActivePost(post);
      setView('article');
  };

  const handleSavePost = (updatedPost: Post) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
    setActivePost(updatedPost);
  };

  const handleUploadImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const newImage: StoredImage = { id: generateId(), dataUrl: result, name: file.name, createdAt: Date.now() };
        setImages(prev => [...prev, newImage]);
        resolve(result); 
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCleanupImages = () => {
    const keptImages = cleanupImages(posts, images);
    setImages(keptImages);
    if (settings.backgroundImageId && !keptImages.find(i => i.id === settings.backgroundImageId)) setSettings({ ...settings, backgroundImageId: null });
    if (settings.lockScreenImageId && !keptImages.find(i => i.id === settings.lockScreenImageId)) setSettings({ ...settings, lockScreenImageId: null });
  };

  const handleAddCategory = (name: string) => {
    const exists = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) return exists;
    const newCat = { id: generateId(), name };
    setCategories([...categories, newCat]);
    return newCat;
  };

  // --- Render ---
  const bgImage = useMemo(() => images.find(img => img.id === settings.backgroundImageId)?.dataUrl, [images, settings.backgroundImageId]);
  const lockImage = useMemo(() => images.find(img => img.id === settings.lockScreenImageId)?.dataUrl, [images, settings.lockScreenImageId]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#121212] text-gray-200">
      
      {/* --- Server Info Overlay (Only visible on Native App) --- */}
      {Capacitor.isNativePlatform() && (
        <div className="fixed top-2 right-2 z-50 px-3 py-1 bg-black/60 backdrop-blur text-xs text-green-400 rounded border border-green-800 pointer-events-none">
           LAN: http://[Phone-IP]:8080
        </div>
      )}

      {isLocked && <LockScreen backgroundImage={lockImage || bgImage} customText={settings.labels.lockScreenText} onUnlock={() => setIsLocked(false)} />}
      {showSettings && <SettingsModal labels={settings.labels} onSave={(l) => setSettings(prev => ({ ...prev, labels: l }))} onClose={() => setShowSettings(false)} />}

      {bgImage && (
          <div className="fixed inset-0 z-0 select-none pointer-events-none">
              <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-opacity duration-1000" style={{ backgroundImage: `url(${bgImage})` }} />
              <div className="absolute inset-0 backdrop-blur-[20px] bg-[#121212]/50"></div>
          </div>
      )}

      <div className={`relative z-10 transition-all duration-500 ${isLocked ? 'blur-md scale-95 opacity-50' : 'opacity-100'}`}>
        <Sidebar 
            posts={posts} categories={categories} activeCategory={activeCategory} searchQuery={searchQuery} isArticleView={view === 'article'} labels={settings.labels}
            onSelectCategory={setActiveCategory} onSearchChange={setSearchQuery} onViewChange={setView} onCreatePost={handleCreatePost} onOpenSettings={() => setShowSettings(true)}
            onUpdateCategory={(id, name) => setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c))}
        />
        <main className="transition-all duration-300">
            {view === 'home' && (
            <HomeView posts={filteredPosts} categories={categories} activeCategory={activeCategory} sortOption={sortOption} sortDirection={sortDirection}
                onPostClick={navigateToPost} onSortChange={setSortOption} onDirectionToggle={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            />
            )}
            {view === 'article' && activePost && (
            <ArticleView post={activePost} categories={categories} labels={settings.labels} images={images} editorFontSize={settings.editorFontSize} previewFontSize={settings.previewFontSize} slideDirection={slideDirection}
                onSave={handleSavePost} onBack={() => setView('home')} onAddCategory={handleAddCategory} onUploadImage={handleUploadImage}
                onFontSizeChange={(type, size) => setSettings(prev => ({ ...prev, [type === 'editor' ? 'editorFontSize' : 'previewFontSize']: size }))}
            />
            )}
            {view === 'images' && (
            <ImageManager images={images} posts={posts} currentBgId={settings.backgroundImageId} currentLockId={settings.lockScreenImageId}
                onCleanup={handleCleanupImages} onBack={() => setView('home')} 
                onSetBackground={(id) => setSettings(prev => ({ ...prev, backgroundImageId: id }))} 
                onSetLockScreen={(id) => setSettings(prev => ({ ...prev, lockScreenImageId: id }))} 
                onUpload={async (f) => { await handleUploadImage(f); }}
            />
            )}
        </main>
      </div>
    </div>
  );
}

export default App;