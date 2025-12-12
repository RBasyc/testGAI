import React from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon, 
  SpeakerXMarkIcon, 
  ArrowUpTrayIcon 
} from '@heroicons/react/24/solid';

interface ControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  volume: number;
  onVolumeChange: (val: number) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
  isPlaying, 
  onPlayPause, 
  volume, 
  onVolumeChange, 
  onUpload,
  disabled 
}) => {
  return (
    <div className="flex flex-col h-full justify-center space-y-6 px-6 py-4">
      
      {/* File Upload Button (Styled as Eject/Load) */}
      <div className="flex justify-end">
        <label className="cursor-pointer group relative">
          <input 
            type="file" 
            accept="audio/*" 
            className="hidden" 
            onChange={onUpload} 
            disabled={disabled}
          />
          <div className="bg-slate-200 border border-slate-300 rounded px-4 py-2 flex items-center space-x-2 shadow-[0_4px_0_#94a3b8] active:shadow-none active:translate-y-[4px] transition-all hover:bg-white text-slate-600 hover:text-orange-500">
            <ArrowUpTrayIcon className="w-4 h-4" />
            <span className="text-xs font-mono tracking-wider uppercase font-bold">Load Tape</span>
          </div>
        </label>
      </div>

      {/* Main Transport Controls */}
      <div className="flex items-center justify-between">
         {/* Play/Pause Button - Large Industrial Style */}
         <button 
           onClick={onPlayPause}
           disabled={disabled}
           className={`
             w-20 h-20 rounded-xl flex items-center justify-center 
             border-4 border-slate-300 shadow-[0_6px_0_#94a3b8]
             active:shadow-none active:translate-y-[6px] transition-all
             ${isPlaying 
                ? 'bg-orange-500 text-white shadow-[0_6px_0_#c2410c] border-orange-600' 
                : 'bg-slate-100 text-slate-400 hover:bg-white hover:text-orange-500'}
             disabled:opacity-50 disabled:cursor-not-allowed
           `}
         >
            {isPlaying ? (
              <PauseIcon className="w-10 h-10" />
            ) : (
              <PlayIcon className="w-10 h-10 ml-1" />
            )}
         </button>

         {/* Status Light */}
         <div className="flex flex-col items-center space-y-1">
            <div className={`w-3 h-3 rounded-full border border-slate-300 ${isPlaying ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'} transition-colors duration-200`}></div>
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Power</span>
         </div>
      </div>

      {/* Volume Slider - Fader Style */}
      <div className="bg-slate-200 p-4 rounded-lg border border-slate-300 shadow-inner">
        <div className="flex items-center justify-between mb-2">
           <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Output Level</span>
           {volume === 0 ? <SpeakerXMarkIcon className="w-4 h-4 text-slate-400"/> : <SpeakerWaveIcon className="w-4 h-4 text-orange-500"/>}
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-0
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-slate-50 [&::-webkit-slider-thumb]:rounded-sm [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400 [&::-webkit-slider-thumb]:shadow-sm"
        />
      </div>

      {/* Decorative Text */}
      <div className="text-right">
        <p className="text-[10px] text-slate-400 font-mono">SER. 894-XJ-2 // WHT-EDITION</p>
      </div>

    </div>
  );
};

export default Controls;