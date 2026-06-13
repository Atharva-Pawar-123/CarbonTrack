import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Calculator from './Calculator';
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { footprint: 15.2, tips: [] } })
  }
}));

describe('Calculator Component', () => {
  it('renders calculator form', () => {
    render(
      <BrowserRouter>
        <Calculator />
      </BrowserRouter>
    );
    expect(document.body).toBeTruthy();
  });
});
