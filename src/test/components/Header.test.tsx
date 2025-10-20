import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Header from '../../../components/Header';

describe('Header Component', () => {
  const mockProps = {
    selectedPair: { id: 'BTC/USD' as const, name: 'Bitcoin / USD', base: 'BTC', quote: 'USD' },
    selectedInterval: { id: '1h' as const, minutes: 60 },
    setSelectedPair: () => {},
    setSelectedInterval: () => {},
    onIndicatorsClick: () => {},
    theme: 'dark' as const,
    onToggleTheme: () => {},
  };

  it('should render the app title', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Crypto Insight AI')).toBeInTheDocument();
  });

  it('should display selected trading pair', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText(/BTC\/USD/)).toBeInTheDocument();
  });

  it('should display available intervals', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('1m')).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('1h')).toBeInTheDocument();
    expect(screen.getByText('4h')).toBeInTheDocument();
    expect(screen.getByText('1D')).toBeInTheDocument();
  });

  it('should display indicators button', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Indicators')).toBeInTheDocument();
  });

  it('should display theme toggle button', () => {
    render(<Header {...mockProps} />);
    const themeButton = screen.getByRole('button', { name: /switch/i });
    expect(themeButton).toBeInTheDocument();
  });

  it('should show sun icon in dark mode', () => {
    render(<Header {...mockProps} theme="dark" />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).toBeInTheDocument();
  });

  it('should show moon icon in light mode', () => {
    render(<Header {...mockProps} theme="light" />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).toBeInTheDocument();
  });
});
