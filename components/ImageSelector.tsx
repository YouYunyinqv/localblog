import React from 'react';
import { StoredImage } from '../types';
import { X, Image as ImageIcon } from 'lucide-react';

interface ImageSelectorProps {
  images: StoredImage[];
  onSelect: (url: string) => void;
  onClose: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ images, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
       <div className="w-full max-w-4xl bg-dark-800 border border-dark-600 shadow-2xl flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-dark-600 bg-dark-900">
             <h3 className="text-lg font-serif text-white">选择图片插入</h3>
             <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map(img => (
                    <div 
                        key={img.id} 
                        onClick={() => onSelect(img.dataUrl)}
                        className="group relative aspect-square bg-dark-900 border border-dark-700 cursor-pointer hover:border-primary-500 transition-all"
                    >
                        <img src={img.dataUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
                {images.length === 0 && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        暂无图片，请先在资源管理器上传。
                    </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};
