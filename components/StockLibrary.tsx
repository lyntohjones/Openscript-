
import React, { useState, useMemo } from 'react';
import { Search, Image as ImageIcon, Film, Plus, X, Download } from 'lucide-react';
import { StockItem } from '../types';
import { MOCK_STOCK_MEDIA } from '../constants';

interface StockLibraryProps {
  onAddMedia: (item: StockItem) => void;
  isOpen: boolean;
  onClose: () => void;
}

const StockLibrary: React.FC<StockLibraryProps> = ({ onAddMedia, isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'image'>('all');

  const filteredMedia = useMemo(() => {
    return MOCK_STOCK_MEDIA.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = activeTab === 'all' || item.type === activeTab;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8 animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-5xl h-[80vh] rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-black/20">
            <div className="flex items-center gap-6">
                <h2 className="text-lg font-semibold text-white">Stock Library</h2>
                <div className="flex bg-black/40 rounded-lg p-1 border border-white/5">
                    <TabButton label="All Assets" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                    <TabButton label="Videos" active={activeTab === 'video'} onClick={() => setActiveTab('video')} />
                    <TabButton label="Images" active={activeTab === 'image'} onClick={() => setActiveTab('image')} />
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={24} />
            </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b border-border bg-black/10 flex justify-between items-center">
            <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search high-quality assets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-600"
                />
            </div>
            <span className="text-xs text-gray-500">Powered by Pexels & Unsplash (Royalty Free)</span>
        </div>

        {/* Grid */}
        <div className="flex-grow overflow-y-auto p-6 custom-scrollbar bg-black/20">
            <div className="grid grid-cols-4 gap-6">
                {filteredMedia.map(item => (
                    <div key={item.id} className="group relative aspect-video bg-black rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer">
                        <img src={item.thumbnail} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                            <h3 className="font-bold text-white text-sm">{item.title}</h3>
                            <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-gray-300 uppercase tracking-wider">{item.source}</span>
                                {item.type === 'video' && <span className="text-[10px] bg-white/20 px-1.5 rounded text-white">{item.duration}</span>}
                            </div>
                        </div>

                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => { onAddMedia(item); onClose(); }}
                                className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold transform translate-y-2 group-hover:translate-y-0 transition-transform"
                            >
                                <Plus size={16} /> Add
                            </button>
                        </div>

                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur rounded px-2 py-1 text-[10px] text-white flex items-center gap-1 border border-white/10">
                            {item.type === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                            <span className="uppercase">{item.type}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ label, active, onClick }: any) => (
    <button 
        onClick={onClick}
        className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors ${active ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
    >
        {label}
    </button>
)

export default StockLibrary;
