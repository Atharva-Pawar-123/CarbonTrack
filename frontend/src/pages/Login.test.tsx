import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import { useAuthStore } from '../hooks/useAuthStore';
import { describe, it, expect, vi } from 'vitest';

vi.mock('../hooks/useAuthStore', () => ({
  useAuthStore: vi.fn(),
}));

describe('Login Component', () => {
  it('renders login form correctly', () => {
    (useAuthStore as any).mockReturnValue({ login: vi.fn(), error: null, isLoading: false });
    
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByText('Email')).toBeDefined();
    expect(screen.getByText('Password')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeDefined();
  });
});

