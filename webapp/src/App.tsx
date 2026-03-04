import './App.css'
import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'; 
import GameScreen from './components/GameScreen/GameScreen'; 
import RegisterForm from './components/Login/RegisterForm'; // Import the login form from its new folder

function App() {
  return (
    <Routes>
      {/* The first thing the user sees is the login/register form */}
      <Route path="/" element={<RegisterForm />} /> 
      
      {/* After login, the user is sent here */}
      <Route path="/menu" element={<MainMenu />} /> 
      
      <Route path="/game" element={<GameScreen />} />
    </Routes>
  );
}

export default App;