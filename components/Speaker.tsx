import React from 'react';

interface SpeakerProps {
  isPlaying: boolean;
}

const Speaker: React.FC<SpeakerProps> = ({ isPlaying }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center py-4">
      {/* Speaker Housing - White Metal */}
      <div className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-200 border-4 border-slate-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden group">
        
        {/* Screw Details - Silver */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner" />

        {/* Mesh Grill */}
        <div 
          className="absolute inset-0 rounded-full opacity-40 pointer-events-none z-10 mix-blend-multiply"
          style={{
            backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1.5px)',
            backgroundSize: '3px 3px'
          }}
        />

        {/* Cone Animation */}
        <div className={`w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-neutral-800 to-black shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform duration-100 ${isPlaying ? 'animate-[pulse_0.4s_ease-in-out_infinite]' : ''}`}>
           {/* Dust Cap */}
           <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 relative overflow-hidden">
             <div className="absolute top-1 left-1 w-3 h-1 bg-white opacity-20 rounded-full rotate-[-45deg] blur-[1px]"></div>
           </div>
        </div>

        {/* Orange Accent Ring */}
        <div className={`absolute inset-0 rounded-full border border-orange-500/50 transition-all duration-300 ${isPlaying ? 'shadow-[0_0_15px_rgba(249,115,22,0.6)] border-orange-500' : ''}`}></div>
      </div>
    </div>
  );
};

export default Speaker;