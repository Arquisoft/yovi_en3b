import './App.css'; // Importing global styles
import { Routes, Route, Navigate } from 'react-router-dom'; // Importing routing components
import MainMenu from './components/MainMenu'; // Your main menu component
import GameScreen from './components/GameScreen/GameScreen'; // Your game screen component
import RegisterForm from './components/Login/RegisterForm'; // Your colleague's login component
import SignUpForm from './components/SignUp/SignUpForm';

function App() {
  return (
    <Routes>
      {/* 1. Login/Register is now the entry point (Colleague's part) */}
      <Route path="/" element={<RegisterForm />} /> 

      {/* 2. Main Menu with all your buttons (Your part) */}
      <Route path="/menu" element={<MainMenu />} /> 

      {/* 3. The actual Game screen (Your part) */}
      <Route path="/game" element={<GameScreen />} />

      {/* 4. Redirect any unknown route to login */}
      <Route path="*" element={<Navigate to="/" />} />

      {/* 5. Sign Up route for new users */}          
      <Route path="/signup" element={<SignUpForm />} />
    </Routes>
  );
}

export default App;