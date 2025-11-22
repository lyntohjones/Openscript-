
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Schema, Modality } from "@google/genai";
import { Word } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Model Constants
const MODEL_CHAT = 'gemini-3-pro-preview'; // Smartest model for complex tasks
const MODEL_FLASH = 'gemini-2.5-flash'; // Fast tasks
const MODEL_FLASH_LITE = 'gemini-2.5-flash-lite'; // Ultra-fast UI tasks
const MODEL_IMAGE = 'gemini-2.5-flash-image'; // Primary Image Gen (Flash Image)
const MODEL_VIDEO = 'veo-3.1-fast-generate-preview'; // Video Gen
const MODEL_TTS = 'gemini-2.5-flash-preview-tts'; // Speech Gen

// --- Tools Definitions ---

const generateImageTool: FunctionDeclaration = {
  name: 'generate_image',
  description: 'Generate an image based on a prompt. Use this when the user asks to create, draw, or generate a picture or photo.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: 'The detailed description of the image to generate.' },
      text: { type: Type.STRING, description: 'Specific text to render within the image, if any.' },
      size: { type: Type.STRING, enum: ['1K', '2K', '4K'], description: 'The resolution of the image. Defaults to 1K.' }
    },
    required: ['prompt']
  }
};

const generateVideoTool: FunctionDeclaration = {
  name: 'generate_video',
  description: 'Generate a video based on a prompt. Use this when the user asks to create, make, or generate a video or movie.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      prompt: { type: Type.STRING, description: 'The description of the video content.' },
      aspectRatio: { type: Type.STRING, enum: ['16:9', '9:16'], description: 'The aspect ratio. 16:9 for landscape, 9:16 for portrait/TikTok.' }
    },
    required: ['prompt']
  }
};

const generateSpeechTool: FunctionDeclaration = {
  name: 'generate_speech',
  description: 'Generate spoken audio (speech/voiceover) from text. Use this when the user wants to hear text read aloud or needs a voiceover.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      text: { type: Type.STRING, description: 'The text to speak.' },
      voice: { type: Type.STRING, enum: ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'], description: 'The voice to use.' }
    },
    required: ['text']
  }
};

/**
 * Simulates "Lord Genie" - The AI Assistant Chat
 * Configured with Tools and Google Search
 */
export const createGenieChat = (systemInstruction?: string): Chat => {
  return ai.chats.create({
    model: MODEL_CHAT,
    config: {
      systemInstruction: systemInstruction || `You are Lord Genie, an expert AI media producer for OpenScript. 
      
      You have access to tools to generate images, videos, and speech, and you can search the web.
      
      ## Workflow for "Documentary" or Complex Requests:
      If a user asks you to create a documentary, scene, or complex video (e.g., "Create a documentary about Lil Kim"), you MUST follow these steps sequentially in a loop:
      
      1. **Search**: First, use 'googleSearch' to gather accurate, up-to-date facts about the topic.
      2. **Synthesize & Script**: Based on the search results, write a short, engaging voiceover script (approx 1 minute or less). Display this script to the user.
      3. **Voiceover**: IMMEDIATELY call 'generate_speech' to synthesize the script you just wrote. Choose a suitable voice.
      4. **Visuals**: IMMEDIATELY call 'generate_image' or 'generate_video' to create visual assets that match the script's content. Generate multiple assets if necessary to cover the duration.
      
      Do not wait for the user to ask for the next step. Proactively perform the chain of actions to build the full scene.
      Always be helpful, creative, and precise.`,
      tools: [
        { googleSearch: {} },
        { functionDeclarations: [generateImageTool, generateVideoTool, generateSpeechTool] }
      ]
    },
  });
};

/**
 * Direct Service: Generate Image
 * Implements a Fallback Chain: Gemini Flash Image -> Placeholder
 */
export const generateImageService = async (prompt: string, size: string = '1K', text?: string): Promise<string> => {
  if (!process.env.API_KEY) throw new Error("API Key missing");
  
  const effectivePrompt = text ? `${prompt}. Text in image: "${text}"` : prompt;

  // Attempt 1: Gemini 2.5 Flash Image (Primary)
  try {
      const response = await ai.models.generateContent({
          model: MODEL_IMAGE,
          contents: { parts: [{ text: effectivePrompt }] },
          config: {
              // Supported aspect ratios: "1:1", "3:4", "4:3", "9:16", "16:9"
              imageConfig: { aspectRatio: '16:9' } 
          }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data returned from model");
  } catch (e: any) {
      console.warn("Gemini Flash Image Generation failed:", e.message);
  }

  // Attempt 2: Fallback Placeholder (Stock Image Proxy)
  // Using Picsum seeded with the prompt to ensure consistent, different images for different prompts
  console.warn("Image generation methods failed. Returning stock placeholder.");
  return `https://picsum.photos/seed/${encodeURIComponent(prompt.substring(0, 20))}/1280/720`;
};

/**
 * Direct Service: Generate Video (Veo)
 * Supports Text-to-Video and Image-to-Video (if imageBase64 provided)
 */
export const generateVideoService = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9', imageBase64?: string): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");
    
    try {
        let operation;
        
        if (imageBase64) {
            // Animate Image / Image-to-Video
            operation = await ai.models.generateVideos({
                model: MODEL_VIDEO,
                prompt: prompt,
                image: {
                    imageBytes: imageBase64,
                    mimeType: 'image/png' 
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p', 
                    aspectRatio: aspectRatio
                }
            });
        } else {
            // Text-to-Video
            operation = await ai.models.generateVideos({
                model: MODEL_VIDEO,
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });
        }

        // Poll for completion
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5s poll
            const updatedOp = await ai.operations.getVideosOperation({ name: operation.name });
            operation = updatedOp;
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("No video URI returned");

        // Fetch the actual bytes (requires key)
        const vidResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
        const blob = await vidResponse.blob();
        return URL.createObjectURL(blob);

    } catch (e: any) {
        // Graceful Fallback for 404 (Model not found/Allowlist issues)
        if (e.message?.includes('404') || e.status === 404 || e.message?.includes('PERMISSION_DENIED')) {
             console.warn("Veo model not found or access denied. Falling back to demo video.");
             // Return a relevant stock video based on simple keyword matching if possible, or a default
             return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";
        }
        console.error("Video Gen Error", e);
        throw e;
    }
};

/**
 * Direct Service: Generate Speech (TTS)
 */
export const generateSpeechService = async (text: string, voiceName: string = 'Kore'): Promise<string> => {
    if (!process.env.API_KEY) throw new Error("API Key missing");

    try {
        const response = await ai.models.generateContent({
            model: MODEL_TTS,
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceName }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio generated");
        
        return `data:audio/mp3;base64,${base64Audio}`;
    } catch (e) {
        console.error("TTS Error", e);
        throw e;
    }
};

/**
 * Analyze Image or Video
 */
export const analyzeMediaService = async (mediaBase64: string, mimeType: string, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) return "API Key missing";
    try {
        const response = await ai.models.generateContent({
            model: MODEL_CHAT, // Uses Pro for vision
            contents: {
                parts: [
                    { inlineData: { data: mediaBase64, mimeType: mimeType } },
                    { text: prompt || "Describe this media." }
                ]
            }
        });
        return response.text || "No analysis available.";
    } catch (e) {
        return "Error analyzing media.";
    }
};

/**
 * Helper for summarization
 */
export const getAvailableVoices = () => {
    return [
        { id: 'Puck', name: 'Puck (Neutral)', type: 'prebuilt' },
        { id: 'Charon', name: 'Charon (Deep)', type: 'prebuilt' },
        { id: 'Kore', name: 'Kore (Feminine)', type: 'prebuilt' },
        { id: 'Fenrir', name: 'Fenrir (Strong)', type: 'prebuilt' },
        { id: 'Zephyr', name: 'Zephyr (Soft)', type: 'prebuilt' },
    ];
}

/**
 * Helper for summarization (uses Flash Lite for speed if simple, or Flash)
 */
export const generateSummary = async (transcriptText: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing.";
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Summarize the following in 3 bullet points:\n\n${transcriptText}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    return "Error generating summary.";
  }
};

/**
 * Identifies filler words (legacy helper)
 */
export const identifyFillerWords = async (words: Word[]): Promise<number[]> => {
  if (!process.env.API_KEY) return [];
  const textMap = words.map((w, i) => `${i}:${w.text}`).join(' ');

  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH_LITE, // Use Lite for speed
      contents: `Identify indices of filler words (um, uh) in this map. Return JSON array of numbers only. Map: ${textMap}`,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text;
    if (!text) return [];
    const indices = JSON.parse(text);
    return Array.isArray(indices) ? indices : [];
  } catch (error) {
    return [];
  }
};

/**
 * Generates a viral social media caption.
 */
export const generateViralCaption = async (text: string): Promise<string> => {
    if (!process.env.API_KEY) return "Configure API Key.";
    try {
        const response = await ai.models.generateContent({
            model: MODEL_FLASH_LITE, // Use Lite for speed
            contents: `Write a viral caption for this:\n\n${text}`
        });
        return response.text || "";
    } catch (e) {
        return "Error generating caption.";
    }
}

/**
 * Voice Cloning Service Mock
 * Real voice cloning is not yet in public API
 */
export const createVoiceCloneService = async (name: string, audioBlob: Blob): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 2000));
};
