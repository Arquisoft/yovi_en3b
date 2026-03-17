import './App.css'; // Importing global styles
import { I18nProvider } from './i18n/Provider'; // Envolvente de idiomas
import { Routes, Route, Navigate } from 'react-router-dom'; // Componentes de rutas
import MainMenu from './components/MainMenu'; // Menú principal
import GameScreen from './components/GameScreen/GameScreen'; // Pantalla de juego
import RegisterForm from './components/Login/RegisterForm'; // Formulario de Login
import SignUpForm from './components/SignUp/SignUpForm'; // Formulario de registro
import HistoryPage from './components/HistoryPage/HistoryPage'; // Historial

function App() {
  return (
    <I18nProvider> 
      
        <Routes>
          {/* 1. Entrada de la App: Login */}
          <Route path="/" element={<RegisterForm />} /> 

          {/* 2. Menú Principal */}
          <Route path="/menu" element={<MainMenu />} /> 

          {/* 3. Pantalla de Juego */}
          <Route path="/game" element={<GameScreen />} />

          {/* 4. Registro de nuevos usuarios */}          
          <Route path="/signup" element={<SignUpForm />} />
          
          {/* 5. Página de historial */}          
          <Route path="/history" element={<HistoryPage />} />

          {/* 6. Redirección por defecto a Login si la ruta no existe */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      
    </I18nProvider>
  );
}

export default App;