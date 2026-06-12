import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { useAuthStore } from '../hooks/useAuthStore';
import { describe, it, expect, vi } from 'vitest';

// Mock the auth store
vi.mock('../hooks/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Layout Component', () => {
  it('renders correctly for unauthenticated user', () => {
    (useAuthStore as any).mockReturnValue({ user: null, logout: vi.fn() });
    
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText('CarbonTrack')).toBeDefined();
    expect(screen.getByText('Login')).toBeDefined();
    expect(screen.getByText('Register')).toBeDefined();
  });

  it('renders correctly for authenticated user', () => {
    (useAuthStore as any).mockReturnValue({ 
      user: { display_name: 'Test User' }, 
      logout: vi.fn() 
    });
    
    render(
      <MemoryRouter>
        <Layout />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Hi, Test User')).toBeDefined();
    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Calculator')).toBeDefined();
    expect(screen.getByText('Logout')).toBeDefined();
  });
});
