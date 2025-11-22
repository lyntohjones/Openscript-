
import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Square, Play, Check, Loader2, AlertTriangle, AudioWaveform, Trash2, Sparkles } from 'lucide-react';
import { createVoiceCloneService, getAvailableVoices } from '../services/geminiService';
import { VoiceProfile } from '../types';

interface VoiceClonerProps {
    isOpen: boolean;
    onClose: () => void;
}

const VoiceCloner: React.FC<VoiceClonerProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<'intro' | 'record' | 'training' | 'complete'>('intro');
    const [voiceName, setVoiceName] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [myVoices, setMyVoices] = useState<VoiceProfile[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<BlobPart[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const CONSENT_SCRIPT = "I hereby verify that this is my voice, and I give OpenScript permission to create a synthetic version of it for use in my personal projects.";

    useEffect(() => {
        if (isOpen) {
            setStep('intro');
            setVoiceName('');
            setAudioBlob(null);
            setError(null);
            // Type assertion needed as getAvailableVoices returns object with id, name, type but TypeScript might need help if type doesn't match exactly what was inferred before
            const voices = getAvailableVoices();
            setMyVoices(voices.filter(v => v.type === 'custom') as VoiceProfile[]);
        }
        return () => stopVisualizer();
    }, [isOpen]);

    const startVisualizer = (stream: MediaStream) => {
        if (!canvasRef.current) return;
        
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContextRef.current!.createMediaStreamSource(stream);
        analyserRef.current = audioContextRef.current!.createAnalyser();
        analyserRef.current.fftSize = 256;
        source.connect(analyserRef.current);

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d')!;

        const draw = () => {
            if (!analyserRef.current) return;
            animationFrameRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            // Clear
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const barWidth = (canvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i] / 1.5; // Scale down slightly
                
                // Gradient Color
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
                gradient.addColorStop(0, '#6366f1'); // Indigo
                gradient.addColorStop(1, '#a855f7'); // Purple

                ctx.fillStyle = gradient;
                
                // Rounded bars
                ctx.beginPath();
                ctx.roundRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight, 2);
                ctx.fill();

                x += barWidth + 1;
            }
        };
        draw();
    };

    const stopVisualizer = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        analyserRef.current = null;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stopVisualizer();
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            startVisualizer(stream);
        } catch (e) {
            setError("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleTrain = async () => {
        if (!audioBlob || !voiceName) return;
        setStep('training');
        try {
            await createVoiceCloneService(voiceName, audioBlob);
            setStep('complete');
        } catch (e) {
            setError("Training failed. Please try again.");
            setStep('record');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#0f172a] w-[550px] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                    <div>
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <AudioWaveform className="text-indigo-400" size={20} />
                            Voice Lab
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">Create high-fidelity AI voice clones</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar">
                    {step === 'intro' && (
                        <div className="space-y-6">
                             {/* Saved Voices List */}
                             {myVoices.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Your Voices</h3>
                                    <div className="space-y-2">
                                        {myVoices.map(v => (
                                            <div key={v.id} className="flex items-center justify-between p-3 bg-surface rounded-lg border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                        <Mic size={14} />
                                                    </div>
                                                    <span className="font-medium text-sm">{v.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Ready</span>
                                                    <button className="text-gray-500 hover:text-red-400 p-1"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )}

                            <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-5">
                                <h3 className="text-indigo-300 font-medium mb-2 flex items-center gap-2 text-sm">
                                    <AlertTriangle size={16} />
                                    Consent Verification
                                </h3>
                                <p className="text-xs text-indigo-200/80 leading-relaxed">
                                    To use Voice Cloning, you must record a short consent statement. 
                                    This ensures ethical use of AI technology.
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Voice Name</label>
                                <input 
                                    value={voiceName}
                                    onChange={(e) => setVoiceName(e.target.value)}
                                    placeholder="e.g. My Professional Narration"
                                    className="w-full bg-black/40 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>

                            <button 
                                onClick={() => setStep('record')}
                                disabled={!voiceName.trim()}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-900/20"
                            >
                                Start Recording
                            </button>
                        </div>
                    )}

                    {step === 'record' && (
                        <div className="space-y-8">
                            <div className="p-6 bg-black/40 rounded-xl border border-white/10 text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                <p className="text-gray-400 text-[10px] mb-3 uppercase tracking-widest font-bold">Read Aloud</p>
                                <p className="text-xl font-medium text-white leading-relaxed font-serif italic">
                                    "{CONSENT_SCRIPT}"
                                </p>
                            </div>

                            <div className="h-32 bg-black/60 rounded-xl overflow-hidden relative flex items-center justify-center border border-white/10 shadow-inner">
                                {isRecording ? (
                                     <canvas ref={canvasRef} width={500} height={128} className="w-full h-full" />
                                ) : audioBlob ? (
                                    <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300">
                                        <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center">
                                            <Check size={24} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-green-400">Capture Complete</span>
                                            <button onClick={() => {
                                                const audio = new Audio(URL.createObjectURL(audioBlob));
                                                audio.play();
                                            }} className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors">
                                                <Play size={16} fill="currentColor"/>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Mic size={24} />
                                        <span className="text-sm">Press Record to begin</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center gap-4">
                                {!isRecording && !audioBlob && (
                                    <button 
                                        onClick={startRecording}
                                        className="flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-full font-medium transition-all shadow-lg shadow-red-900/20 hover:scale-105"
                                    >
                                        <Mic size={20} /> Record
                                    </button>
                                )}

                                {isRecording && (
                                    <button 
                                        onClick={stopRecording}
                                        className="flex items-center gap-2 px-8 py-3 bg-white text-black hover:bg-gray-200 rounded-full font-medium transition-all shadow-lg hover:scale-105"
                                    >
                                        <Square size={20} fill="currentColor" /> Stop
                                    </button>
                                )}

                                {audioBlob && (
                                    <div className="flex gap-3 w-full">
                                        <button 
                                            onClick={() => { setAudioBlob(null); setIsRecording(false); }}
                                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors border border-white/10"
                                        >
                                            Retake
                                        </button>
                                        <button 
                                            onClick={handleTrain}
                                            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-indigo-900/20"
                                        >
                                            Create Voice
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'training' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles size={24} className="text-indigo-400 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Processing Voice Model</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                    We are analyzing spectral features and prosody. This only takes a moment.
                                </p>
                            </div>
                        </div>
                    )}

                    {step === 'complete' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-900/30 animate-in zoom-in duration-500">
                                <Check size={40} className="text-white" strokeWidth={3} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Voice Ready!</h3>
                                <p className="text-gray-400 text-sm max-w-xs mx-auto">
                                    <span className="text-white font-medium">"{voiceName}"</span> has been added to your voice library. You can now use it with Lord Genie.
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-full bg-white text-black hover:bg-gray-100 py-3 rounded-xl font-bold transition-colors shadow-lg"
                            >
                                Return to Editor
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceCloner;
