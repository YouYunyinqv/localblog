import React, { useRef } from 'react';
import { StoredImage, Post } from '../types';
import { Button } from './Button';
import { Trash2, CheckCircle, AlertCircle, ArrowLeft, Image as ImageIcon, Monitor, Upload, Lock } from 'lucide-react';

interface ImageManagerProps {
  images: StoredImage[];
  posts: Post[];
  currentBgId: string | null;
  currentLockId: string | null;
  onCleanup: () => void;
  onBack: () => void;
  onSetBackground: (id: string | null) => void;
  onSetLockScreen: (id: string | null) => void;
  onUpload: (file: File) => void;
}

export const ImageManager: React.FC<ImageManagerProps> = ({ 
    images, posts, currentBgId, currentLockId, onCleanup, onBack, onSetBackground, onSetLockScreen, onUpload 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine usage
  const getUsageStatus = (imgUrl: string) => {
    const isUsed = posts.some(p => p.content.includes(imgUrl));
    return isUsed;
  };

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          onUpload(e.target.files[0]);
      }
  };

  const usedCount = images.filter(i => getUsageStatus(i.dataUrl)).length;
  const wastedCount = images.length - usedCount;

  return (
    <div className="p-8 max-w-7xl mx-auto pl-80 min-h-screen">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-10 gap-6">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-3xl font-serif font-bold text-gray-100">素材库管理</h2>
            </div>
            <p className="text-gray-500 ml-11">管理博客中的视觉资源与背景设置。(ESC返回)</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 ml-11 xl:ml-0">
          <div className="flex gap-4 text-sm font-medium mr-4">
            <span className="flex items-center gap-1 text-green-400 bg-green-900/20 border border-green-900 px-3 py-1">
                <CheckCircle className="w-4 h-4" /> {usedCount} 使用中
            </span>
            <span className="flex items-center gap-1 text-gray-400 bg-dark-800 border border-dark-600 px-3 py-1">
                <AlertCircle className="w-4 h-4" /> {wastedCount} 未引用
            </span>
          </div>
          
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleFileChange}
          />
          <Button variant="secondary" onClick={handleUploadClick} icon={<Upload className="w-4 h-4" />}>
              上传新图片
          </Button>

          <Button 
            variant="danger" 
            onClick={onCleanup} 
            disabled={wastedCount === 0}
            icon={<Trash2 className="w-4 h-4" />}
          >
            清理未引用
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {images.map((img) => {
          const isUsed = getUsageStatus(img.dataUrl);
          const isBg = currentBgId === img.id;
          const isLock = currentLockId === img.id;

          return (
            <div 
              key={img.id} 
              className={`
                group relative aspect-square bg-dark-800 overflow-hidden border-2 transition-all duration-300
                ${isBg ? 'border-primary-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 
                  isLock ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                  isUsed ? 'border-transparent' : 'border-dark-700 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}
              `}
            >
              <img 
                src={img.dataUrl} 
                alt={img.name} 
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2 p-2">
                 <button 
                    onClick={() => onSetBackground(isBg ? null : img.id)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all
                        ${isBg ? 'bg-primary-600 border-primary-500 text-white' : 'bg-transparent border-white text-white hover:bg-white hover:text-black'}
                    `}
                 >
                    <Monitor className="w-3 h-3" />
                    {isBg ? '取消背景' : '设为背景'}
                 </button>

                 <button 
                    onClick={() => onSetLockScreen(isLock ? null : img.id)}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all
                        ${isLock ? 'bg-blue-600 border-blue-500 text-white' : 'bg-transparent border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black'}
                    `}
                 >
                    <Lock className="w-3 h-3" />
                    {isLock ? '取消锁屏' : '设为锁屏'}
                 </button>
                 
                 <div className="text-center mt-1 w-full">
                    <p className="text-gray-300 text-xs truncate">{img.name}</p>
                 </div>
              </div>

              {!isUsed && <span className="absolute top-2 right-2 bg-dark-900/80 text-gray-400 text-[10px] font-bold px-2 py-1 border border-dark-600">未使用</span>}
              {isBg && <span className="absolute top-2 left-2 bg-primary-600 text-white text-[10px] font-bold px-2 py-1 shadow-lg">背景</span>}
              {isLock && <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 shadow-lg">锁屏</span>}
            </div>
          );
        })}
        
        {images.length === 0 && (
            <div className="col-span-full py-32 text-center text-gray-600 border-2 border-dashed border-dark-700 bg-dark-800/30">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">暂无图片</p>
                <p className="text-sm opacity-50">上传一张图片开始使用</p>
            </div>
        )}
      </div>
    </div>
  );
};
