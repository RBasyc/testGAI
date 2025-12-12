import React, { useState, useRef, useEffect, useCallback } from 'react';
import LedDisplay from './components/LedDisplay';
import Speaker from './components/Speaker';
import Controls from './components/Controls';
import { generateCoverArt } from './services/geminiService';
import { PlayerState } from './types';

const App: React.FC = () => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    volume: 0.5,
    currentTime: 0,
    duration: 0,
    coverArtUrl: null,
    isGeneratingArt: false,
  });
  
  const [songName, setSongName] = useState<string>("NO TAPE");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 3D Rotation State
  const [rotation, setRotation] = useState({ x: -10, y: 15 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Initialize Audio Element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = playerState.volume;
    
    // Listeners
    const audio = audioRef.current;
    
    const onEnded = () => setPlayerState(prev => ({ ...prev, isPlaying: false }));
    const onTimeUpdate = () => setPlayerState(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onLoadedMetadata = () => setPlayerState(prev => ({ ...prev, duration: audio.duration }));

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioRef.current) return;

    // Reset State
    setPlayerState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: 0, 
      coverArtUrl: null,
      isGeneratingArt: true 
    }));

    // Load Audio
    const objectUrl = URL.createObjectURL(file);
    audioRef.current.src = objectUrl;
    audioRef.current.load();
    setSongName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension

    // Generate Art
    const generatedUrl = await generateCoverArt(file.name);
    setPlayerState(prev => ({ 
      ...prev, 
      coverArtUrl: generatedUrl, 
      isGeneratingArt: false 
    }));

  }, []);

  const togglePlayPause = () => {
    if (!audioRef.current || !audioRef.current.src) return;

    if (playerState.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const handleVolumeChange = (val: number) => {
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setPlayerState(prev => ({ ...prev, volume: val }));
  };

  // Drag to Rotate Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Dimensions for 3D construction
  const WIDTH = 420;
  const HEIGHT = 660; // Top square(380) + padding + Bottom(240ish)
  const DEPTH = 80;

  const wallStyle = "absolute bg-slate-300 border border-slate-400";
  const metalTexture = "url('https://www.transparenttextures.com/patterns/brushed-alum.png')";

  return (
    <div 
      className="min-h-screen bg-neutral-900 flex items-center justify-center overflow-hidden cursor-move select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ perspective: '2000px' }}
    >
      
      {/* 3D Object Container */}
      <div 
        className="relative transition-transform duration-75 ease-out"
        style={{
           width: WIDTH,
           height: HEIGHT,
           transformStyle: 'preserve-3d',
           transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        
        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 bg-slate-200 overflow-hidden border border-slate-100 shadow-xl"
          style={{ 
            transform: `translateZ(${DEPTH / 2}px)`,
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-40 z-0 mix-blend-multiply" style={{ backgroundImage: metalTexture }}></div>
          
          {/* Decorative Bolts */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>

          {/* FRONT CONTENT */}
          <div className="relative z-10 flex flex-col h-full p-6 space-y-4">
             {/* TOP: SQUARE DISPLAY */}
             <div className="w-full aspect-square bg-slate-300 rounded-xl shadow-inner p-1">
                <LedDisplay 
                  coverArtUrl={playerState.coverArtUrl} 
                  isGenerating={playerState.isGeneratingArt} 
                  isPlaying={playerState.isPlaying}
                  songName={songName}
                />
             </div>

             {/* BOTTOM: CONTROLS & SPEAKER */}
             <div className="flex-1 bg-slate-100 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border border-slate-300 grid grid-cols-2 relative overflow-hidden">
                <div className="border-r border-slate-300 relative">
                   <Speaker isPlaying={playerState.isPlaying} />
                   <div className="absolute bottom-2 left-2 text-[8px] text-slate-400 font-mono rotate-90 origin-bottom-left">HIGH FIDELITY</div>
                </div>
                <div>
                   <Controls 
                     isPlaying={playerState.isPlaying}
                     onPlayPause={togglePlayPause}
                     volume={playerState.volume}
                     onVolumeChange={handleVolumeChange}
                     onUpload={handleFileUpload}
                     disabled={playerState.isGeneratingArt}
                   />
                </div>
             </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className={`${wallStyle} flex items-center justify-center`}
          style={{ 
            width: WIDTH, 
            height: HEIGHT, 
            transform: `translateZ(-${DEPTH / 2}px) rotateY(180deg)`
          }}
        >
           <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply" style={{ backgroundImage: metalTexture }}></div>
           <div className="w-3/4 h-3/4 border-2 border-slate-400 opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-4xl font-bold text-slate-400 opacity-20 -rotate-45 select-none">GEMINI</span>
           </div>
           {/* Vents */}
           <div className="absolute bottom-10 w-full flex flex-col items-center gap-2 opacity-30">
              {[...Array(6)].map((_, i) => (
                  <div key={i} className="w-2/3 h-1 bg-black rounded-full"></div>
              ))}
           </div>
        </div>

        {/* RIGHT FACE */}
        <div 
          className={`${wallStyle}`}
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`,
            right: 0 // Position adjustment logic is handled by translateZ mostly, but standard cube logic applies
          }}
        >
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-gradient-to-r from-slate-400 to-slate-200" style={{ backgroundImage: metalTexture }}></div>
            {/* Side detail lines */}
            <div className="h-full w-full flex flex-col justify-between py-12 px-2">
                 <div className="w-[2px] h-full bg-slate-400/30 mx-auto"></div>
            </div>
        </div>

        {/* LEFT FACE */}
        <div 
          className={`${wallStyle}`}
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            transform: `rotateY(-90deg) translateZ(${WIDTH / 2}px)`,
            left: 0
          }}
        >
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-gradient-to-l from-slate-400 to-slate-200" style={{ backgroundImage: metalTexture }}></div>
             {/* Side detail lines */}
             <div className="h-full w-full flex flex-col justify-between py-12 px-2">
                 <div className="w-[2px] h-full bg-slate-400/30 mx-auto"></div>
            </div>
        </div>

        {/* TOP FACE */}
        <div 
          className={`${wallStyle}`}
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            transform: `rotateX(90deg) translateZ(${DEPTH / 2}px)`,
            top: 0
          }}
        >
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-gradient-to-b from-slate-200 to-slate-400" style={{ backgroundImage: metalTexture }}></div>
        </div>

        {/* BOTTOM FACE */}
        <div 
          className={`${wallStyle}`}
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            transform: `rotateX(-90deg) translateZ(${HEIGHT - (DEPTH / 2)}px)`,
            bottom: 0
          }}
        >
            <div className="absolute inset-0 bg-black opacity-80"></div>
        </div>

      </div>

      {/* Floor Shadow (Dynamic) */}
      <div 
         className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-black/40 blur-3xl rounded-full pointer-events-none -z-10 transition-all duration-75"
         style={{
           transform: `translate(-50%, -50%) translateY(${HEIGHT/2 + 40}px) rotateX(90deg) translateX(${-rotation.y}px) scale(${1 - Math.abs(rotation.x)/180})`,
           opacity: 0.6
         }}
      ></div>

      {/* API Key Missing Warning */}
      {!process.env.API_KEY && (
        <div className="fixed top-0 left-0 w-full bg-orange-600 text-white text-center py-2 font-mono text-sm shadow-lg z-50">
           WARNING: API_KEY is missing. AI Features will not work.
        </div>
      )}
    </div>
  );
};

export default App;