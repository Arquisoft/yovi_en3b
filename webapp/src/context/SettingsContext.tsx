// UBICACIÓN: webapp/src/context/SettingsContext.tsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

interface SettingsContextType {
  brightness: number;
  setBrightness: (v: number) => void;
  colorBlindMode: boolean;
  setColorBlindMode: (v: boolean) => void;
  neonMode: boolean;
  toggleNeonMode: () => void;
  volume: number; // Porcentaje de volumen (0-100)
  setVolume: (v: number) => void; // Cambiar volumen
  isMuted: boolean; // Estado de silencio
  setIsMuted: (v: boolean) => void; // Alternar silencio
  playSound: (sound: string) => void; 
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(100);
  const [colorBlindMode, setColorBlindMode] = useState(false);
  const [neonMode, setNeonMode] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false); 

  // Inicializar música de fondo
  useEffect(() => {
    const audio = new Audio('/sounds/gameb.mp3'); // Nombre del archivo actualizado
    audio.loop = true;
    bgMusicRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Sincronizar volumen y silencio
  useEffect(() => {
    if (bgMusicRef.current) {
      bgMusicRef.current.volume = volume / 100; // Convertir a escala 0.0 - 1.0
      bgMusicRef.current.muted = isMuted;
      
      // Si el usuario interactuó y no está silenciado, intentar reproducir
      if (hasInteracted && !isMuted && volume > 0) {
        bgMusicRef.current.play().catch(() => {});
      }
    }
  }, [volume, isMuted, hasInteracted]);

  const toggleNeonMode = () => setNeonMode(!neonMode);

  const playSound = (soundFile: string) => {
    // La primera interacción del usuario desbloquea el audio del navegador
    if (!hasInteracted) setHasInteracted(true); 

    if (isMuted) return;
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = volume / 100; // Los efectos también respetan el slider
    audio.play().catch(err => console.error("Error en sonido FX:", err));
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