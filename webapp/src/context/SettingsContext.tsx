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
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

function createAudioSafely(src: string): HTMLAudioElement | null {
  if (typeof Audio === 'undefined') {
    return null;
  }

  try {
    return new Audio(src);
  } catch (error) {
    console.error(`Could not initialize audio for ${src}`, error);
    return null;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [neonMode, setNeonMode] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false); 

  // --- EFECTO DE BRILLO ---
  useEffect(() => {
    // Aplicamos el filtro directamente al elemento raíz del documento
    // Esto afectará a toda la webapp
    document.documentElement.style.filter = `brightness(${brightness}%)`; // Apply brightness filter to the entire app
  }, [brightness]); // Se ejecuta cada vez que mueves el slider de brillo

  // Inicializar música de fondo
  useEffect(() => {
    const audio = createAudioSafely('/sounds/gameb.mp3');
    if (!audio) {
      bgMusicRef.current = null;
      return undefined;
    }

    audio.loop = true;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Sincronizar volumen y silencio
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = volume / 100;
      bgMusicRef.current.muted = isMuted;
      if (hasInteracted && !isMuted && volume > 0) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [volume, isMuted, hasInteracted]);

  const toggleNeonMode = () => setNeonMode(!neonMode);

  const playSound = (soundFile: string) => {
    if (!hasInteracted) setHasInteracted(true); 
    if (isMuted) return;

    const audio = createAudioSafely(`/sounds/${soundFile}`);
    if (!audio) {
      return;
    }

    try {
      audio.volume = volume / 100;
      const playPromise = audio.play();
      playPromise?.catch(err => console.error("Error en sonido FX:", err));
    } catch (error) {
      console.error("Error en sonido FX:", error);
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      brightness, setBrightness,
      colorBlindMode, setColorBlindMode,
      neonMode, toggleNeonMode,
      volume, setVolume,
      isMuted, setIsMuted,
      playSound 
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
