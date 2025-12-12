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
  const [rotation, setRotation] = useState({ x: -5, y: 10 });
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

    setPlayerState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentTime: 0, 
      coverArtUrl: null,
      isGeneratingArt: true 
    }));

    const objectUrl = URL.createObjectURL(file);
    audioRef.current.src = objectUrl;
    audioRef.current.load();
    setSongName(file.name.replace(/\.[^/.]+$/, ""));

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

  // Drag to Rotate Logic - RESTRICTED ANGLES
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => {
      // Clamp values to prevent 360 spins
      const newX = Math.max(-15, Math.min(15, prev.x - deltaY * 0.2));
      const newY = Math.max(-25, Math.min(25, prev.y + deltaX * 0.2));
      return { x: newX, y: newY };
    });
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // --- 3D CONSTRUCTION CONSTANTS ---
  const WIDTH = 420;
  const HEIGHT = 660;
  const DEPTH = 80;

  // Calculate center offsets to position faces absolutely before transform
  const centerLeftH = (WIDTH - DEPTH) / 2; // For Left/Right faces
  const centerTopV = (HEIGHT - DEPTH) / 2; // For Top/Bottom faces

  // Texture & Styles
  const textureUrl = "https://www.transparenttextures.com/patterns/brushed-alum.png";
  
  // Dynamic Metallic Lighting
  // Create a sheen that moves opposite to rotation
  const sheenGradient = `linear-gradient(${110 + rotation.y}deg, rgba(255,255,255,0) 20%, rgba(255,255,255,${0.1 + Math.abs(rotation.y)/200}) 40%, rgba(255,255,255,${0.3 + Math.abs(rotation.y)/100}) 50%, rgba(255,255,255,0) 80%)`;

  return (
    <div 
      className="min-h-screen bg-[#111] flex items-center justify-center overflow-hidden cursor-move select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ perspective: '2500px' }}
    >
      
      {/* 3D Object Pivot Wrapper */}
      <div 
        className="relative transition-transform duration-75 ease-out"
        style={{
           width: WIDTH,
           height: HEIGHT,
           transformStyle: 'preserve-3d',
           transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        
        {/* --- FACES --- */}
        {/* All faces are absolute. Side faces are centered then translated out. */}

        {/* FRONT FACE */}
        <div 
          className="absolute inset-0 bg-slate-200 border border-slate-300 overflow-hidden"
          style={{ 
            transform: `translateZ(${DEPTH / 2}px)`,
            width: WIDTH,
            height: HEIGHT
          }}
        >
          {/* Metal Texture */}
          <div className="absolute inset-0 opacity-50 z-0 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url(${textureUrl})` }}></div>
          
          {/* Dynamic Light Sheen Overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none mix-blend-soft-light" style={{ background: sheenGradient }}></div>

          {/* Decorative Bolts */}
          <div className="absolute top-3 left-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute bottom-3 left-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>
          <div className="absolute bottom-3 right-3 w-3 h-3 rounded-full bg-slate-400 shadow-[inset_0_1px_1px_rgba(0,0,0,0.5),0_1px_0_rgba(255,255,255,0.5)] z-20 flex items-center justify-center"><div className="w-1.5 h-0.5 bg-slate-600 rotate-45"></div></div>

          {/* Content Container */}
          <div className="relative z-10 flex flex-col h-full p-6 gap-4">
             {/* TOP: SQUARE DISPLAY */}
             <div className="w-full aspect-square bg-slate-300 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] p-1">
                <LedDisplay 
                  coverArtUrl={playerState.coverArtUrl} 
                  isGenerating={playerState.isGeneratingArt} 
                  isPlaying={playerState.isPlaying}
                  songName={songName}
                />
             </div>

             {/* BOTTOM: CONTROLS & SPEAKER */}
             <div className="flex-1 bg-slate-100 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)] border border-slate-300 grid grid-cols-2 relative overflow-hidden">
                <div className="border-r border-slate-300 relative bg-gradient-to-br from-slate-100 to-slate-200">
                   <Speaker isPlaying={playerState.isPlaying} />
                   <div className="absolute bottom-2 left-2 text-[8px] text-slate-400 font-mono rotate-90 origin-bottom-left">HIGH FIDELITY</div>
                </div>
                <div className="bg-slate-100">
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
          className="absolute inset-0 bg-slate-300 border border-slate-400 flex items-center justify-center"
          style={{ 
            transform: `rotateY(180deg) translateZ(${DEPTH / 2}px)`,
            width: WIDTH,
            height: HEIGHT
          }}
        >
           <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
           <div className="w-3/4 h-3/4 border-4 border-slate-400/20 rounded-2xl flex items-center justify-center">
              <span className="text-6xl font-black text-slate-400/20 -rotate-90 select-none">GEMINI</span>
           </div>
           {/* Shadow based on rotation (darkens when facing camera) */}
           <div className="absolute inset-0 bg-black transition-opacity duration-100 pointer-events-none" style={{ opacity: Math.max(0, -rotation.x/90) }}></div>
        </div>

        {/* RIGHT FACE */}
        <div 
          className="absolute bg-slate-300 border-r border-slate-400 overflow-hidden"
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            left: centerLeftH,
            transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            {/* Specular Highlight on edge */}
            <div className="absolute inset-0 bg-gradient-to-l from-white/40 to-transparent opacity-50"></div>
            {/* Detail Lines */}
            <div className="h-full w-full flex flex-col justify-between py-12 px-3">
                 <div className="w-[1px] h-full bg-slate-500/20 mx-auto"></div>
            </div>
            {/* Dynamic Shadow */}
            <div className="absolute inset-0 bg-black transition-opacity duration-75 pointer-events-none" style={{ opacity: rotation.y < 0 ? 0.3 : 0 }}></div>
        </div>

        {/* LEFT FACE */}
        <div 
          className="absolute bg-slate-300 border-l border-slate-400 overflow-hidden"
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            left: centerLeftH,
            transform: `rotateY(-90deg) translateZ(${WIDTH / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-50"></div>
            {/* Detail Lines */}
            <div className="h-full w-full flex flex-col justify-between py-12 px-3">
                 <div className="w-[1px] h-full bg-slate-500/20 mx-auto"></div>
            </div>
            {/* Dynamic Shadow */}
            <div className="absolute inset-0 bg-black transition-opacity duration-75 pointer-events-none" style={{ opacity: rotation.y > 0 ? 0.3 : 0 }}></div>
        </div>

        {/* TOP FACE */}
        <div 
          className="absolute bg-slate-200 border border-slate-300"
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            top: centerTopV,
            transform: `rotateX(90deg) translateZ(${HEIGHT / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>
            {/* Dynamic Shadow */}
            <div className="absolute inset-0 bg-black transition-opacity duration-75 pointer-events-none" style={{ opacity: rotation.x < 0 ? 0.2 : 0 }}></div>
        </div>

        {/* BOTTOM FACE */}
        <div 
          className="absolute bg-neutral-800"
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            top: centerTopV,
            transform: `rotateX(-90deg) translateZ(${HEIGHT / 2}px)`
          }}
        >
            <div className="absolute inset-0 bg-black/50"></div>
        </div>

      </div>

      {/* Floor Shadow (Dynamic based on rotation) */}
      <div 
         className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-black rounded-full pointer-events-none -z-10 transition-all duration-75 ease-out blur-3xl"
         style={{
           transform: `translate(-50%, -50%) translateY(${HEIGHT/2 + 50}px) rotateX(90deg) translateX(${-rotation.y * 1.5}px) scale(${1 - Math.abs(rotation.x)/100})`,
           opacity: 0.5 - Math.abs(rotation.x)/100
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