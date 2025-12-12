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

  // 3D Rotation & Zoom State
  const INITIAL_ROTATION = { x: -10, y: 15 };
  const [rotation, setRotation] = useState(INITIAL_ROTATION);
  const [scale, setScale] = useState(0.85);
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

  // Auto-center view when not dragging
  useEffect(() => {
    if (isDragging) return;

    let animFrameId: number;
    const animate = () => {
      setRotation(prev => {
        const dx = INITIAL_ROTATION.x - prev.x;
        const dy = INITIAL_ROTATION.y - prev.y;
        
        // Stop animation if close enough to save resources
        if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
          return prev;
        }

        // Smooth ease-out interpolation (0.05 factor)
        return {
          x: prev.x + dx * 0.05,
          y: prev.y + dy * 0.05
        };
      });
      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameId);
  }, [isDragging, INITIAL_ROTATION.x, INITIAL_ROTATION.y]);

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

  // Interaction Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;
    
    setRotation(prev => {
      // Clamp angles for a "preview" feel rather than full spin
      const newX = Math.max(-60, Math.min(60, prev.x - deltaY * 0.3));
      const newY = Math.max(-60, Math.min(60, prev.y + deltaX * 0.3));
      return { x: newX, y: newY };
    });
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom logic
    const newScale = Math.max(0.5, Math.min(1.5, scale - e.deltaY * 0.001));
    setScale(newScale);
  };

  // --- 3D CONSTRUCTION CONSTANTS ---
  const WIDTH = 400; 
  const HEIGHT = 640;
  const DEPTH = 70;

  // Calculate center offsets for faces
  const centerLeftH = (WIDTH - DEPTH) / 2;
  const centerTopV = (HEIGHT - DEPTH) / 2;

  // Texture & Styles
  const textureUrl = "https://www.transparenttextures.com/patterns/brushed-alum.png";
  
  // Dynamic Metallic Lighting
  // We calculate a position for the "glare" based on the Y rotation
  const glarePos = 50 + (rotation.y * 1.2); 
  const sheenGradient = `linear-gradient(115deg, 
    rgba(255,255,255,0) ${glarePos - 25}%, 
    rgba(255,255,255,0.1) ${glarePos - 15}%, 
    rgba(255,255,255,0.4) ${glarePos}%, 
    rgba(255,255,255,0.1) ${glarePos + 15}%, 
    rgba(255,255,255,0) ${glarePos + 25}%)`;

  return (
    <div 
      className="min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden cursor-move select-none relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ perspective: '2500px' }}
    >
      
      {/* Background Parallax Layer */}
      {playerState.coverArtUrl && (
        <div 
           className="absolute inset-[-20%] bg-cover bg-center transition-transform duration-100 ease-out -z-10 opacity-30 blur-2xl saturate-150"
           style={{ 
             backgroundImage: `url(${playerState.coverArtUrl})`,
             transform: `translateX(${-rotation.y * 2}px) translateY(${-rotation.x * 2}px) scale(1.1)` 
           }}
        />
      )}

      {/* Background Ambience / Vignette */}
      <div className={`absolute inset-0 pointer-events-none z-0 ${playerState.coverArtUrl ? 'bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0a_100%)]' : 'bg-[radial-gradient(circle_at_center,#222_0%,#050505_100%)]'}`} />

      {/* 3D Object Pivot Wrapper */}
      <div 
        className="relative transition-transform duration-100 ease-out z-10"
        style={{
           width: WIDTH,
           height: HEIGHT,
           transformStyle: 'preserve-3d',
           transform: `scale(${scale}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
        }}
      >
        
        {/* --- FRONT FACE --- */}
        <div 
          className="absolute inset-0"
          style={{ 
            transform: `translateZ(${DEPTH / 2}px)`,
            width: WIDTH,
            height: HEIGHT,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* 1. Skin / Background Layer (Non-protruding) */}
          <div className="absolute inset-0 bg-slate-200 border-x border-t border-slate-300 overflow-hidden rounded-sm" style={{ boxShadow: 'inset 0 0 4px rgba(0,0,0,0.2)' }}>
              {/* Metal Texture */}
              <div className="absolute inset-0 opacity-50 z-0 mix-blend-multiply pointer-events-none" style={{ backgroundImage: `url(${textureUrl})`, backgroundSize: '200px' }}></div>
              
              {/* Dynamic Light Sheen Overlay - The "Gloss" */}
              <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay transition-opacity duration-75" style={{ background: sheenGradient }}></div>
              
              {/* Edge Highlight (Simulated Bevel) */}
              <div className="absolute inset-0 border border-white/40 pointer-events-none z-30 rounded-sm"></div>

              {/* Decorative Bolts */}
              {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-2.5 h-2.5 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.3)] z-20 flex items-center justify-center`}>
                  <div className="w-1.5 h-0.5 bg-slate-600/80 rotate-45"></div>
                </div>
              ))}
          </div>

          {/* 2. Content Container (Protruding Elements) */}
          {/* We remove overflow hidden here to allow 3D elements to pop out */}
          <div className="relative z-10 flex flex-col h-full p-5 gap-4" style={{ transformStyle: 'preserve-3d' }}>
             
             {/* TOP: SQUARE DISPLAY */}
             <div className="w-full aspect-square bg-slate-300 rounded-lg shadow-[inset_0_2px_6px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.5)] p-1 border border-slate-400/50" style={{ transform: 'translateZ(2px)' }}>
                <LedDisplay 
                  coverArtUrl={playerState.coverArtUrl} 
                  isGenerating={playerState.isGeneratingArt} 
                  isPlaying={playerState.isPlaying}
                  songName={songName}
                  currentTime={playerState.currentTime}
                  duration={playerState.duration}
                />
             </div>

             {/* BOTTOM: CONTROLS & SPEAKER */}
             {/* We use preserve-3d here so the speaker and buttons inside can have their own Z depth */}
             <div className="flex-1 bg-[#e2e8f0] rounded-lg shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_1px_0_rgba(255,255,255,0.8)] border border-slate-300 grid grid-cols-2 relative group" style={{ transformStyle: 'preserve-3d' }}>
                
                {/* Left: Speaker Section */}
                <div className="border-r border-slate-300 relative bg-gradient-to-br from-slate-100 to-[#cbd5e1] rounded-bl-lg" style={{ transformStyle: 'preserve-3d' }}>
                   <Speaker isPlaying={playerState.isPlaying} />
                   {/* FIXED: Changed rotation to -90 to read upwards inside the container, and adjusted positioning to prevent overflow */}
                   <div className="absolute bottom-6 -left-3 text-[6px] text-slate-500 font-mono -rotate-90 origin-center tracking-widest opacity-60 w-20 text-center pointer-events-none">STEREO OUTPUT</div>
                </div>
                
                {/* Right: Controls Section */}
                <div className="bg-[#f1f5f9] relative rounded-br-lg" style={{ transformStyle: 'preserve-3d' }}>
                   {/* Carbon texture for controls background */}
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] rounded-br-lg"></div>
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

        {/* --- BACK FACE --- */}
        <div 
          className="absolute inset-0 bg-[#cbd5e1] border border-slate-400 flex items-center justify-center rounded-sm"
          style={{ 
            transform: `rotateY(180deg) translateZ(${DEPTH / 2}px)`,
            width: WIDTH,
            height: HEIGHT
          }}
        >
           <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
           
           {/* Back Label Plate / Raised Panel */}
           <div className="w-[85%] h-[80%] bg-[#d1d5db] rounded-xl flex flex-col items-center justify-between py-10 relative shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.7)] border border-slate-300/50">
              
              {/* Top Grip Ridges (Raised 3D feel) */}
              <div className="flex flex-col gap-3 w-1/3">
                <div className="h-2 w-full bg-slate-300 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] relative overflow-hidden border-b border-slate-400/30">
                    <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                </div>
                <div className="h-2 w-full bg-slate-300 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] relative overflow-hidden border-b border-slate-400/30">
                     <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                </div>
              </div>

              {/* Engraved Logo */}
              <div className="relative">
                 {/* Text Shadow creates the engraved effect: Light bottom-right, Dark top-left */}
                 <span className="text-6xl font-black text-slate-400 -rotate-90 select-none tracking-tighter block" 
                       style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.6), -1px -1px 1px rgba(0,0,0,0.2)' }}>
                   GEMINI
                 </span>
              </div>

              {/* Bottom Details */}
              <div className="flex flex-col items-center gap-6 w-full">
                  {/* Regulatory Text (Etched look) */}
                  <div className="text-[6px] text-slate-500 font-mono tracking-widest opacity-60 text-center leading-relaxed font-bold"
                       style={{ textShadow: '0px 1px 0px rgba(255,255,255,0.5)' }}>
                      DESIGNED IN CALIFORNIA<br/>
                      ASSEMBLED IN AI-SPACE<br/>
                      MODEL A2849 • 5V ⎓ 1A
                  </div>
                  
                  {/* Bottom Grip Ridges for Balance */}
                  <div className="flex flex-col gap-3 w-1/3">
                    <div className="h-2 w-full bg-slate-300 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] relative overflow-hidden border-b border-slate-400/30">
                        <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    </div>
                    <div className="h-2 w-full bg-slate-300 rounded-full shadow-[0_2px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.9)] relative overflow-hidden border-b border-slate-400/30">
                         <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>
                    </div>
                  </div>
              </div>
           </div>
           
           {/* Self-Shadowing */}
           <div className="absolute inset-0 bg-black transition-opacity duration-100 pointer-events-none" style={{ opacity: Math.max(0, -rotation.x/90) }}></div>
        </div>

        {/* --- RIGHT FACE --- */}
        <div 
          className="absolute bg-[#d1d5db] overflow-hidden"
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            left: centerLeftH,
            transform: `rotateY(90deg) translateZ(${WIDTH / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            {/* Highlight on the corner */}
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-white/50"></div>
            
            {/* Grip Texture */}
            <div className="h-2/3 w-full flex flex-col justify-center gap-1.5 py-12 px-1 mt-20 opacity-20">
                 {[...Array(15)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black shadow-[0_1px_0_white]"></div>)}
            </div>
            
            {/* Shadow based on lighting */}
            <div className="absolute inset-0 bg-black transition-opacity duration-75 pointer-events-none" style={{ opacity: rotation.y < 0 ? 0.4 : 0 }}></div>
        </div>

        {/* --- LEFT FACE --- */}
        <div 
          className="absolute bg-[#d1d5db] overflow-hidden"
          style={{ 
            width: DEPTH, 
            height: HEIGHT, 
            left: centerLeftH,
            transform: `rotateY(-90deg) translateZ(${WIDTH / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            {/* Highlight on the corner */}
            <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-white/50"></div>

            {/* Grip Texture */}
            <div className="h-2/3 w-full flex flex-col justify-center gap-1.5 py-12 px-1 mt-20 opacity-20">
                 {[...Array(15)].map((_, i) => <div key={i} className="w-full h-[1px] bg-black shadow-[0_1px_0_white]"></div>)}
            </div>
            
            {/* Shadow based on lighting */}
            <div className="absolute inset-0 bg-black transition-opacity duration-75 pointer-events-none" style={{ opacity: rotation.y > 0 ? 0.4 : 0 }}></div>
        </div>

        {/* --- TOP FACE --- */}
        <div 
          className="absolute bg-[#e2e8f0]"
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            top: centerTopV,
            transform: `rotateX(90deg) translateZ(${HEIGHT / 2}px)`
          }}
        >
            <div className="absolute inset-0 opacity-40 mix-blend-multiply" style={{ backgroundImage: `url(${textureUrl})` }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60"></div>
            
            {/* Power Button Top Detail */}
            <div className="absolute top-1/2 left-8 -translate-y-1/2 w-8 h-4 rounded-full bg-slate-300 border border-slate-400 shadow-inner"></div>
        </div>

        {/* --- BOTTOM FACE (PORTS) --- */}
        <div 
          className="absolute bg-[#1e293b] flex items-center justify-between px-12"
          style={{ 
            width: WIDTH, 
            height: DEPTH, 
            top: centerTopV,
            transform: `rotateX(-90deg) translateZ(${HEIGHT / 2}px)`
          }}
        >
            {/* Bottom Panel Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')] opacity-50"></div>
            
            {/* Screw Left */}
            <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10">
               <div className="w-2 h-[1px] bg-slate-800 rotate-45"></div>
               <div className="w-2 h-[1px] bg-slate-800 -rotate-45 absolute"></div>
            </div>

            {/* USB-C Port */}
            <div className="relative z-10 flex flex-col items-center gap-1">
               <div className="w-16 h-6 rounded-full bg-black border-2 border-slate-500 shadow-[inset_0_0_4px_rgba(0,0,0,1)] flex items-center justify-center">
                  <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
               </div>
               <span className="text-[6px] text-slate-500 font-mono tracking-widest">DC 5V</span>
            </div>

            {/* Headphone Jack */}
            <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-black border-2 border-slate-500 shadow-[inset_0_0_4px_rgba(0,0,0,1)] flex items-center justify-center">
                   <div className="w-2 h-2 rounded-full bg-[#111] shadow-[inset_0_0_2px_black]"></div>
                </div>
                <span className="text-[6px] text-slate-500 font-mono tracking-widest">AUX</span>
            </div>
            
             {/* Screw Right */}
             <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)] flex items-center justify-center relative z-10">
               <div className="w-2 h-[1px] bg-slate-800 rotate-45"></div>
               <div className="w-2 h-[1px] bg-slate-800 -rotate-45 absolute"></div>
            </div>
        </div>

      </div>

      {/* Floor Shadow (Dynamic based on rotation & scale) */}
      <div 
         className="absolute top-1/2 left-1/2 w-[350px] h-[350px] bg-black rounded-full pointer-events-none -z-10 transition-all duration-75 ease-out blur-3xl"
         style={{
           transform: `translate(-50%, -50%) translateY(${HEIGHT/2 * scale + 50}px) rotateX(90deg) translateX(${-rotation.y * 1.5}px) scale(${scale * (1 - Math.abs(rotation.x)/100)})`,
           opacity: 0.6 - Math.abs(rotation.x)/100
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