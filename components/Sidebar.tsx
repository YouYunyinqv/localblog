import React, { useState } from 'react';
import { Post, Category, ViewMode, CustomLabels } from '../types';
import { Search, Hash, LayoutGrid, Plus, FolderOpen, Settings, Check, X, Pencil } from 'lucide-react';

interface SidebarProps {
  posts: Post[];
  categories: Category[];
  activeCategory: string | null;
  searchQuery: string;
  isArticleView: boolean;
  labels: CustomLabels;
  onSelectCategory: (id: string | null) => void;
  onSearchChange: (query: string) => void;
  onViewChange: (view: ViewMode) => void;
  onCreatePost: () => void;
  onOpenSettings: () => void;
  onUpdateCategory: (id: string, name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  posts,
  categories,
  activeCategory,
  searchQuery,
  isArticleView,
  labels,
  onSelectCategory,
  onSearchChange,
  onViewChange,
  onCreatePost,
  onOpenSettings,
  onUpdateCategory
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const getCount = (catId: string | null) => {
    if (!catId) return posts.length;
    return posts.filter(p => p.categoryId === catId).length;
  };

  const startEditing = (e: React.MouseEvent, cat: Category) => {
      e.stopPropagation(); // Prevent navigation
      setEditingCatId(cat.id);
      setEditName(cat.name);
  };

  const saveCategory = (e: React.MouseEvent | React.FormEvent) => {
      e.stopPropagation();
      if (editingCatId && editName.trim()) {
          onUpdateCategory(editingCatId, editName.trim());
      }
      setEditingCatId(null);
  };

  const cancelEditing = (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingCatId(null);
  };

  return (
    <aside 
      className={`
        fixed left-0 top-0 bottom-0 z-40 w-72 glass-panel border-r-0 shadow-2xl
        transition-all duration-500 ease-in-out flex flex-col group
        ${isArticleView ? '-translate-x-[260px] hover:translate-x-0 opacity-80 hover:opacity-100' : 'translate-x-0'}
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex justify-between items-start">
        <div 
          className="cursor-pointer"
          onClick={() => onViewChange('home')}
        >
          <h1 className="text-3xl font-bold text-primary-500 font-serif tracking-tight drop-shadow-md leading-none">
            {labels.blogTitle}
          </h1>
          <span className="text-gray-500 font-sans text-xs font-normal uppercase tracking-widest block mt-1">
             {labels.blogSubtitle}
          </span>
        </div>
        <button onClick={onOpenSettings} className="text-dark-600 hover:text-gray-300 transition-colors">
            <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4">
        <div className="relative group/search">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within/search:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder={labels.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-600 rounded-none text-sm text-gray-200 placeholder-gray-600 focus:bg-dark-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all outline-none"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
        <div 
          onClick={() => { onSelectCategory(null); onViewChange('home'); }}
          className={`
            flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-l-2
            ${activeCategory === null 
              ? 'bg-primary-900/20 text-primary-400 border-primary-500' 
              : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-200 hover:border-gray-600'}
          `}
        >
          <div className="flex items-center gap-3">
            <LayoutGrid className="w-4 h-4" />
            <span className="font-medium">{labels.allArticles}</span>
          </div>
          <span className="text-xs bg-dark-800 px-2 py-0.5 rounded text-gray-400 font-mono border border-dark-600">
            {getCount(null)}
          </span>
        </div>

        {categories.map(cat => (
          <div 
            key={cat.id}
            onClick={() => { onSelectCategory(cat.id); onViewChange('home'); }}
            onDoubleClick={(e) => startEditing(e, cat)}
            className={`
              flex items-center justify-between px-4 py-3 cursor-pointer transition-all border-l-2 group/item relative
              ${activeCategory === cat.id 
                ? 'bg-primary-900/20 text-primary-400 border-primary-500' 
                : 'text-gray-400 border-transparent hover:bg-white/5 hover:text-gray-200 hover:border-gray-600'}
            `}
          >
            {editingCatId === cat.id ? (
                <div className="flex items-center gap-1 w-full" onClick={e => e.stopPropagation()}>
                    <input 
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-dark-900 border border-primary-500 text-xs px-1 py-1 text-white outline-none"
                        onKeyDown={e => e.key === 'Enter' && saveCategory(e)}
                    />
                    <button onClick={saveCategory} className="text-green-500 hover:text-green-400"><Check className="w-3 h-3" /></button>
                    <button onClick={cancelEditing} className="text-red-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                </div>
            ) : (
                <>
                    <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 opacity-50 group-hover/item:opacity-100" />
                    <span className="font-medium truncate max-w-[120px]" title={cat.name}>{cat.name}</span>
                    <button 
                        onClick={(e) => startEditing(e, cat)}
                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-white transition-opacity"
                        title="重命名"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    </div>
                    <span className="text-xs bg-dark-800 px-2 py-0.5 rounded text-gray-400 font-mono border border-dark-600">
                    {getCount(cat.id)}
                    </span>
                </>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-white/5 space-y-3 bg-dark-900/30">
        <button 
          onClick={onCreatePost}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-primary-500/20 transition-all active:scale-95 uppercase tracking-wide text-sm font-bold border border-primary-500"
        >
          <Plus className="w-5 h-5" />
          <span>{labels.newPostButton}</span>
        </button>

        <button 
          onClick={() => onViewChange('images')}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-gray-500 hover:bg-white/5 hover:text-primary-300 transition-all border border-transparent hover:border-white/10"
        >
          <FolderOpen className="w-4 h-4" />
          <span className="text-sm">{labels.fileManagerButton}</span>
        </button>
      </div>
      
      {/* Decorative strip */}
      {isArticleView && (
         <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1 h-12 bg-primary-500/50 rounded-full opacity-50 group-hover:opacity-0 transition-opacity"></div>
      )}
    </aside>
  );
};