
import React from 'react';
import { 
  FolderOpen, 
  Scissors, 
  Sparkles, 
  Mic2, 
  Library as LibraryIcon, 
  Music, 
  Download, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  LayoutTemplate
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemClick: (item: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemClick, collapsed, onToggleCollapse }) => {
  const items = [
    { id: 'projects', icon: FolderOpen, label: 'Projects' },
    { id: 'editor', icon: Scissors, label: 'Editor' },
    { id: 'templates', icon: LayoutTemplate, label: 'Templates' },
    { id: 'underlord', icon: Sparkles, label: 'Lord Genie AI' },
    { id: 'voice', icon: Mic2, label: 'Voice Clone' },
    { id: 'library', icon: LibraryIcon, label: 'Stock Library' },
    { id: 'audio', icon: Music, label: 'Audio Effects' },
    { id: 'export', icon: Download, label: 'Export' },
  ];

  return (
    <div 
      className={`
        h-full bg-[#0b0f19] border-r border-white/5 flex flex-col py-6 transition-all duration-300 relative z-40 shadow-xl
        ${collapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Logo Area */}
      <div className={`px-6 mb-10 flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/10">
          <span className="font-bold text-white text-xl">Os</span>
        </div>
        {!collapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
                <span className="font-bold text-lg tracking-tight text-white">OpenScript</span>
                <span className="text-[10px] text-indigo-300 uppercase tracking-widest font-medium">Pro Editor</span>
            </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-grow space-y-1 px-3">
        {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            return (
                <button
                    key={item.id}
                    onClick={() => onItemClick(item.id)}
                    className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                        ${isActive 
                            ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/10 text-white border border-white/5 shadow-inner' 
                            : 'text-gray-400 hover:text-white hover:bg-white/5'}
                    `}
                >
                    <Icon 
                        size={20} 
                        className={`transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-500 group-hover:text-indigo-300'}`} 
                        strokeWidth={isActive ? 2.5 : 2}
                    />
                    
                    {!collapsed && (
                        <span className="flex-grow text-left">{item.label}</span>
                    )}
                    
                    {isActive && !collapsed && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]"></div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {collapsed && (
                        <div className="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-white/10 shadow-xl z-50 transition-opacity duration-200">
                            {item.label}
                        </div>
                    )}
                </button>
            )
        })}
      </div>

      {/* Bottom Actions */}
      <div className="px-3 mt-auto space-y-2">
        <button 
            onClick={() => onItemClick('settings')}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors
                ${collapsed ? 'justify-center' : ''}
            `}
        >
            <Settings size={20} />
            {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={onToggleCollapse}
        className="absolute -right-3 top-12 bg-[#1e293b] border border-white/10 rounded-full p-1.5 text-gray-400 hover:text-white shadow-lg hover:scale-110 transition-all"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </div>
  );
};

export default Sidebar;
