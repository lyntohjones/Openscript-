
import React from 'react';
import { AudioEffectsConfig } from '../../types';
import { Power, Sliders, Activity, Waves } from 'lucide-react';

interface AudioEffectsPanelProps {
  config: AudioEffectsConfig;
  onChange: (config: AudioEffectsConfig) => void;
}

const AudioEffectsPanel: React.FC<AudioEffectsPanelProps> = ({ config, onChange }) => {
  
  const updateCompressor = (key: keyof AudioEffectsConfig['compressor'], value: any) => {
    onChange({ ...config, compressor: { ...config.compressor, [key]: value } });
  };

  const updateEQ = (key: keyof AudioEffectsConfig['eq'], value: any) => {
    onChange({ ...config, eq: { ...config.eq, [key]: value } });
  };

  const updateReverb = (key: keyof AudioEffectsConfig['reverb'], value: any) => {
    onChange({ ...config, reverb: { ...config.reverb, [key]: value } });
  };

  return (
    <div className="p-6 space-y-8 h-full overflow-y-auto custom-scrollbar bg-[#0b0f19]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sliders size={18} className="text-primary" />
          Audio Effects
        </h2>
      </div>

      {/* Compressor */}
      <div className="bg-surface/30 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-green-400" />
            <span className="text-sm font-medium text-gray-200">Compressor</span>
          </div>
          <button 
            onClick={() => updateCompressor('enabled', !config.compressor.enabled)}
            className={`p-1.5 rounded-full transition-colors ${config.compressor.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-500'}`}
          >
            <Power size={14} />
          </button>
        </div>
        <div className={`space-y-4 transition-opacity ${config.compressor.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Threshold</span>
                    <span>{config.compressor.threshold} dB</span>
                </div>
                <input 
                    type="range" min="-60" max="0" step="1"
                    value={config.compressor.threshold}
                    onChange={(e) => updateCompressor('threshold', parseFloat(e.target.value))}
                    className="w-full accent-primary h-1 bg-gray-700 rounded cursor-pointer"
                />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Ratio</span>
                    <span>{config.compressor.ratio}:1</span>
                </div>
                <input 
                    type="range" min="1" max="20" step="0.5"
                    value={config.compressor.ratio}
                    onChange={(e) => updateCompressor('ratio', parseFloat(e.target.value))}
                    className="w-full accent-primary h-1 bg-gray-700 rounded cursor-pointer"
                />
            </div>
        </div>
      </div>

      {/* EQ */}
      <div className="bg-surface/30 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-gray-200">3-Band EQ</span>
          </div>
          <button 
            onClick={() => updateEQ('enabled', !config.eq.enabled)}
            className={`p-1.5 rounded-full transition-colors ${config.eq.enabled ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}
          >
            <Power size={14} />
          </button>
        </div>
        <div className={`grid grid-cols-3 gap-2 transition-opacity ${config.eq.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
           {['low', 'mid', 'high'].map((band) => (
               <div key={band} className="flex flex-col items-center space-y-2">
                   <div className="h-24 bg-gray-800 w-1.5 rounded-full relative">
                       <div 
                          className="absolute bottom-0 left-0 w-full bg-blue-500 rounded-full"
                          style={{ height: `${((config.eq[band as keyof typeof config.eq] as number) + 12) / 24 * 100}%` }}
                       ></div>
                       <input 
                          type="range" min="-12" max="12" 
                          value={config.eq[band as keyof typeof config.eq] as number}
                          onChange={(e) => updateEQ(band as any, parseFloat(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize"
                       />
                   </div>
                   <span className="text-[10px] uppercase text-gray-400">{band}</span>
               </div>
           ))}
        </div>
      </div>

      {/* Reverb */}
      <div className="bg-surface/30 rounded-xl p-4 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-purple-400" />
            <span className="text-sm font-medium text-gray-200">Reverb</span>
          </div>
          <button 
            onClick={() => updateReverb('enabled', !config.reverb.enabled)}
            className={`p-1.5 rounded-full transition-colors ${config.reverb.enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-500'}`}
          >
            <Power size={14} />
          </button>
        </div>
        <div className={`space-y-4 transition-opacity ${config.reverb.enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Mix</span>
                    <span>{(config.reverb.mix * 100).toFixed(0)}%</span>
                </div>
                <input 
                    type="range" min="0" max="1" step="0.01"
                    value={config.reverb.mix}
                    onChange={(e) => updateReverb('mix', parseFloat(e.target.value))}
                    className="w-full accent-purple-500 h-1 bg-gray-700 rounded cursor-pointer"
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEffectsPanel;
