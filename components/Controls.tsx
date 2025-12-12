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
    <div className="flex flex-col h-full justify-center space-y-4 px-6 py-4" style={{ transformStyle: 'preserve-3d' }}>
      
      {/* File Upload Button (Styled as Eject/Load) - 3D Effect */}
      <div className="flex justify-end relative" style={{ transformStyle: 'preserve-3d' }}>
        <label className="cursor-pointer group relative block" style={{ transformStyle: 'preserve-3d' }}>
          <input 
            type="file" 
            accept="audio/*" 
            className="hidden" 
            onChange={onUpload} 
            disabled={disabled}
          />
          {/* Button Thickness Layers */}
          <div className="absolute inset-0 bg-slate-300 rounded translate-y-[4px] translate-z-0"></div>
          <div className="absolute inset-0 bg-slate-300 rounded translate-y-[2px] translate-z-[1px]"></div>
          
          {/* Button Face */}
          <div 
             className="relative bg-slate-200 border border-slate-300 rounded px-3 py-1.5 flex items-center space-x-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] active:translate-y-[4px] transition-transform hover:bg-white text-slate-600 hover:text-orange-500"
             style={{ transform: 'translateZ(4px)' }}
          >
            <ArrowUpTrayIcon className="w-3 h-3" />
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold">Load Tape</span>
          </div>
        </label>
      </div>

      {/* Main Transport Controls */}
      <div className="flex items-center justify-between" style={{ transformStyle: 'preserve-3d' }}>
         {/* Play/Pause Button - Compact 3D Block */}
         <div className="relative w-16 h-16 group" style={{ transformStyle: 'preserve-3d' }}>
             {/* Thickness Stack */}
             {[...Array(5)].map((_, i) => (
                <div key={i} className={`absolute inset-0 rounded-xl ${isPlaying ? 'bg-orange-700' : 'bg-slate-300'}`} style={{ transform: `translateZ(${i * 2}px)` }}></div>
             ))}

             {/* Top Face */}
             <button 
               onClick={onPlayPause}
               disabled={disabled}
               className={`
                 absolute inset-0 w-16 h-16 rounded-xl flex items-center justify-center 
                 border-4 border-white/20 shadow-inner
                 transition-colors duration-200
                 ${isPlaying 
                    ? 'bg-orange-500 text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)]' 
                    : 'bg-slate-100 text-slate-400 hover:bg-white hover:text-orange-500 shadow-[inset_0_2px_5px_rgba(255,255,255,1)]'}
                 disabled:opacity-50 disabled:cursor-not-allowed
               `}
               style={{ transform: 'translateZ(10px)' }}
             >
                {isPlaying ? (
                  <PauseIcon className="w-8 h-8 drop-shadow-sm" />
                ) : (
                  <PlayIcon className="w-8 h-8 ml-1 drop-shadow-sm" />
                )}
             </button>
         </div>

         {/* Status Light - 3D Dome */}
         <div className="flex flex-col items-center space-y-1" style={{ transformStyle: 'preserve-3d' }}>
            <div className="relative w-3 h-3" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 rounded-full bg-black/50" style={{ transform: 'translateZ(0px)' }}></div>
                <div className={`absolute inset-0 rounded-full border border-slate-400/50 ${isPlaying ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-red-500'} transition-colors duration-200`}
                     style={{ transform: 'translateZ(4px)' }}
                >
                    <div className="absolute top-1 left-1 w-1 h-1 bg-white opacity-40 rounded-full blur-[1px]"></div>
                </div>
            </div>
            <span className="text-[8px] font-mono text-slate-400 uppercase font-bold" style={{ transform: 'translateZ(0px)' }}>Power</span>
         </div>
      </div>

      {/* Volume Slider - Fader Style */}
      <div className="bg-slate-200 p-3 rounded-lg border border-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] relative" style={{ transformStyle: 'preserve-3d', transform: 'translateZ(0px)' }}>
        <div className="flex items-center justify-between mb-1.5">
           <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">Output Level</span>
           {volume === 0 ? <SpeakerXMarkIcon className="w-3 h-3 text-slate-400"/> : <SpeakerWaveIcon className="w-3 h-3 text-orange-500"/>}
        </div>
        
        {/* Custom 3D Slider Implementation */}
        <div className="relative w-full h-3 flex items-center" style={{ transformStyle: 'preserve-3d' }}>
            {/* Track Recessed */}
            <div className="absolute left-0 right-0 h-1.5 bg-slate-300 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]" style={{ transform: 'translateZ(0px)' }}></div>
            
            {/* Knob Floating */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              onMouseDown={(e) => e.stopPropagation()} 
              onPointerDown={(e) => e.stopPropagation()}
              disabled={disabled}
              className="absolute w-full h-full opacity-0 cursor-pointer z-50"
            />
            {/* Visual Knob */}
            <div 
                className="absolute w-3 h-6 bg-slate-100 border border-slate-400 rounded-sm shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.9)] pointer-events-none"
                style={{ 
                    left: `calc(${volume * 100}% - 6px)`,
                    transform: 'translateZ(8px)'
                }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-1 bg-slate-300 shadow-inner rounded-full"></div>
            </div>
        </div>
      </div>

      {/* Decorative Text */}
      <div className="text-right">
        <p className="text-[8px] text-slate-400 font-mono">SER. 894-XJ-2 // WHT-EDITION</p>
      </div>

    </div>
  );
};

export default Controls;