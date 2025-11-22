
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, Image as ImageIcon, Film, Mic, Paperclip, ChevronRight, Plus, User, Bot } from 'lucide-react';
import { 
    createGenieChat, 
    generateImageService,
    generateVideoService,
    generateSpeechService,
} from '../services/geminiService';
import { ChatMessage, Word, StockItem } from '../types';

interface UnderlordProps {
  words: Word[];
  onWordsChange: (words: Word[]) => void;
  isOpen: boolean;
  onClose: () => void;
  onAddMedia: (item: StockItem) => void;
}

const Underlord: React.FC<UnderlordProps> = ({ words, onWordsChange, isOpen, onClose, onAddMedia }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '0', 
      role: 'system', 
      text: "Hi! I'm Lord Genie. I can edit your project, generate media, or answer questions. What can I do for you today?", 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{data: string, mimeType: string, name: string} | null>(null);
  
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createGenieChat();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const addMessage = (role: ChatMessage['role'], text: string, media?: ChatMessage['media'], isToolOutput: boolean = false) => {
    setMessages(prev => [...prev, {
        id: Date.now().toString() + Math.random(),
        role,
        text,
        timestamp: Date.now(),
        media,
        isToolOutput
    }]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => {
          const base64String = (reader.result as string).split(',')[1];
          setAttachedFile({ data: base64String, mimeType: file.type, name: file.name });
      };
      reader.readAsDataURL(file);
  };

  const handleAddToProject = (media: NonNullable<ChatMessage['media']>) => {
      const typeMap: Record<string, StockItem['type']> = {
          'image': 'image',
          'video': 'video',
          'audio': 'audio' 
      };
      
      onAddMedia({
          id: Date.now().toString(),
          type: typeMap[media.type] || 'image',
          url: media.url,
          thumbnail: media.type === 'image' ? media.url : '',
          title: media.title || 'Generated Asset',
          source: 'Lord Genie AI'
      });
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() && !attachedFile) return;

    setIsLoading(true);
    
    // Add User Message
    let mediaAttachment;
    if (attachedFile) {
        mediaAttachment = {
             type: attachedFile.mimeType.startsWith('video') ? 'video' : 'image' as any,
             url: `data:${attachedFile.mimeType};base64,${attachedFile.data}`,
             mimeType: attachedFile.mimeType,
             title: attachedFile.name
        };
    }
    addMessage('user', textToSend, mediaAttachment);
    setInput('');
    setAttachedFile(null);

    try {
        const result = await chatSessionRef.current.sendMessage({ message: textToSend });
        
        // Handle Text Response
        if (result.text) {
             addMessage('model', result.text);
        }

        // Handle Function Calls
        const calls = result.functionCalls;
        
        if (calls && calls.length > 0) {
            for (const call of calls) {
                 setIsLoading(true); // Keep loading state
                 const args = call.args as any;
                 let outputUrl = '';
                 let outputType: 'image' | 'video' | 'audio' = 'image';

                 try {
                     if (call.name === 'generate_image') {
                         outputUrl = await generateImageService(args.prompt, args.size, args.text);
                         outputType = 'image';
                     } else if (call.name === 'generate_video') {
                         outputUrl = await generateVideoService(args.prompt, args.aspectRatio);
                         outputType = 'video';
                     } else if (call.name === 'generate_speech') {
                         outputUrl = await generateSpeechService(args.text, args.voice);
                         outputType = 'audio';
                     }

                     if (outputUrl) {
                         addMessage('function', `Generated ${outputType} for: ${args.prompt || args.text}`, {
                             type: outputType,
                             url: outputUrl,
                             title: args.prompt || args.text,
                             mimeType: outputType === 'video' ? 'video/mp4' : (outputType === 'audio' ? 'audio/mpeg' : 'image/png')
                         }, true);
                     }
                 } catch (err) {
                     console.error("Tool execution failed", err);
                     addMessage('system', `Failed to generate ${outputType}: ${err instanceof Error ? err.message : 'Unknown error'}`);
                 }
            }
        }

    } catch (e) {
        console.error(e);
        addMessage('system', "Sorry, I encountered an error processing your request.");
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-[#0b0f19] border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4 bg-black/20 backdrop-blur">
          <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400" size={18} />
              <span className="font-semibold text-white">Lord Genie AI</span>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
              <X size={18} />
          </button>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex items-start gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : (msg.role === 'system' ? 'bg-red-500/20' : 'bg-gradient-to-br from-indigo-500 to-purple-600')}`}>
                          {msg.role === 'user' ? <User size={14} /> : (msg.role === 'system' ? <Bot size={14} /> : <Sparkles size={14} />)}
                      </div>
                      
                      <div className={`rounded-2xl px-4 py-2 text-sm ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-sm' 
                            : (msg.isToolOutput ? 'bg-transparent border border-border w-full' : 'bg-white/10 text-gray-200 rounded-tl-sm')
                      }`}>
                          {msg.text}
                          
                          {/* Media Attachment Display */}
                          {msg.media && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative group">
                                  {msg.media.type === 'image' && (
                                      <img src={msg.media.url} className="w-full h-auto max-h-48 object-contain" alt="Generated" />
                                  )}
                                  {msg.media.type === 'video' && (
                                      <video src={msg.media.url} className="w-full h-auto max-h-48" controls />
                                  )}
                                  {msg.media.type === 'audio' && (
                                      <div className="p-3 flex items-center gap-3">
                                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                              <Mic size={14} />
                                          </div>
                                          <audio src={msg.media.url} controls className="h-8 w-full" />
                                      </div>
                                  )}

                                  {/* Add to Project Action */}
                                  {msg.role !== 'user' && (
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                          <button 
                                              onClick={() => msg.media && handleAddToProject(msg.media)}
                                              className="bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                          >
                                              <Plus size={14} /> Add to Project
                                          </button>
                                      </div>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          ))}
          
          {isLoading && (
              <div className="flex items-center gap-2 text-gray-500 text-xs ml-10">
                  <Loader2 size={12} className="animate-spin" />
                  <span>Lord Genie is thinking...</span>
              </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#0f172a] border-t border-border">
          {attachedFile && (
              <div className="flex items-center justify-between bg-white/5 px-3 py-2 rounded-lg mb-2 border border-white/10">
                  <span className="text-xs text-gray-300 truncate max-w-[200px]">{attachedFile.name}</span>
                  <button onClick={() => setAttachedFile(null)} className="text-gray-500 hover:text-white"><X size={14}/></button>
              </div>
          )}
          
          <div className="flex gap-2">
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  accept="image/*,video/*,audio/*"
              />
              <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                  <Paperclip size={20} />
              </button>
              
              <div className="flex-grow relative">
                  <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask for edits, images, or videos..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-600"
                  />
                  <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() && !attachedFile}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:bg-gray-700 text-white rounded-lg transition-all"
                  >
                      <Send size={16} />
                  </button>
              </div>
          </div>
          
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
              <SuggestionChip label="Create an image of a futuristic city" onClick={() => handleSend("Create an image of a futuristic city")} />
              <SuggestionChip label="Generate a voiceover for this script" onClick={() => handleSend("Generate a voiceover for this script")} />
              <SuggestionChip label="Make a video about space" onClick={() => handleSend("Make a video about space")} />
          </div>
      </div>
    </div>
  );
};

const SuggestionChip = ({ label, onClick }: { label: string, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
    >
        {label}
    </button>
);

export default Underlord;
