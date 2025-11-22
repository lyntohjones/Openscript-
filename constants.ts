
import { Project, StockItem } from './types';

export const INITIAL_TRANSCRIPT_WORDS = [
  { id: '1', text: "Welcome", start: 0.0, end: 0.5, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '2', text: "to", start: 0.5, end: 0.7, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '3', text: "OpenScript.", start: 0.7, end: 1.5, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '4', text: "This", start: 1.5, end: 1.8, speaker: "Speaker A", isDeleted: false, confidence: 0.98 },
  { id: '5', text: "is", start: 1.8, end: 2.0, speaker: "Speaker A", isDeleted: false, confidence: 0.98 },
  { id: '6', text: "basically", start: 2.0, end: 2.6, speaker: "Speaker A", isDeleted: true, confidence: 0.60 }, // Example of deleted filler
  { id: '7', text: "a", start: 2.6, end: 2.8, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '8', text: "demo", start: 2.8, end: 3.2, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '9', text: "of", start: 3.2, end: 3.4, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '10', text: "text-based", start: 3.4, end: 4.0, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '11', text: "editing", start: 4.0, end: 4.5, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '12', text: "powered", start: 4.5, end: 5.0, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '13', text: "by", start: 5.0, end: 5.2, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '14', text: "Gemini.", start: 5.2, end: 6.0, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '15', text: "Um,", start: 6.0, end: 6.5, speaker: "Speaker A", isDeleted: true, confidence: 0.70 }, // Filler
  { id: '16', text: "it's", start: 6.5, end: 6.8, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
  { id: '17', text: "really", start: 6.8, end: 7.2, speaker: "Speaker A", isDeleted: false, confidence: 0.95 },
  { id: '18', text: "fast.", start: 7.2, end: 7.8, speaker: "Speaker A", isDeleted: false, confidence: 0.99 },
];

// A sample video URL that works for testing (Big Buck Bunny or similar public domain)
export const SAMPLE_MEDIA_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const DEMO_PROJECT: Project = {
  id: 'demo-1',
  name: 'OpenScript Demo Project',
  mediaUrl: SAMPLE_MEDIA_URL,
  transcript: {
    words: INITIAL_TRANSCRIPT_WORDS,
    duration: 600 // 10 min placeholder
  },
  lastModified: new Date(),
  version: 1,
  assets: []
};

export const MOCK_STOCK_MEDIA: StockItem[] = [
  {
    id: 'vid-1',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
    title: 'Elephants Dream',
    duration: '10:53',
    source: 'Blender Foundation'
  },
  {
    id: 'vid-2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
    title: 'Sintel',
    duration: '14:48',
    source: 'Blender Foundation'
  },
  {
    id: 'vid-3',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
    title: 'Tears of Steel',
    duration: '12:14',
    source: 'Blender Foundation'
  },
  {
    id: 'vid-4',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
    title: 'Abstract Blazes',
    duration: '0:15',
    source: 'Google'
  },
  {
    id: 'vid-5',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
    title: 'Nature Escape',
    duration: '0:15',
    source: 'Google'
  },
  {
    id: 'vid-6',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    thumbnail: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
    title: 'Urban Joyride',
    duration: '0:15',
    source: 'Google'
  },
  {
    id: 'img-1',
    type: 'image',
    url: 'https://picsum.photos/id/10/800/600',
    thumbnail: 'https://picsum.photos/id/10/200/150',
    title: 'Misty Forest',
    source: 'Unsplash'
  },
  {
    id: 'img-2',
    type: 'image',
    url: 'https://picsum.photos/id/15/800/600',
    thumbnail: 'https://picsum.photos/id/15/200/150',
    title: 'Waterfall',
    source: 'Unsplash'
  },
  {
    id: 'img-3',
    type: 'image',
    url: 'https://picsum.photos/id/28/800/600',
    thumbnail: 'https://picsum.photos/id/28/200/150',
    title: 'Mountain Cabin',
    source: 'Unsplash'
  },
  {
    id: 'img-4',
    type: 'image',
    url: 'https://picsum.photos/id/42/800/600',
    thumbnail: 'https://picsum.photos/id/42/200/150',
    title: 'Workspace',
    source: 'Unsplash'
  },
  {
    id: 'img-5',
    type: 'image',
    url: 'https://picsum.photos/id/56/800/600',
    thumbnail: 'https://picsum.photos/id/56/200/150',
    title: 'City Lights',
    source: 'Unsplash'
  }
];
