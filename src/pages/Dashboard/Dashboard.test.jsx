const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
require('@testing-library/jest-dom');

const Dashboard = require('./index.jsx');
const { ThemeProvider, createTheme } = require('@mui/material/styles');
const { AuthProvider } = require('../../contexts/AuthContext');

// Mock the auth context
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    currentUser: { uid: '123', email: 'test@test.com' },
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('../../components/widgets/CryptoWidget', () => {
  return function MockCryptoWidget({ symbol }) {
    return <div data-testid="crypto-widget">{symbol}</div>;
  };
});

const theme = createTheme();

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ThemeProvider theme={theme}>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
  });

  it('renders add widget button when empty', () => {
    renderComponent();
    expect(screen.getByText(/Add Widget/i)).toBeInTheDocument();
  });

  it('opens widget selector on add widget click', () => {
    renderComponent();
    const addButton = screen.getByText(/Add Widget/i);
    fireEvent.click(addButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays grid of widgets', () => {
    // Mock localStorage to have some widgets
    localStorage.setItem('widgets', JSON.stringify([
      { id: '1', type: 'crypto', symbol: 'BTCUSDT' },
      { id: '2', type: 'crypto', symbol: 'ETHUSDT' }
    ]));
    
    renderComponent();
    const widgets = screen.getAllByTestId('crypto-widget');
    expect(widgets).toHaveLength(2);
  });

  test('renders dashboard with loading state', () => {
    // Mock services to simulate loading
    const weatherService = require('../../services/weatherService');
    const cryptoService = require('../../services/cryptoService');
    jest.mock('../../services/weatherService');
    jest.mock('../../services/cryptoService');
    weatherService.fetchWeatherData.mockResolvedValue(null);
    cryptoService.fetchCryptoData.mockResolvedValue(null);

    renderComponent();

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('renders dashboard with widget data', async () => {
    // Mock service responses
    const mockWeatherData = {
      current: {
        temp: 25,
        description: 'Sunny',
        icon: '01d'
      }
    };

    const mockCryptoData = [
      {
        id: 'bitcoin',
        name: 'Bitcoin',
        current_price: 50000,
        price_change_percentage_24h: 2.5
      }
    ];

    const weatherService = require('../../services/weatherService');
    const cryptoService = require('../../services/cryptoService');
    jest.mock('../../services/weatherService');
    jest.mock('../../services/cryptoService');
    weatherService.fetchWeatherData.mockResolvedValue(mockWeatherData);
    cryptoService.fetchCryptoData.mockResolvedValue(mockCryptoData);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Bitcoin/i)).toBeInTheDocument();
      expect(screen.getByText(/Sunny/i)).toBeInTheDocument();
    });
  });

  test('handles widget errors', async () => {
    // Mock services to simulate errors
    const weatherService = require('../../services/weatherService');
    const cryptoService = require('../../services/cryptoService');
    jest.mock('../../services/weatherService');
    jest.mock('../../services/cryptoService');
    weatherService.fetchWeatherData.mockRejectedValue(new Error('Weather fetch failed'));
    cryptoService.fetchCryptoData.mockRejectedValue(new Error('Crypto fetch failed'));

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  test('allows adding and removing widgets', async () => {
    renderComponent();

    // Open widget selector
    const addWidgetButton = screen.getByText(/add widget/i);
    fireEvent.click(addWidgetButton);

    // Select a widget type
    const cryptoWidgetOption = screen.getByText(/crypto/i);
    fireEvent.click(cryptoWidgetOption);

    // Verify widget is added
    await waitFor(() => {
      expect(screen.getByTestId('crypto-widget')).toBeInTheDocument();
    });

    // Remove widget
    const removeWidgetButton = screen.getByLabelText(/remove widget/i);
    fireEvent.click(removeWidgetButton);

    // Verify widget is removed
    await waitFor(() => {
      expect(screen.queryByTestId('crypto-widget')).not.toBeInTheDocument();
    });
  });
});
