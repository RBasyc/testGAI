import React from 'react';

interface LedDisplayProps {
  coverArtUrl: string | null;
  isGenerating: boolean;
  isPlaying: boolean;
  songName?: string;
}

const LedDisplay: React.FC<LedDisplayProps> = ({ coverArtUrl, isGenerating, isPlaying, songName }) => {
  return (
    <div className="w-full aspect-square bg-neutral-900 relative overflow-hidden rounded-xl border-4 border-slate-300 shadow-[inset_0_0_40px_rgba(0,0,0,1)] group">
      
      {/* 3D Container Transform */}
      <div className="w-full h-full relative" style={{ perspective: '800px' }}>
        <div 
          className="w-[90%] h-[90%] absolute top-[5%] left-[5%] bg-black transition-transform duration-500"
          style={{ 
            boxShadow: '0 0 30px rgba(249, 115, 22, 0.1)',
          }}
        >
          {/* Content Layer */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-neutral-950">
            {isGenerating ? (
              <div className="text-orange-500 font-mono text-xl animate-pulse text-center">
                <div className="mb-2">AI PROCESSING</div>
                <div className="flex gap-1 justify-center">
                  <span className="animate-bounce delay-0">.</span>
                  <span className="animate-bounce delay-100">.</span>
                  <span className="animate-bounce delay-200">.</span>
                </div>
              </div>
            ) : coverArtUrl ? (
              <img 
                src={coverArtUrl} 
                alt="Album Cover" 
                className="w-full h-full object-cover opacity-90 contrast-125 saturate-150 pixelated" 
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="text-center">
                <p className="text-orange-500/50 font-mono text-sm tracking-widest mb-2">NO TAPE</p>
                <div className="w-12 h-12 border border-orange-900/50 mx-auto flex items-center justify-center">
                   <div className="w-8 h-8 bg-orange-900/20"></div>
                </div>
              </div>
            )}
            
            {/* Song Info Overlay Text */}
            {songName && !isGenerating && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md py-2 border-t border-orange-500/30">
                    <p className="text-orange-500 font-mono text-[10px] text-center uppercase tracking-[0.2em] truncate px-4">
                        {isPlaying ? "▶ PLAYING" : "❚❚ PAUSED"}
                    </p>
                    <p className="text-white/80 font-mono text-xs text-center uppercase tracking-widest truncate px-4 mt-0.5">
                        {songName}
                    </p>
                </div>
            )}
          </div>

          {/* LED Grid Mesh Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundImage: 'radial-gradient(circle, transparent 30%, #000 120%)',
              backgroundSize: '3px 3px',
              backgroundColor: 'transparent'
            }}
          />
          {/* Pixel Grid */}
          <div 
            className="absolute inset-0 pointer-events-none z-25 opacity-30"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
                backgroundSize: '4px 4px'
            }}
          />
          
          {/* Scanline Effect */}
          <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] bg-repeat opacity-50"></div>

          {/* Glass Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none z-40"></div>
        </div>
      </div>
    </div>
  );
};

export default LedDisplay;