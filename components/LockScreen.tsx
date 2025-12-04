import React, { useState, useEffect } from 'react';
import { StoredImage } from '../types';

interface LockScreenProps {
  backgroundImage?: string;
  customText: string;
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ backgroundImage, customText, onUnlock }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = () => onUnlock();
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUnlock]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center text-center cursor-default bg-black select-none"
      onClick={onUnlock}
    >
        {backgroundImage && (
            <>
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />
            </>
        )}

        <div className="relative z-10 animate-in zoom-in-95 duration-1000 fade-in">
            <h1 className="text-8xl md:text-9xl font-serif font-bold text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] mb-4">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <p className="text-xl md:text-2xl text-primary-200 font-light tracking-widest uppercase opacity-80 mb-12">
                {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="inline-block border-t border-b border-white/20 py-4 px-12 backdrop-blur-sm bg-white/5">
                <p className="text-sm md:text-base text-gray-300 font-mono tracking-[0.2em] animate-pulse">
                    {customText}
                </p>
            </div>
        </div>
    </div>
  );
};
