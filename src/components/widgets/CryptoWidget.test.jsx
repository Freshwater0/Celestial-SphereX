const React = require('react');
const { render, screen, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');
const CryptoWidget = require('./CryptoWidget');
const { ThemeProvider, createTheme } = require('@mui/material/styles');
const cryptoService = require('../../services/cryptoService');

// Mock the crypto service
jest.mock('../../services/cryptoService');

const theme = createTheme();

describe('CryptoWidget', () => {
  beforeEach(() => {
    // Reset mock implementation before each test
    cryptoService.fetchCryptoData.mockReset();
  });

  test('renders loading state initially', () => {
    cryptoService.fetchCryptoData.mockResolvedValue([]);

    render(
      <ThemeProvider theme={theme}>
        <CryptoWidget />
      </ThemeProvider>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders crypto data after fetching', async () => {
    const mockCryptoData = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        current_price: 50000,
        price_change_percentage_24h: 2.5
      },
      {
        id: 'ethereum',
        name: 'Ethereum',
        current_price: 3000,
        price_change_percentage_24h: -1.2
      }
    ];

    cryptoService.fetchCryptoData.mockResolvedValue(mockCryptoData);

    render(
      <ThemeProvider theme={theme}>
        <CryptoWidget />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Bitcoin/i)).toBeInTheDocument();
      expect(screen.getByText(/Ethereum/i)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    cryptoService.fetchCryptoData.mockRejectedValue(new Error('Failed to fetch'));

    render(
      <ThemeProvider theme={theme}>
        <CryptoWidget />
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
