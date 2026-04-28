// UBICACIÓN: webapp/src/i18n/Provider.tsx
import React, { useState, useEffect } from 'react';
import { I18nContext } from './useTranslation'; // Ensure this path is correct
import { type Language, DEFAULT_LANGUAGE, getTranslation } from './config.ts'; // Import config helpers

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE); // State for the current language
  const [isLoaded, setIsLoaded] = useState(false); // State to track if the initial language load is complete

  // Load language from localStorage on mount to persist user preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language | null;
    // Check if the saved language is valid (es, en, or tr)
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en' || savedLanguage === 'tr')) {
      setLanguageState(savedLanguage);
    }
    setIsLoaded(true); // Mark as loaded after checking localStorage
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang); // Update state
    localStorage.setItem('language', lang); // Persist to storage
  };

  // If not loaded, we return null or a loading spinner to prevent children from 
  // accessing the context before it is ready.
  if (!isLoaded) {
    return null; // Or <div className="loading">Loading...</div>
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: getTranslation(language), // Dynamically fetch the translation object
      }}
    >
      {children} 
    </I18nContext.Provider>
  );
};