import React from 'react';

interface SpeakerProps {
  isPlaying: boolean;
}

const Speaker: React.FC<SpeakerProps> = ({ isPlaying }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center py-4" style={{ transformStyle: 'preserve-3d' }}>
      
      <style>{`
        @keyframes speaker-thump {
          0% { transform: translateZ(-6px); }
          30% { transform: translateZ(-2px); }
          50% { transform: translateZ(-4px); }
          100% { transform: translateZ(-6px); }
        }
      `}</style>

      {/* 3D Speaker Stack - Creates thickness */}
      {/* Layer 1 - Base (Deepest) */}
      <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-400" style={{ transform: 'translateZ(0px)' }}></div>
      {/* Layer 2 */}
      <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-300" style={{ transform: 'translateZ(2px)' }}></div>
      {/* Layer 3 */}
      <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-300" style={{ transform: 'translateZ(4px)' }}></div>
      {/* Layer 4 */}
      <div className="absolute w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-300" style={{ transform: 'translateZ(6px)' }}></div>

      {/* Main Top Face Housing - White Metal */}
      <div 
        className="w-36 h-36 md:w-40 md:h-40 rounded-full bg-slate-200 border-4 border-slate-300 shadow-[inset_0_2px_5px_rgba(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] flex items-center justify-center relative overflow-hidden group absolute"
        style={{ transform: 'translateZ(8px)', transformStyle: 'preserve-3d' }}
      >
        
        {/* Screw Details - Silver */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner z-20" />
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner z-20" />
        <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner z-20" />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 shadow-inner z-20" />

        {/* Mesh Grill - Floating slightly above cone */}
        <div 
          className="absolute inset-0 rounded-full opacity-40 pointer-events-none z-10 mix-blend-multiply"
          style={{
            backgroundImage: 'radial-gradient(circle, #555 1px, transparent 1.5px)',
            backgroundSize: '3px 3px',
            transform: 'translateZ(2px)'
          }}
        />

        {/* Cone Animation - Recessed Deeply */}
        <div 
            className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-neutral-800 to-black shadow-[inset_0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center"
            style={{ 
              transform: 'translateZ(-6px)',
              animation: isPlaying ? 'speaker-thump 0.4s ease-out infinite alternate' : 'none'
            }}
        >
           {/* Dust Cap - Protruding from Cone */}
           <div 
               className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-700 shadow-[0_0_10px_rgba(0,0,0,0.8)] z-20 relative overflow-hidden"
               style={{ transform: 'translateZ(4px)' }}
            >
             <div className="absolute top-1 left-1 w-3 h-1 bg-white opacity-20 rounded-full rotate-[-45deg] blur-[1px]"></div>
           </div>
        </div>

        {/* Orange Accent Ring - Constant warm glow when playing */}
        <div 
          className={`absolute inset-0 rounded-full border border-orange-500/50 transition-all duration-1000 ${isPlaying ? 'shadow-[0_0_20px_rgba(249,115,22,0.4)] border-orange-500 bg-orange-500/5' : ''}`} 
          style={{ transform: 'translateZ(1px)' }}>
        </div>
      </div>
    </div>
  );
};

export default Speaker;