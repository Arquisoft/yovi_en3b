// UBICACIÓN: webapp/src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SettingsContextType {
  brightness: number;
  setBrightness: (v: number) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (v: boolean) => void;
  neonMode: boolean;
  toggleNeonMode: () => void;
  volume: number; 
  setVolume: (v: number) => void; 
  isMuted: boolean; 
  setIsMuted: (v: boolean) => void; 
  playSound: (sound: string) => void; 
  startBackgroundMusic: () => void; // NUEVA FUNCIÓN
  confirmMove: boolean;
  setConfirmMove: (v: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [neonMode, setNeonMode] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [confirmMove, setConfirmMove] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false); 
  const [isMusicPlaying, setIsMusicPlaying] = useState(false); // Nuevo estado

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  // Inicializar música de fondo (Solo carga el archivo, no le da al play)
  useEffect(() => {
    const audio = new Audio('/sounds/gameb.mp3'); 
    audio.loop = true;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Sincronizar volumen y silencio sin auto-play
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = volume / 100;
      bgMusicRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const toggleNeonMode = () => setNeonMode(!neonMode);

  // Función explícita para iniciar la música
  const startBackgroundMusic = () => {
    if (bgMusicRef.current && !isMuted && volume > 0) {
      bgMusicRef.current.play().catch(err => console.log("Música bloqueada:", err));
      setIsMusicPlaying(true);
    }
  };

  const playSound = (soundFile: string) => {
    if (!hasInteracted) setHasInteracted(true); 
    if (isMuted) return;
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = volume / 100;
    audio.play().catch(err => console.error("Error en FX:", err));
  };

  return (
    <SettingsContext.Provider value={{ 
      brightness, setBrightness,
      colorBlindMode, setColorBlindMode,
      neonMode, toggleNeonMode,
      volume, setVolume,
      isMuted, setIsMuted,
      playSound,
      startBackgroundMusic, // Exportamos la función
      confirmMove, setConfirmMove 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider");
  return context;
};