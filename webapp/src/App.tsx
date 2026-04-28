import './App.css'; // Importing global styles
import { I18nProvider } from './i18n/Provider'; // Language provider
import { Routes, Route, Navigate } from 'react-router-dom'; // Routing components
import MainMenu from './components/MainMenu'; // Main menu screen
import GameScreen from './components/GameScreen/GameScreen'; // Main game screen
import RegisterForm from './components/Login/RegisterForm'; // Login form
import SignUpForm from './components/SignUp/SignUpForm'; // Registration form
import HistoryPage from './components/HistoryPage/HistoryPage'; // Match history
import { SettingsProvider, useSettings } from './context/SettingsContext'; // Context and Hook

// 1. Content component that consumes the settings
const AppContent = () => {
  const { neonMode, colorBlindMode } = useSettings(); // Get global visual states (using settings context)

  return (
    <div className={`App ${neonMode ? 'neon-mode' : ''} ${colorBlindMode ? 'color-blind' : ''}`}>
      <Routes>
        <Route path="/" element={<RegisterForm />} /> {/* Initial route is the login form */}
        <Route path="/menu" element={<MainMenu />} /> {/* Navigation to main menu */}
        <Route path="/game" element={<GameScreen />} /> {/* Navigation to game board */}
        <Route path="/signup" element={<SignUpForm />} /> {/* Navigation to registration */}
        <Route path="/history" element={<HistoryPage />} /> {/* Navigation to match history */}
        <Route path="*" element={<Navigate to="/" />} /> {/* Fallback to login for unknown routes */}
      </Routes>
    </div>
  );
};

// 2. Main App: I18nProvider MUST be the outermost to be accessible everywhere
function App() {
  return (
    <I18nProvider> {/* Wrapped first to ensure translations are available in all sub-contexts and components */}
      <SettingsProvider> {/* Settings can now safely use i18n if needed */}
        <AppContent /> 
      </SettingsProvider>
    </I18nProvider>
  );
}

export default App;