import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CryptoIcon } from '../../../components/shared/CryptoIcon';

describe('CryptoIcon Component', () => {
  it('should render Bitcoin icon', () => {
    render(<CryptoIcon symbol="BTC/USD" />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-orange-400');
  });

  it('should render Ethereum icon', () => {
    render(<CryptoIcon symbol="ETH/USD" />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-indigo-500');
  });

  it('should render Solana icon', () => {
    render(<CryptoIcon symbol="SOL/USD" />);
    const icon = document.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('text-green-400');
  });

  it('should render default icon for unknown symbol', () => {
    const { container } = render(<CryptoIcon symbol="UNKNOWN/USD" />);
    const icon = container.firstChild;
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveClass('bg-gray-400');
  });

  it('should apply custom className', () => {
    const { container } = render(<CryptoIcon symbol="BTC/USD" className="custom-class" />);
    const icon = container.firstChild;
    expect(icon).toHaveClass('custom-class');
  });

  it('should apply default size classes', () => {
    const { container } = render(<CryptoIcon symbol="BTC/USD" />);
    const icon = container.firstChild;
    expect(icon).toHaveClass('w-6', 'h-6');
  });
});
