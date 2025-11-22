
import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import VideoPlayer from './components/Editor/VideoPlayer';
import TranscriptEditor from './components/Editor/TranscriptEditor';
import AudioEffectsPanel from './components/Editor/AudioEffectsPanel';
import Underlord from './components/Underlord';
import StockLibrary from './components/StockLibrary';
import VoiceCloner from './components/VoiceCloner';
import { Project, Word, StockItem, MediaAttachment, AudioEffectsConfig } from './types';
import { DEMO_PROJECT } from './constants';
import { Layers } from 'lucide-react';

const App: React.FC = () => {
  // Data State
  const [project, setProject] = useState<Project>({
      ...DEMO_PROJECT,
      audioEffects: {
          compressor: { enabled: false, threshold: -20, ratio: 4 },
          eq: { enabled: false, low: 0, mid: 0, high: 0 },
          reverb: { enabled: false, mix: 0.3, decay: 1.5 }
      }
  });

  // Playback State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('editor');
  const [isUnderlordOpen, setIsUnderlordOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isVoiceCloneOpen, setIsVoiceCloneOpen] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);

  // Handlers
  const handleWordsChange = (newWords: Word[]) => {
    setProject(prev => ({ ...prev, transcript: { ...prev.transcript, words: newWords }, lastModified: new Date() }));
  };

  const handleAddMedia = (item: StockItem) => {
      const newAsset: MediaAttachment = {
          type: item.type, url: item.url, mimeType: item.type === 'video' ? 'video/mp4' : (item.type === 'audio' ? 'audio/mpeg' : 'image/jpeg'), title: item.title
      };
      
      setProject(prev => {
          let updates: Partial<Project> = {
              assets: [...prev.assets, newAsset]
          };

          // Smart Assignment:
          // If Audio -> Set as Voiceover (Documentary style)
          // If Video/Image -> Set as Main Media
          if (item.type === 'audio') {
              updates.voiceoverUrl = item.url;
          } else {
              updates.mediaUrl = item.url;
          }

          return { ...prev, ...updates };
      });

      // Auto-play only if it's a visual change to show preview, but respect user context
      if (item.type !== 'audio') {
          setCurrentTime(0); 
          setIsPlaying(true); 
      }
  };

  const handleSidebarClick = (id: string) => {
      setActiveSidebarItem(id);
      if (id === 'underlord') setIsUnderlordOpen(true);
      if (id === 'library') setIsLibraryOpen(true);
      if (id === 'voice') setIsVoiceCloneOpen(true);
  };

  // Keyboard Shortcuts
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' && (e.target === document.body)) {
              e.preventDefault();
              setIsPlaying(p => !p);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <HashRouter>
      <div className="h-screen w-screen bg-background flex flex-col text-white overflow-hidden font-sans">
        
        {/* Top Header */}
        <Header 
            projectName={project.name} 
            onNameChange={(n) => setProject(p => ({...p, name: n}))} 
            lastSaved={project.lastModified}
        />

        {/* Main Workspace */}
        <div className="flex-grow flex overflow-hidden">
            
            {/* 1. Navigation Sidebar */}
            <Sidebar 
                activeItem={activeSidebarItem} 
                onItemClick={handleSidebarClick} 
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* 2. Center: Transcript Editor */}
            <div className="flex-grow relative bg-[#0f172a] flex flex-col min-w-0">
                <TranscriptEditor 
                    words={project.transcript.words}
                    currentTime={currentTime}
                    onWordClick={setCurrentTime}
                    onWordsChange={handleWordsChange}
                />
            </div>

            {/* 3. Right Panel (Resizable ideally, fixed for now) */}
            <div style={{ width: rightPanelWidth }} className="bg-[#0b0f19] border-l border-border flex flex-col z-10 relative transition-all">
                 
                 {/* Top: Video Preview */}
                 <div className="h-[35%] min-h-[250px] border-b border-border p-4 flex flex-col">
                     <VideoPlayer 
                        src={project.mediaUrl}
                        audioSrc={project.voiceoverUrl}
                        words={project.transcript.words}
                        currentTime={currentTime}
                        onTimeUpdate={setCurrentTime}
                        isPlaying={isPlaying}
                        onTogglePlay={() => setIsPlaying(!isPlaying)}
                     />
                 </div>

                 {/* Bottom: Properties / Effects / Context */}
                 <div className="flex-grow overflow-hidden flex flex-col">
                     {activeSidebarItem === 'audio' ? (
                         <AudioEffectsPanel 
                            config={project.audioEffects!}
                            onChange={(c) => setProject(p => ({...p, audioEffects: c}))}
                         />
                     ) : (
                         <div className="p-6 text-center text-gray-500 mt-10">
                             <Layers size={48} className="mx-auto mb-4 opacity-20"/>
                             <p className="text-sm">Select an item to view properties</p>
                         </div>
                     )}
                 </div>
            </div>

        </div>

        {/* Overlays */}
        <Underlord 
            isOpen={isUnderlordOpen} 
            onClose={() => setIsUnderlordOpen(false)} 
            words={project.transcript.words}
            onWordsChange={handleWordsChange}
            onAddMedia={handleAddMedia}
        />
        
        <StockLibrary 
            isOpen={isLibraryOpen}
            onClose={() => setIsLibraryOpen(false)}
            onAddMedia={handleAddMedia}
        />

        <VoiceCloner 
            isOpen={isVoiceCloneOpen}
            onClose={() => setIsVoiceCloneOpen(false)}
        />

      </div>
    </HashRouter>
  );
};

export default App;
