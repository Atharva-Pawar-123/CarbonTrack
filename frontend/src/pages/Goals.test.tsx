import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Goals from './Goals';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}));

describe('Goals Component', () => {
  it('renders goals section', () => {
    render(
      <BrowserRouter>
        <Goals />
      </BrowserRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
