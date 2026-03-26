import React, { createContext, useContext, useState, useEffect } from 'react'; // React core hooks

interface SettingsContextType {
  brightness: number; // Brightness level 50-150
  setBrightness: (value: number) => void; // Function to update brightness
  colorBlindMode: boolean; // Color blind accessibility toggle
  setColorBlindMode: (active: boolean) => void; // Function to toggle color blind
  neonMode: boolean; // Neon visual effects toggle
  toggleNeonMode: () => void; // Function to toggle neon effects
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined); // Context definition

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [brightness, setBrightness] = useState(100); // Default brightness at 100%
  const [colorBlindMode, setColorBlindMode] = useState(false); // Default color blind off
  const [neonMode, setNeonMode] = useState(false); // Default neon effects off

  const toggleNeonMode = () => setNeonMode(prev => !prev); // Toggle neon state logic

  useEffect(() => {
    document.body.style.filter = `brightness(${brightness}%)`; // Apply filter to body tag
  }, [brightness]);

  return (
    // We MUST include neonMode and toggleNeonMode in the value object below
    <SettingsContext.Provider value={{ 
      brightness, setBrightness, 
      colorBlindMode, setColorBlindMode, 
      neonMode, toggleNeonMode 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext); // Access context
  if (!context) throw new Error("useSettings must be used within SettingsProvider"); // Guard clause
  return context;
};