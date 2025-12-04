import React, { useState } from 'react';
import { CustomLabels } from '../types';
import { X, Save } from 'lucide-react';
import { Button } from './Button';

interface SettingsModalProps {
  labels: CustomLabels;
  onSave: (labels: CustomLabels) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ labels, onSave, onClose }) => {
  const [formData, setFormData] = useState<CustomLabels>(labels);

  const handleChange = (key: keyof CustomLabels, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-dark-800 border border-dark-600 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-dark-600 bg-dark-900/50">
          <h2 className="text-xl font-serif font-bold text-gray-100">自定义界面文字</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-primary-400 font-bold block">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input 
                  type="text" 
                  value={value}
                  onChange={(e) => handleChange(key as keyof CustomLabels, e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 p-2 text-gray-200 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-dark-600 bg-dark-900/50 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button onClick={handleSave} icon={<Save className="w-4 h-4" />}>保存配置</Button>
        </div>
      </div>
    </div>
  );
};
