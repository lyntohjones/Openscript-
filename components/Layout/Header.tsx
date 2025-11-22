
import React from 'react';
import { ArrowLeft, Undo2, Redo2, Share2, Save, MoreHorizontal, Bell } from 'lucide-react';

interface HeaderProps {
  projectName: string;
  onNameChange: (name: string) => void;
  lastSaved: Date;
}

const Header: React.FC<HeaderProps> = ({ projectName, onNameChange, lastSaved }) => {
  return (
    <header className="h-14 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-4 z-50">
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-surface rounded-lg text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        
        <div className="flex flex-col">
          <input
            value={projectName}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-transparent text-sm font-semibold text-white focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 -ml-1 w-64 hover:bg-white/5 transition-colors"
          />
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
             <Save size={10} />
             Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface rounded-lg p-1 mr-4 border border-white/5">
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Undo">
            <Undo2 size={16} />
          </button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded" title="Redo">
            <Redo2 size={16} />
          </button>
        </div>

        <div className="flex items-center -space-x-2 mr-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-background flex items-center justify-center text-xs font-bold">JD</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-background flex items-center justify-center text-xs font-bold">AI</div>
          <button className="w-8 h-8 rounded-full bg-surface border-2 border-background flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 text-xs">
            +2
          </button>
        </div>

        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 transition-colors shadow-lg shadow-primary/20">
          <Share2 size={14} />
          Share
        </button>
        
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-2 text-gray-400 hover:text-white transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </div>
    </header>
  );
};

export default Header;
