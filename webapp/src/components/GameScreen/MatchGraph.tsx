import React from 'react';

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
    <div style={{ width: '100%', margin: '20px 0' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.2rem' }}>
        Evolucion de la Partida
      </h3>
      <p style={{ textAlign: 'center', opacity: 0.8 }}>
        Turnos registrados: {data.length}
      </p>
    </div>
  );
};
