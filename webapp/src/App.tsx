import './App.css'
import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'; // Importamos nueva pantalla
import GameScreen from './components/GameScreen/GameScreen'; 
import HistoryPage from './pages/HistoryPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/game" element={<GameScreen />} />
    </Routes>
  );
}

export default App;
