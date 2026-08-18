import { render, screen, waitFor } from '@testing-library/react';
import Home from '../src/app/page';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
  })
) as jest.Mock;

describe('Home Page', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('renders the header and simulate button', async () => {
    render(<Home />);
    
    expect(screen.getByText('DevOps Incident Copilot')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simulate Outage/i })).toBeInTheDocument();
  });

  it('displays All Systems Operational when there are no incidents', async () => {
    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('All Systems Operational')).toBeInTheDocument();
    });
  });

  it('displays incidents when fetched', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve([{
          id: '123',
          title: 'High Latency Detected',
          description: 'A query is slow',
          status: 'OPEN',
          rootCause: null,
          suggestedFix: null
        }]),
      })
    );

    render(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText('High Latency Detected')).toBeInTheDocument();
    });
  });
});
