
export interface Word {
  id: string;
  text: string;
  start: number; // seconds
  end: number; // seconds
  speaker: string;
  isDeleted: boolean; // If true, skip during playback
  confidence: number;
}

export interface Transcript {
  words: Word[];
  duration: number;
}

export interface MediaAttachment {
  type: MediaType;
  url: string;
  mimeType?: string;
  title?: string; // Added for UI display
}

export interface AudioEffectsConfig {
  compressor: { threshold: number; ratio: number; enabled: boolean };
  eq: { low: number; mid: number; high: number; enabled: boolean };
  reverb: { mix: number; decay: number; enabled: boolean };
}

export interface Project {
  id: string;
  name: string;
  mediaUrl: string;
  voiceoverUrl?: string; // Separate track for AI narration
  transcript: Transcript;
  lastModified: Date;
  version: number;
  assets: MediaAttachment[];
  audioEffects?: AudioEffectsConfig;
}

export interface SpeakerBlock {
  id: string;
  speaker: string;
  words: Word[];
  startTime: number;
}

export type MediaType = 'image' | 'video' | 'audio';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system' | 'function';
  text: string;
  timestamp: number;
  isToolOutput?: boolean;
  media?: MediaAttachment;
  isLoading?: boolean; // For UI loading states during generation
}

export interface StockItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  title: string;
  duration?: string;
  source: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  type: 'prebuilt' | 'custom';
}
