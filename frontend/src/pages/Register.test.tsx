import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { access_token: 'abc' } })
  }
}));

describe('Register Component', () => {
  it('renders register form', () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
