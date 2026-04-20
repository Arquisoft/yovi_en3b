import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface ScoreData {
  turn: number;
  blue: number;
  red: number;
}

interface MatchGraphProps {
  data: ScoreData[];
}

export const MatchGraph: React.FC<MatchGraphProps> = ({ data }) => {
  // Si no hay datos, no dibujamos nada para no romper la UI
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '250px', margin: '20px 0' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
        Evolución de la Partida
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          
          <XAxis 
            dataKey="turn" 
            tick={{ fill: 'currentColor' }} 
            tickLine={false}
          />
          
          <YAxis 
            domain={['dataMin - 2', 'dataMax + 2']} 
            tick={{ fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />
          
          {/* El Tooltip muestra los datos al pasar el ratón */}
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          />
          <Legend verticalAlign="top" height={36}/>
          
          {/* Línea Azul (Jugador 1) */}
          <Line 
            type="monotone" 
            dataKey="blue" 
            name="Azul" 
            stroke="var(--player1-color, #3b82f6)" 
            strokeWidth={3} 
            dot={{ r: 3 }} 
            activeDot={{ r: 6 }} 
          />
          
          {/* Línea Roja (Jugador 2) */}
          <Line 
            type="monotone" 
            dataKey="red" 
            name="Rojo" 
            stroke="var(--player2-color, #ef4444)" 
            strokeWidth={3} 
            dot={{ r: 3 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};