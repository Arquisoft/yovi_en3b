
import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import HistoryPage from '../components/HistoryPage/HistoryPage';

describe('HistoryPage', () => {
  test('renders placeholder content', () => {
    render(<HistoryPage />);
    expect(screen.getByText('History')).toBeDefined();
    expect(screen.getByText(/Work in progress/i)).toBeDefined();
  });
});
