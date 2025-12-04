import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Post, Category, CustomLabels, StoredImage } from '../types';
import { Save, Folder, Clock, Calendar, ArrowLeft, Image as ImageIcon, Type, MousePointer2, Plus, Minus, List } from 'lucide-react';
import { Button } from './Button';
import { ImageSelector } from './ImageSelector';

interface ArticleViewProps {
  post: Post;
  categories: Category[];
  labels: CustomLabels;
  images: StoredImage[];
  editorFontSize: number;
  previewFontSize: number;
  slideDirection: 'left' | 'right' | 'none';
  onSave: (post: Post) => void;
  onBack: () => void;
  onAddCategory: (name: string) => Category;
  onUploadImage: (file: File) => Promise<string>;
  onFontSizeChange: (type: 'editor' | 'preview', size: number) => void;
}

interface TOCItem {
  text: string;
  level: number;
  id: string;
}

export const ArticleView: React.FC<ArticleViewProps> = ({ 
  post: initialPost, 
  categories, 
  labels, 
  images,
  editorFontSize,
  previewFontSize,
  slideDirection,
  onSave, 
  onBack,
  onAddCategory,
  onUploadImage,
  onFontSizeChange
}) => {
  const [post, setPost] = useState(initialPost);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(true);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tocRef = useRef<HTMLUListElement>(null);

  // Sync state if prop changes (for fresh loads/history nav)
  useEffect(() => {
    setPost(initialPost);
  }, [initialPost.id]);

  // Handle animation timer
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [slideDirection, post.id]);

  // TOC Generation
  useEffect(() => {
    const lines = post.content.split('\n');
    const newToc: TOCItem[] = [];
    lines.forEach(line => {
        const match = line.match(/^(#{1,3})\s+(.*)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2];
            const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
            newToc.push({ level, text, id });
        }
    });
    setToc(newToc);
  }, [post.content]);

  // Scroll Spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      if (toc.length === 0) return;
      
      // Trigger point is a bit down from the top
      const scrollPosition = window.scrollY + 150;
      
      let current = '';
      // Iterate to find the last header that is above the trigger point
      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (element && element.offsetTop <= scrollPosition) {
          current = item.id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  // Auto-scroll TOC to active item
  useEffect(() => {
    if (activeSection && tocRef.current) {
        const activeItem = tocRef.current.querySelector(`[data-id="${activeSection}"]`);
        if (activeItem) {
            // Calculate position to center the item
            const container = tocRef.current;
            const itemTop = (activeItem as HTMLElement).offsetTop;
            const itemHeight = (activeItem as HTMLElement).offsetHeight;
            const containerHeight = container.clientHeight;
            
            // simple smooth scroll
            container.scrollTo({
                top: itemTop - containerHeight / 2 + itemHeight / 2,
                behavior: 'smooth'
            });
        }
    }
  }, [activeSection]);

  const handleSave = () => {
    onSave({
      ...post,
      updatedAt: Date.now()
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      if (isEditingContent || isEditingTitle) {
          setIsEditingContent(false);
          setIsEditingTitle(false);
      } else {
          onBack();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post, isEditingContent, isEditingTitle]);

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 50);
  };

  const handleContentClick = () => {
    if (!isEditingContent) {
        setIsEditingContent(true);
        setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = await onUploadImage(e.target.files[0]);
      insertImageMarkdown(url);
    }
  };

  const insertImageMarkdown = (url: string) => {
      const textarea = textareaRef.current;
      const textToInsert = `\n![Image](${url})\n`;
      
      if (textarea && isEditingContent) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = post.content;
        const newContent = text.substring(0, start) + textToInsert + text.substring(end);
        setPost(prev => ({ ...prev, content: newContent }));
      } else {
          setPost(prev => ({ ...prev, content: prev.content + textToInsert }));
      }
      setShowImageSelector(false);
  };

  const addNewCategory = () => {
    if (newCatName.trim()) {
      const cat = onAddCategory(newCatName.trim());
      setPost(prev => ({ ...prev, categoryId: cat.id }));
      setNewCatName('');
    }
  };

  const adjustFontSize = (delta: number) => {
    if (isEditingContent) {
        const newSize = Math.min(Math.max(editorFontSize + delta, 50), 200);
        onFontSizeChange('editor', newSize);
    } else {
        const newSize = Math.min(Math.max(previewFontSize + delta, 50), 200);
        onFontSizeChange('preview', newSize);
    }
  };

  const scrollToHeader = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Using the new custom animation classes defined in index.html
  const animationClass = slideDirection === 'left' 
    ? 'animate-slide-left' 
    : slideDirection === 'right' 
        ? 'animate-slide-right' 
        : 'animate-slide-up';

  const currentFontSize = isEditingContent ? editorFontSize : previewFontSize;

  return (
    // ROOT Container: No animations/transforms here to ensure fixed children stay fixed relative to viewport
    <div className="relative flex justify-center min-h-screen no-scrollbar pb-20">
      
      {/* Table of Contents - Sticky Left - Vertically Centered */}
      {!isEditingContent && toc.length > 0 && (
          <div className="hidden xl:block fixed left-[5%] top-1/2 -translate-y-1/2 w-64 z-20 animate-fade-in">
              <div className="bg-dark-900/80 backdrop-blur-md border border-dark-600 p-5 shadow-2xl rounded-sm">
                  <div className="flex items-center gap-2 mb-4 text-primary-400 border-b border-dark-600 pb-2">
                      <List className="w-4 h-4" />
                      <span className="font-bold text-sm uppercase tracking-wider">目录</span>
                  </div>
                  <ul ref={tocRef} className="space-y-1 text-sm max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 scroll-smooth">
                      {toc.map((item, index) => (
                          <li key={index} style={{ paddingLeft: `${(item.level - 1) * 12}px` }} data-id={item.id}>
                              <button 
                                onClick={() => scrollToHeader(item.id)}
                                className={`text-left w-full truncate leading-tight py-1 transition-all border-l-2 pl-3 ${
                                    activeSection === item.id 
                                    ? 'border-primary-500 text-primary-400 font-bold bg-white/5' 
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
                                }`}
                              >
                                  {item.text}
                              </button>
                          </li>
                      ))}
                  </ul>
              </div>
          </div>
      )}

      {/* Main Content Card Wrapper - Applies Animation Here */}
      <div key={post.id} className={`w-full flex justify-center items-start pt-12 ${isAnimating ? animationClass : ''}`}>
        {/* Changed min-h-screen to min-h-[85vh] and added h-fit to prevent huge empty areas */}
        <div className="w-full max-w-5xl bg-dark-800 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] border-x border-dark-700 min-h-[85vh] h-fit mb-12">
            <div className="px-8 py-12">
                {/* Top Controls */}
                <div className="flex justify-between items-center mb-10 text-gray-400">
                    <button onClick={onBack} className="flex items-center gap-2 hover:text-primary-400 transition-colors uppercase tracking-widest text-xs font-bold">
                    <ArrowLeft className="w-4 h-4" /> 返回列表 (ESC)
                    </button>
                    <div className="flex items-center gap-6 text-xs font-mono text-gray-500">
                    <span className="flex items-center gap-2" title="发布时间">
                        <Calendar className="w-3 h-3" /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2" title="最后修改">
                        <Clock className="w-3 h-3" /> {new Date(post.updatedAt).toLocaleDateString()}
                    </span>
                    </div>
                </div>

                {/* Title Area */}
                <div className="mb-8">
                    {isEditingTitle ? (
                    <input
                        ref={titleInputRef}
                        type="text"
                        value={post.title}
                        onChange={(e) => setPost({ ...post, title: e.target.value })}
                        onBlur={() => setIsEditingTitle(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                        className="w-full text-5xl font-serif font-bold text-white border-b-2 border-primary-500 focus:border-primary-400 outline-none py-2 bg-transparent"
                    />
                    ) : (
                    <h1 
                        onClick={handleTitleClick}
                        className="text-5xl font-serif font-bold text-gray-100 cursor-text hover:text-primary-500 transition-colors py-2"
                    >
                        {post.title}
                    </h1>
                    )}
                </div>

                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-12 pb-6 border-b border-dark-600">
                    <div className="relative group z-20">
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-dark-900 border border-dark-600 px-4 py-2 hover:border-primary-500 hover:text-primary-400 transition-colors cursor-pointer">
                        <Folder className="w-4 h-4" />
                        <span>{categories.find(c => c.id === post.categoryId)?.name || '未分类'}</span>
                    </div>
                    
                    {/* Category Dropdown */}
                    <div className="absolute top-full left-0 mt-0 w-56 bg-dark-800 shadow-xl border border-dark-600 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                        {categories.map(cat => (
                            <button
                            key={cat.id}
                            onClick={() => setPost({ ...post, categoryId: cat.id })}
                            className={`w-full text-left px-3 py-2 text-sm ${post.categoryId === cat.id ? 'bg-primary-900/30 text-primary-400' : 'text-gray-400 hover:bg-dark-700'}`}
                            >
                            {cat.name}
                            </button>
                        ))}
                        </div>
                        <div className="border-t border-dark-600 mt-2 pt-2 flex gap-1">
                            <input 
                                className="flex-1 text-xs px-2 py-1 bg-dark-900 rounded-none border border-dark-600 text-gray-300 focus:border-primary-500 outline-none" 
                                placeholder="新分类..."
                                value={newCatName}
                                onChange={e => setNewCatName(e.target.value)}
                            />
                            <button onClick={addNewCategory} className="text-xs bg-primary-600 text-white px-3 hover:bg-primary-500">+</button>
                        </div>
                    </div>
                    </div>

                    {/* Font Resize Widget - Button Based */}
                    <div className="flex items-center gap-0 bg-dark-900 border border-dark-600">
                        <button 
                            onClick={() => adjustFontSize(-5)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                            title="Decrease Font Size"
                        >
                            <Minus className="w-3 h-3" />
                        </button>
                        <div className="flex items-center gap-2 px-2 select-none min-w-[60px] justify-center border-x border-dark-600/50">
                            <Type className="w-3 h-3 text-primary-500" />
                            <span className="text-xs font-mono text-gray-300">{currentFontSize}%</span>
                        </div>
                        <button 
                            onClick={() => adjustFontSize(5)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-colors"
                            title="Increase Font Size"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>

                    {isEditingContent && (
                        <div className="ml-auto flex items-center gap-2">
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <Button variant="secondary" onClick={() => setShowImageSelector(true)} icon={<ImageIcon className="w-4 h-4" />}>
                                选择图片
                            </Button>
                            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={<ImageIcon className="w-4 h-4" />}>
                                上传图片
                            </Button>
                            <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>
                                保存修改
                            </Button>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div 
                    className="prose prose-invert prose-lg max-w-none min-h-[500px]"
                    onDoubleClick={handleContentClick}
                    style={{ fontSize: `${currentFontSize}%` }}
                >
                    {isEditingContent ? (
                    <textarea
                        ref={textareaRef}
                        value={post.content}
                        onChange={(e) => setPost({ ...post, content: e.target.value })}
                        // Removed 'text-base' to allow style prop to control font size
                        // Added inherit to force it to take parent style
                        className="w-full h-[70vh] p-4 text-gray-200 font-mono bg-dark-900 border border-dark-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-none"
                        style={{ fontSize: 'inherit' }}
                        placeholder={labels.editPlaceholder}
                    />
                    ) : (
                    <div className="markdown-body">
                        <ReactMarkdown 
                            components={{
                                img: ({node, ...props}) => <img {...props} className="shadow-lg my-6 max-w-full mx-auto border border-dark-600 bg-dark-900 p-1" />,
                                h1: ({node, ...props}) => {
                                    // Generate ID for TOC
                                    const text = String(props.children);
                                    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                                    return <h1 id={id} {...props} className="text-3xl font-serif font-bold text-gray-100 mt-8 mb-4 border-b border-dark-600 pb-2 scroll-mt-20" />;
                                },
                                h2: ({node, ...props}) => {
                                    const text = String(props.children);
                                    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                                    return <h2 id={id} {...props} className="text-2xl font-serif font-bold text-gray-200 mt-6 mb-3 scroll-mt-20" />;
                                },
                                h3: ({node, ...props}) => {
                                    const text = String(props.children);
                                    const id = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-');
                                    return <h3 id={id} {...props} className="text-xl font-serif font-bold text-gray-200 mt-5 mb-2 scroll-mt-20" />;
                                },
                                p: ({node, ...props}) => <p {...props} className="text-gray-300 leading-relaxed mb-4" />,
                                strong: ({node, ...props}) => <strong {...props} className="text-primary-400 font-bold" />,
                                a: ({node, ...props}) => <a {...props} className="text-primary-400 underline decoration-primary-700 hover:decoration-primary-400 transition-all" />,
                                blockquote: ({node, ...props}) => <blockquote {...props} className="border-l-4 border-primary-600 pl-4 italic text-gray-400 bg-dark-900 py-2 pr-2 my-4" />,
                                code: ({node, ...props}) => <code {...props} className="bg-dark-900 text-primary-300 px-1 py-0.5 rounded text-sm font-mono border border-dark-700" />,
                                pre: ({node, ...props}) => <pre {...props} className="bg-dark-900 p-4 overflow-x-auto border border-dark-700 my-4" />,
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                        {post.content.trim() === '' && (
                            <div className="text-gray-600 italic text-center mt-20 cursor-pointer" onClick={handleContentClick}>
                                {labels.clickToEdit}
                            </div>
                        )}
                    </div>
                    )}
                </div>

                {showImageSelector && (
                    <ImageSelector 
                        images={images} 
                        onSelect={insertImageMarkdown} 
                        onClose={() => setShowImageSelector(false)} 
                    />
                )}
            </div>
        </div>
      </div>
    </div>
  );
};