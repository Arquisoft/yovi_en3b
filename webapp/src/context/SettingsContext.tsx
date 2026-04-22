// UBICACIÓN: webapp/src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SettingsContextType {
  brightness: number;
  setBrightness: (v: number) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (v: boolean) => void;
  neonMode: boolean; // State for neon mode
  toggleNeonMode: () => void; // Function to switch neon mode
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (v: boolean) => void;
  playSound: (sound: string) => void;
  startBackgroundMusic: () => void;
  confirmMove: boolean;
  setConfirmMove: (v: boolean) => void;
  // CORRECCIÓN: Añadidos a la interfaz para que TS los reconozca
  tutorEnabled: boolean; 
  setTutorEnabled: (v: boolean) => void; 
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [neonMode, setNeonMode] = useState(false); // Initialize neon state
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [confirmMove, setConfirmMove] = useState(false);
  const [tutorEnabled, setTutorEnabled] = useState(true); // Default value is true

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleNeonMode = () => {
    setNeonMode((prev) => !prev); 
  };

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  useEffect(() => {
    const audio = new Audio('/sounds/gameb.mp3');
    audio.loop = true;
    bgMusicRef.current = audio;
    return () => audio.pause();
  }, []);

  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = volume / 100;
      bgMusicRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const startBackgroundMusic = () => {
    if (bgMusicRef.current && !isMuted && volume > 0) {
      bgMusicRef.current.play().catch(err => console.log("Audio blocked:", err));
    }
  };

  const playSound = (soundFile: string) => {
    if (!hasInteracted) setHasInteracted(true);
    if (isMuted) return;
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = volume / 100;
    audio.play().catch(err => console.error("FX Error:", err));
  };

  return (
    <SettingsContext.Provider value={{
      brightness, setBrightness,
      colorBlindMode, setColorBlindMode,
      neonMode, toggleNeonMode, 
      volume, setVolume,
      isMuted, setIsMuted,
      playSound,
      startBackgroundMusic,
      confirmMove, setConfirmMove,
      tutorEnabled, setTutorEnabled, // Now TS is happy
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
};