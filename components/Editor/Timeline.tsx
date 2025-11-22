
import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, ZoomIn, ZoomOut, SkipBack, SkipForward, MousePointer2, Move, Scissors } from 'lucide-react';
import { Word } from '../../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  words: Word[];
}

const Timeline: React.FC<TimelineProps> = ({ duration, currentTime, onSeek, isPlaying, onTogglePlay, words }) => {
  const [zoom, setZoom] = useState(1); // Pixels per second
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const pixelsPerSecond = 20 * zoom;
  const totalWidth = duration * pixelsPerSecond;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const time = Math.max(0, Math.min(x / pixelsPerSecond, duration));
    onSeek(time);
    setDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + containerRef.current.scrollLeft;
      const time = Math.max(0, Math.min(x / pixelsPerSecond, duration));
      onSeek(time);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Auto-scroll to playhead
  useEffect(() => {
      if (isPlaying && containerRef.current) {
          const playheadPos = currentTime * pixelsPerSecond;
          const containerCenter = containerRef.current.clientWidth / 2;
          if (playheadPos > containerCenter) {
              containerRef.current.scrollLeft = playheadPos - containerCenter;
          }
      }
  }, [currentTime, isPlaying, pixelsPerSecond]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a] border-t border-white/5">
      {/* Toolbar */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-2">
            <button onClick={onTogglePlay} className="p-1.5 hover:bg-white/10 rounded text-white transition-colors">
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
            </button>
            <span className="text-xs font-mono text-indigo-300 w-16 text-center">{formatTime(currentTime)}</span>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Select Tool"><MousePointer2 size={14}/></button>
            <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Hand Tool"><Move size={14}/></button>
            <button className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors" title="Blade Tool"><Scissors size={14}/></button>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.5))} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><ZoomOut size={14}/></button>
            <input 
                type="range" min="0.5" max="5" step="0.1" 
                value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-20 accent-indigo-500 h-1 bg-gray-700 rounded-full appearance-none"
            />
            <button onClick={() => setZoom(Math.min(5, zoom + 0.5))} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white"><ZoomIn size={14}/></button>
        </div>
      </div>

      {/* Timeline Tracks Area */}
      <div 
        className="flex-grow overflow-x-auto overflow-y-hidden custom-scrollbar relative select-none"
        ref={containerRef}
        onMouseDown={(e) => { if(e.target === containerRef.current) handleMouseDown(e) }} // Click on empty space seeks
      >
         <div style={{ width: `${Math.max(totalWidth, 100)}px`, minWidth: '100%' }} className="h-full relative">
             
             {/* Time Ruler */}
             <div className="h-6 border-b border-white/5 flex items-end bg-[#0b0f19] sticky top-0 z-10">
                 {Array.from({ length: Math.ceil(duration) }).map((_, i) => (
                     <div key={i} className="absolute bottom-0 h-3 border-l border-gray-700 text-[9px] text-gray-500 pl-1" style={{ left: `${i * pixelsPerSecond}px` }}>
                         {i % 5 === 0 ? formatTime(i) : ''}
                     </div>
                 ))}
             </div>

             {/* Playhead Cursor */}
             <div 
                className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                style={{ left: `${currentTime * pixelsPerSecond}px` }}
             >
                 <div className="absolute -top-0 -left-[5px] w-[11px] h-[11px] bg-red-500 rounded-b-md transform rotate-45"></div>
             </div>

             {/* Tracks Container */}
             <div className="p-2 space-y-2" onMouseDown={handleMouseDown}>
                 
                 {/* Script Track */}
                 <div className="h-16 bg-indigo-900/20 border border-indigo-500/30 rounded-lg relative overflow-hidden group">
                    <div className="absolute top-1 left-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider z-10">Script</div>
                    <div className="absolute inset-0 flex items-center">
                        {words.map((word) => (
                            <div 
                                key={word.id}
                                className={`absolute h-8 top-1/2 -translate-y-1/2 text-[10px] truncate px-1 border-l border-white/5 transition-opacity ${word.isDeleted ? 'opacity-30 line-through bg-red-900/20' : 'text-indigo-200'}`}
                                style={{ 
                                    left: `${word.start * pixelsPerSecond}px`, 
                                    width: `${(word.end - word.start) * pixelsPerSecond}px` 
                                }}
                            >
                                {word.text}
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Audio / Waveform Track Mockup */}
                 <div className="h-12 bg-green-900/20 border border-green-500/30 rounded-lg relative overflow-hidden">
                    <div className="absolute top-1 left-2 text-[10px] font-bold text-green-400 uppercase tracking-wider">Audio 1</div>
                    {/* Simple visual waveform pattern */}
                    <div className="absolute inset-0 flex items-center opacity-50" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #4ade80 2px, #4ade80 3px)', backgroundSize: '4px 100%' }}></div>
                 </div>

                 {/* Video Track Mockup */}
                 <div className="h-12 bg-purple-900/20 border border-purple-500/30 rounded-lg relative overflow-hidden">
                    <div className="absolute top-1 left-2 text-[10px] font-bold text-purple-400 uppercase tracking-wider">Video 1</div>
                    <div className="absolute inset-0 flex items-center gap-px opacity-40">
                         {Array.from({ length: Math.ceil(totalWidth / 60) }).map((_, i) => (
                             <div key={i} className="h-full w-16 bg-purple-500/20 border-r border-white/5"></div>
                         ))}
                    </div>
                 </div>

             </div>
         </div>
      </div>
    </div>
  );
};

export default Timeline;
