import React from 'react';

interface LedDisplayProps {
  coverArtUrl: string | null;
  isGenerating: boolean;
  isPlaying: boolean;
  songName?: string;
  currentTime?: number;
  duration?: number;
}

const LedDisplay: React.FC<LedDisplayProps> = ({ 
    coverArtUrl, 
    isGenerating, 
    isPlaying, 
    songName, 
    currentTime = 0, 
    duration = 0 
}) => {
  
  const formatTime = (time: number) => {
    if (!time) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const percent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full aspect-square bg-neutral-900 relative overflow-hidden rounded-xl border-4 border-slate-300 shadow-[inset_0_0_40px_rgba(0,0,0,1)] group">
      
      {/* 3D Container Transform */}
      <div className="w-full h-full relative" style={{ perspective: '800px' }}>
        <div 
          className="w-[94%] h-[94%] absolute top-[3%] left-[3%] bg-black transition-transform duration-500 overflow-hidden rounded-md"
          style={{ 
            boxShadow: 'inset 0 0 20px rgba(0,0,0,1)',
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
                className="w-full h-full object-cover opacity-60 contrast-125 saturate-150 pixelated mix-blend-screen" 
                style={{ imageRendering: 'pixelated' }}
              />
            ) : (
              <div className="text-center">
                 <div className="w-24 h-24 border border-orange-900/50 mx-auto flex items-center justify-center relative">
                   <div className="absolute inset-0 bg-orange-500/5 animate-pulse"></div>
                   <div className="w-16 h-1 bg-orange-900/40"></div>
                   <div className="w-1 h-16 bg-orange-900/40 absolute"></div>
                </div>
              </div>
            )}
            
            {/* Real-time Info Overlay */}
            {songName && !isGenerating && (
                <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none">
                    
                    {/* Top: Header Info */}
                    <div className="flex justify-between items-start text-orange-500 font-mono text-[9px] tracking-wider opacity-90">
                        <span className="bg-orange-500/10 px-1 rounded">{isPlaying ? "PLAY" : "STOP"}</span>
                        <span>CH-01</span>
                    </div>

                    {/* Middle: Simulated Visualizer */}
                    {isPlaying && (
                        <div className="absolute bottom-16 left-0 right-0 h-12 flex items-end justify-center gap-0.5 px-4 opacity-70">
                            {[...Array(16)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-orange-500"
                                    style={{
                                        animation: `equalizer 0.5s ease-in-out infinite alternate`,
                                        animationDelay: `${i * 0.05}s`,
                                        height: `${20 + Math.random() * 60}%` 
                                    }}
                                />
                            ))}
                            <style>{`
                                @keyframes equalizer {
                                    0% { height: 10%; opacity: 0.3; }
                                    50% { height: 80%; opacity: 1; }
                                    100% { height: 30%; opacity: 0.5; }
                                }
                            `}</style>
                        </div>
                    )}

                    {/* Bottom: Progress & Time */}
                    <div className="bg-black/60 backdrop-blur-sm p-2 rounded border-t border-orange-500/20">
                        <div className="flex justify-between text-orange-400 font-mono text-[10px] mb-1 tracking-widest">
                             <span>{formatTime(currentTime)}</span>
                             <span className="truncate max-w-[100px] text-center opacity-80">{songName}</span>
                             <span>{formatTime(duration)}</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                             <div 
                                className="h-full bg-orange-500 transition-all duration-300 ease-linear shadow-[0_0_8px_rgba(249,115,22,0.8)]" 
                                style={{ width: `${percent}%` }}
                             />
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* --- Lighting & Texture Effects --- */}

          {/* 1. LED Grid Mesh Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundImage: 'radial-gradient(circle, transparent 30%, #000 120%)',
              backgroundSize: '3px 3px',
              backgroundColor: 'transparent'
            }}
          />
          
          {/* 2. Pixel Grid */}
          <div 
            className="absolute inset-0 pointer-events-none z-25 opacity-20"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.5) 1px, transparent 1px)',
                backgroundSize: '4px 4px'
            }}
          />
          
          {/* 3. Scanline Effect - Stronger */}
          <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_3px] bg-repeat opacity-40"></div>

          {/* 4. Strong Inner Shadow / Vignette (Depth) */}
          <div className="absolute inset-0 pointer-events-none z-40 shadow-[inset_0_0_20px_rgba(0,0,0,1)]"></div>

          {/* 5. Glass Reflection (Gloss) */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-50 rounded-md"></div>
          
          {/* 6. Subtle Screen Glare */}
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-50 opacity-30"></div>
        </div>
      </div>
    </div>
  );
};

export default LedDisplay;