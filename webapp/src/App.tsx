import './App.css'; // Importing global styles
import { I18nProvider } from './i18n/Provider'; // Language provider
import { Routes, Route, Navigate } from 'react-router-dom'; // Routing components
import MainMenu from './components/MainMenu'; // Main menu screen
import GameScreen from './components/GameScreen/GameScreen'; // Main game screen
import RegisterForm from './components/Login/RegisterForm'; // Login form
import SignUpForm from './components/SignUp/SignUpForm'; // Registration form
import HistoryPage from './components/HistoryPage/HistoryPage'; // Match history
import { SettingsProvider, useSettings } from './context/SettingsContext'; // Context and Hook

// 1. We create a separate component for the main app content that will use the settings context. 
// This way, we can wrap it with the provider in the main App function without issues.
const AppContent = () => {
  const { neonMode, colorBlindMode } = useSettings(); // Get global visual states

  return (
    <div className={`App ${neonMode ? 'neon-mode' : ''} ${colorBlindMode ? 'color-blind' : ''}`}>
      <Routes>
        <Route path="/" element={<RegisterForm />} /> 
        <Route path="/menu" element={<MainMenu />} /> 
        <Route path="/game" element={<GameScreen />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};



// 2.We wrapped the entire AppContent with both Providers to ensure global state is available
function App() {
  return (
    <I18nProvider> 
      <SettingsProvider>
        <AppContent /> 
      </SettingsProvider>
    </I18nProvider>
  );
}

export default App;