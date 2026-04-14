import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Dashboard from '../src/app/page'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    };
  }
}));

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([{ id: 1, name: "Test Farm", location: "North" }]),
  })
) as jest.Mock;

describe('Dashboard component', () => {
  it('renders the Dashboard overview text', () => {
    render(<Dashboard />)
    const heading = screen.getByText(/Farm Overview/i)
    expect(heading).toBeInTheDocument()
  })
})
