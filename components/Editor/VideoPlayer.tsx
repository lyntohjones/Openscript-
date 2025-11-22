
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Word } from '../../types';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize2, Settings2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  audioSrc?: string; // Narration track
  words: Word[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  src, 
  audioSrc,
  words, 
  currentTime, 
  onTimeUpdate,
  isPlaying,
  onTogglePlay
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const [isMuted, setIsMuted] = useState(false);
  const [localTime, setLocalTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(false);

  const isImage = src.startsWith('data:image') || src.match(/\.(jpeg|jpg|gif|png)$/) != null;

  useEffect(() => {
    const media = videoRef.current;
    const audio = audioRef.current;
    
    if (isPlaying) {
        media?.play().catch(e => console.log("Video play error", e));
        audio?.play().catch(e => console.log("Audio play error", e));
    } else {
        media?.pause();
        audio?.pause();
    }
  }, [isPlaying, src, audioSrc]);

  useEffect(() => {
    const media = videoRef.current;
    const audio = audioRef.current;
    
    // Sync check to prevent drift
    if (media && Math.abs(media.currentTime - currentTime) > 0.2) {
      media.currentTime = currentTime;
    }
    if (audio && Math.abs(audio.currentTime - currentTime) > 0.2) {
      audio.currentTime = currentTime;
    }
    setLocalTime(currentTime);
  }, [currentTime]);

  useEffect(() => {
      if(videoRef.current) videoRef.current.playbackRate = playbackRate;
      if(audioRef.current) audioRef.current.playbackRate = playbackRate;
  }, [playbackRate]);

  const checkTime = useCallback(() => {
    // If we have a video/audio element, use its time. If it's just an image, we simulate time?
    // For this demo, if it's an image, we rely on the audio track if present, or a manual timer?
    // To keep it simple, if it's an image, we require an audio track or we just use the 'currentTime' from App state driven by a timer?
    // ACTUALLY: best to let the 'video' element drive time if present, or 'audio' if present.
    
    let now = 0;
    if (videoRef.current && !isImage) {
        now = videoRef.current.currentTime;
    } else if (audioRef.current) {
        now = audioRef.current.currentTime;
    }

    setLocalTime(now);
    onTimeUpdate(now);

    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(checkTime);
    }
  }, [isPlaying, onTimeUpdate, isImage]);

  useEffect(() => {
    if (isPlaying) animationFrameRef.current = requestAnimationFrame(checkTime);
    return () => { if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current); };
  }, [isPlaying, checkTime]);

  const toggleFullscreen = () => {
      if (!document.fullscreenElement) {
          containerRef.current?.requestFullscreen();
      } else {
          document.exitFullscreen();
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      setLocalTime(time);
      onTimeUpdate(time);
      if(videoRef.current && !isImage) videoRef.current.currentTime = time;
      if(audioRef.current) audioRef.current.currentTime = time;
  };

  const duration = videoRef.current?.duration || audioRef.current?.duration || 60;

  return (
    <div 
        ref={containerRef}
        className="flex flex-col h-full bg-black rounded-lg overflow-hidden relative group border border-border/30 shadow-2xl"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
    >
      {/* Hidden Voiceover Track */}
      {audioSrc && <audio ref={audioRef} src={audioSrc} />}

      {/* Main Video Stage */}
      <div className="relative flex-grow bg-black flex items-center justify-center overflow-hidden">
        {isImage ? (
            <img src={src} className="w-full h-full object-contain animate-in fade-in duration-700" />
        ) : (
            <video
                ref={videoRef}
                src={src}
                className="max-h-full max-w-full object-contain"
                onEnded={() => isPlaying && onTogglePlay()}
                playsInline
                onClick={onTogglePlay}
                muted={!!audioSrc} // Mute B-roll if we have a Voiceover track
            />
        )}
        
        {/* Center Play Button Overlay */}
        {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] transition-opacity pointer-events-none">
                <div className="bg-white/10 p-6 rounded-full backdrop-blur-md border border-white/20 shadow-2xl">
                    <Play size={48} fill="white" className="text-white ml-2" />
                </div>
            </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className={`bg-gradient-to-t from-black/90 to-transparent px-4 pb-4 pt-12 absolute bottom-0 left-0 right-0 transition-transform duration-300 ${showControls || !isPlaying ? 'translate-y-0' : 'translate-y-full'}`}>
         
         {/* Timeline Scrubber */}
         <div className="mb-4 relative group/scrubber">
             <input 
                type="range" 
                min="0" 
                max={!isNaN(duration) ? duration : 60} 
                value={localTime} 
                onChange={handleSeek}
                className="w-full h-1.5 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary hover:h-2 transition-all z-20 relative"
             />
         </div>

         <div className="flex items-center justify-between">
             <div className="flex items-center gap-4 text-white">
                <button onClick={onTogglePlay} className="hover:text-primary transition-colors">
                    {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                
                <div className="flex items-center gap-2 text-gray-300">
                    <button onClick={() => {
                        if(videoRef.current) videoRef.current.currentTime -= 5;
                        if(audioRef.current) audioRef.current.currentTime -= 5;
                    }} className="hover:text-white"><SkipBack size={20}/></button>
                    <button onClick={() => {
                        if(videoRef.current) videoRef.current.currentTime += 5;
                        if(audioRef.current) audioRef.current.currentTime += 5;
                    }} className="hover:text-white"><SkipForward size={20}/></button>
                </div>

                <div className="text-xs font-mono text-gray-300 ml-2">
                    <span className="text-white font-medium">{formatTime(localTime)}</span>
                    <span className="mx-1 text-gray-500">/</span>
                    <span>{formatTime(duration)}</span>
                </div>
             </div>

             <div className="flex items-center gap-4 text-gray-300">
                 {/* Speed Control */}
                 <div className="relative group/speed">
                     <button className="text-xs font-bold border border-white/20 rounded px-2 py-1 hover:bg-white/10">{playbackRate}x</button>
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-surface border border-border rounded-lg p-1 hidden group-hover/speed:flex flex-col gap-1 shadow-xl">
                        {[0.5, 1, 1.5, 2].map(rate => (
                            <button 
                                key={rate} 
                                onClick={() => setPlaybackRate(rate)}
                                className={`px-3 py-1 text-xs rounded hover:bg-white/10 ${playbackRate === rate ? 'text-primary' : 'text-white'}`}
                            >
                                {rate}x
                            </button>
                        ))}
                     </div>
                 </div>

                 <button onClick={() => setIsMuted(!isMuted)} className="hover:text-white">
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                 </button>
                 <button onClick={toggleFullscreen} className="hover:text-white">
                    <Maximize2 size={20} />
                 </button>
             </div>
         </div>
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default VideoPlayer;
