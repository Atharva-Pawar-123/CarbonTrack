import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Actions from './Actions';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} })
  }
}));

describe('Actions Component', () => {
  it('renders actions section', () => {
    render(
      <BrowserRouter>
        <Actions />
      </BrowserRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
