import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MatchGraph } from '../components/GameScreen/MatchGraph';

// 1. EL TRUCO: Mockeamos ResponsiveContainer para que los tests no fallen 
// al intentar calcular el ancho/alto de la pantalla en una consola de texto.
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    ),
  };
});

describe('MatchGraph Component', () => {
  
  it('no debería renderizar nada (devolver null) si la lista de datos está vacía', () => {
    // Renderizamos el componente con un array vacío
    const { container } = render(<MatchGraph data={[]} />);
    
    // Comprobamos que el contenedor de React está completamente vacío
    expect(container.firstChild).toBeNull();
  });

  it('no debería renderizar nada si los datos son undefined o null', () => {
    // Usamos @ts-ignore para forzar un error de tipado y ver cómo reacciona
    // @ts-ignore
    const { container } = render(<MatchGraph data={undefined} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('debería mostrar el título y la gráfica cuando recibe datos válidos', () => {
    // Preparamos unos datos ficticios simulando un par de turnos
    const mockData = [
      { turn: 1, blue: 24, red: 22 },
      { turn: 2, blue: 22, red: 22 },
      { turn: 3, blue: 20, red: 21 },
    ];

    render(<MatchGraph data={mockData} />);

    // 1. Comprobamos que el título se pinta correctamente
    expect(screen.getByText('Evolución de la Partida')).toBeInTheDocument();

    // 2. Comprobamos que nuestro mock del contenedor se ha renderizado
    expect(screen.getByTestId('mock-responsive-container')).toBeInTheDocument();
  });
});