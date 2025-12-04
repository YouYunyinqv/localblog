import React, { useState } from 'react';
import { Post, Category, SortOption, SortDirection } from '../types';
import { ArrowDownAZ, ArrowUpAZ, Calendar, Clock, AlignLeft } from 'lucide-react';

interface HomeViewProps {
  posts: Post[];
  categories: Category[];
  activeCategory: string | null;
  sortOption: SortOption;
  sortDirection: SortDirection;
  onPostClick: (post: Post) => void;
  onSortChange: (option: SortOption) => void;
  onDirectionToggle: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  posts,
  categories,
  activeCategory,
  sortOption,
  sortDirection,
  onPostClick,
  onSortChange,
  onDirectionToggle
}) => {
  
  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || '未分类';

  // Helper to strip markdown for preview
  const getPreview = (markdown: string) => {
    return markdown
      .replace(/!\[.*?\]\(.*?\)/g, '') // remove images
      .replace(/[#*`]/g, '') // remove formatting chars
      .substring(0, 150) + '...';
  };

  const activeCatName = activeCategory ? getCatName(activeCategory) : '所有文章';

  return (
    <div className="pl-72 min-h-screen">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 glass-panel border-b-0 border-white/5 px-8 py-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-100 font-serif tracking-wide">{activeCatName}</h2>
        
        <div className="flex items-center gap-0 bg-dark-900 border border-dark-600 p-0.5 shadow-lg">
            <button 
                onClick={() => onDirectionToggle()}
                className="p-2 text-gray-500 hover:bg-dark-700 hover:text-primary-400 transition-colors"
                title={sortDirection === 'asc' ? "升序" : "降序"}
            >
                {sortDirection === 'asc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-dark-600 mx-1"></div>
            <button 
                onClick={() => onSortChange('title')}
                className={`p-2 transition-colors ${sortOption === 'title' ? 'bg-dark-700 text-primary-400' : 'text-gray-500 hover:bg-dark-800'}`}
                title="按标题排序"
            >
                <AlignLeft className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onSortChange('createdAt')}
                className={`p-2 transition-colors ${sortOption === 'createdAt' ? 'bg-dark-700 text-primary-400' : 'text-gray-500 hover:bg-dark-800'}`}
                title="按发布时间排序"
            >
                <Calendar className="w-4 h-4" />
            </button>
            <button 
                onClick={() => onSortChange('updatedAt')}
                className={`p-2 transition-colors ${sortOption === 'updatedAt' ? 'bg-dark-700 text-primary-400' : 'text-gray-500 hover:bg-dark-800'}`}
                title="按修改时间排序"
            >
                <Clock className="w-4 h-4" />
            </button>
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="p-8">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {posts.map(post => (
                <div 
                    key={post.id}
                    onClick={() => onPostClick(post)}
                    className="break-inside-avoid bg-dark-800 shadow-lg hover:shadow-[0_10px_30px_rgba(240,24,101,0.15)] hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden group border border-dark-600 hover:border-primary-500/50"
                >
                    <div className="p-6">
                        <div className="mb-3 flex items-center gap-2">
                             <span className="text-[10px] font-bold tracking-wider text-primary-400 uppercase bg-primary-900/20 border border-primary-900 px-2 py-0.5">
                                {getCatName(post.categoryId)}
                             </span>
                             <span className="text-[10px] text-gray-500 ml-auto font-mono">
                                {new Date(post.createdAt).toLocaleDateString()}
                             </span>
                        </div>
                        <h3 className="text-xl font-serif font-bold text-gray-100 mb-3 group-hover:text-primary-500 transition-colors leading-tight">
                            {post.title}
                        </h3>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
                            {getPreview(post.content)}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                            <span className="text-xs text-dark-400 font-mono group-hover:text-primary-300/70 transition-colors">
                                Edited: {new Date(post.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {posts.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <p className="text-lg">没有找到文章。</p>
                <p className="text-sm opacity-50">尝试更改搜索条件或创建新文章。</p>
            </div>
        )}
      </div>
    </div>
  );
};