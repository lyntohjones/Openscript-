
import React, { useMemo } from 'react';
import { Word, SpeakerBlock } from '../../types';
import clsx from 'clsx';
import { UserCircle2, Clock } from 'lucide-react';

interface TranscriptEditorProps {
  words: Word[];
  currentTime: number;
  onWordClick: (startTime: number) => void;
  onWordsChange: (newWords: Word[]) => void;
}

const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  words,
  currentTime,
  onWordClick,
  onWordsChange
}) => {

  const blocks = useMemo(() => {
    const b: SpeakerBlock[] = [];
    if (words.length === 0) return b;

    let currentBlock: SpeakerBlock = {
      id: 'block-0',
      speaker: words[0].speaker,
      words: [words[0]],
      startTime: words[0].start
    };

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      if (word.speaker !== currentBlock.speaker || (word.start - words[i-1].end > 2.0)) {
        b.push(currentBlock);
        currentBlock = {
          id: `block-${i}`,
          speaker: word.speaker,
          words: [word],
          startTime: word.start
        };
      } else {
        currentBlock.words.push(word);
      }
    }
    b.push(currentBlock);
    return b;
  }, [words]);

  const handleWordClick = (targetWordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const index = words.findIndex(w => w.id === targetWordId);
    if (index === -1) return;

    if (e.metaKey || e.ctrlKey) {
      const newWords = [...words];
      newWords[index].isDeleted = !newWords[index].isDeleted;
      onWordsChange(newWords);
    } else {
      onWordClick(words[index].start);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f172a] custom-scrollbar px-4">
      <div className="max-w-3xl mx-auto py-12 min-h-screen">
        
        <div className="space-y-8">
          {blocks.map((block, bIdx) => (
            <div key={block.id} className="group flex gap-4 relative animate-in fade-in slide-in-from-bottom-2 duration-500" style={{animationDelay: `${bIdx * 50}ms`}}>
              
              {/* Speaker Gutter */}
              <div className="w-24 flex-shrink-0 flex flex-col items-end pt-1 select-none">
                 <div className="flex items-center gap-2 mb-1 group/speaker cursor-pointer">
                    <span 
                        className="text-xs font-bold uppercase tracking-wider text-indigo-400 group-hover/speaker:text-indigo-300 transition-colors"
                        style={{color: stringToColor(block.speaker)}}
                    >
                        {block.speaker}
                    </span>
                 </div>
                 <span className="text-[10px] font-mono text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {formatTime(block.startTime)}
                 </span>
              </div>

              {/* Text Content */}
              <div className="flex-grow text-lg leading-relaxed text-gray-300">
                {block.words.map((word) => {
                   const isActive = currentTime >= word.start && currentTime < word.end && !word.isDeleted;
                   
                   return (
                     <span
                       key={word.id}
                       onClick={(e) => handleWordClick(word.id, e)}
                       className={clsx(
                         "inline-block mx-[1.5px] px-[2px] rounded-sm cursor-text transition-all duration-75 border border-transparent relative",
                         isActive 
                            ? "bg-primary/20 text-white font-medium border-primary/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]" 
                            : "hover:bg-white/5 hover:text-white",
                         word.isDeleted && "line-through decoration-2 decoration-red-500 text-gray-600 opacity-50"
                       )}
                     >
                       {word.text}
                       {/* Tooltip on hover */}
                       {/* <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[10px] text-white px-2 py-1 rounded opacity-0 hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                           {word.start.toFixed(1)}s
                       </span> */}
                     </span>
                   );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-32 text-center pb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-xs text-gray-400">
                <Clock size={14} />
                <span>End of Transcript</span>
            </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// Deterministic color generator
function stringToColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + "00000".substring(0, 6 - c.length) + c;
}

export default TranscriptEditor;
