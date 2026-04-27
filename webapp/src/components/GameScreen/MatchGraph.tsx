import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  if (!data || data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '180px', margin: '10px 0', minWidth: '200px' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
        Evolución de la Partida
      </h3>
      <ResponsiveContainer width="100%" height={180} minWidth={200}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          
          <XAxis 
            dataKey="turn" 
            tick={{ fill: 'currentColor' }} 
            tickLine={false}
          />
          
          <YAxis 
            domain={['auto', 'auto']} 
            tick={{ fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
          />
          <Legend verticalAlign="top" height={36}/>

          <Line 
            isAnimationActive={false}
            type="monotone" 
            dataKey="blue" 
            name="P1" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={{ r: 3 }} 
            activeDot={{ r: 6 }} 
          />
          
          <Line 
            isAnimationActive={false}
            type="monotone" 
            dataKey="red" 
            name="P2" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 3 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
