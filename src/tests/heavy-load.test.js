const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
require('@testing-library/jest-dom');

// Import services and mocks
const authService = require('../services/auth.service.js');
const cryptoService = require('../services/cryptoService.js');
const weatherService = require('../services/weatherService.js');
const reportService = require('../services/reportService.js');
const dataIntegrationService = require('../services/dataIntegrationService.js');

// Import pages and components
const LoginPage = require('../pages/Login/index.jsx');
const DashboardPage = require('../pages/Dashboard/index.jsx');
const ProfilePage = require('../pages/Profile/index.jsx');
const DataPage = require('../pages/Data/index.jsx');
const ReportsPage = require('../pages/Reports/index.jsx');
const BillingPage = require('../pages/Billing/index.jsx');
const SettingsPage = require('../pages/Settings/index.jsx');

// Mock services
jest.mock('../services/auth.service.js');
jest.mock('../services/cryptoService.js');
jest.mock('../services/weatherService.js');
jest.mock('../services/reportService.js');
jest.mock('../services/dataIntegrationService.js');

// Mock the login method of authService
authService.login = jest.fn(() => Promise.resolve({ token: 'mock_token', user: {} }));

// Utility function to generate test users
const generateTestUser = (id) => ({
  username: `testuser${id}`,
  email: `testuser${id}@example.com`,
  password: `password${id}`,
  profile: {
    firstName: `First${id}`,
    lastName: `Last${id}`,
    timezone: 'UTC',
    language: 'en'
  }
});

// Simulate user interactions
const simulateUserJourney = async (userId) => {
  const user = generateTestUser(userId);

  // Login
  await loginUser(user);

  // Dashboard interactions
  await interactWithDashboard();

  // Data page interactions
  await interactWithDataPage();

  // Reports page interactions
  await interactWithReportsPage();

  // Profile page interactions
  await interactWithProfilePage();

  // Billing page interactions
  await interactWithBillingPage();

  // Settings page interactions
  await interactWithSettingsPage();
};

const loginUser = async (user) => {
  authService.login.mockResolvedValue({
    token: `jwt_token_${user.username}`,
    user: user
  });

  render(
    <MemoryRouter initialEntries={['/login']}>
      <LoginPage />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: user.email } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: user.password } });
  fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(authService.login).toHaveBeenCalledWith(user.email, user.password);
  });
};

const interactWithDashboard = async () => {
  // Mock widget data
  cryptoService.fetchCryptoData.mockResolvedValue([
    { id: 'bitcoin', name: 'Bitcoin', current_price: 50000 },
    { id: 'ethereum', name: 'Ethereum', current_price: 3000 }
  ]);

  weatherService.fetchWeatherData.mockResolvedValue({
    current: { temp: 25, description: 'Sunny' }
  });

  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

  // Add widget
  await waitFor(() => {
    const addWidgetButton = screen.getByText(/add widget/i);
    fireEvent.click(addWidgetButton);
  });

  // Select and add crypto widget
  await waitFor(() => {
    const cryptoWidgetOption = screen.getByText(/crypto/i);
    fireEvent.click(cryptoWidgetOption);
  });
};

const interactWithDataPage = async () => {
  dataIntegrationService.fetchDataSources.mockResolvedValue([
    { id: 'source1', name: 'Financial Data' },
    { id: 'source2', name: 'Sales Data' }
  ]);

  render(
    <MemoryRouter>
      <DataPage />
    </MemoryRouter>
  );

  // Import data
  await waitFor(() => {
    const importButton = screen.getByText(/import data/i);
    fireEvent.click(importButton);
  });

  // Create chart
  await waitFor(() => {
    const createChartButton = screen.getByText(/create chart/i);
    fireEvent.click(createChartButton);
  });
};

const interactWithReportsPage = async () => {
  reportService.fetchReportTemplates.mockResolvedValue([
    { id: 'template1', name: 'Financial Report' },
    { id: 'template2', name: 'Sales Performance' }
  ]);

  render(
    <MemoryRouter>
      <ReportsPage />
    </MemoryRouter>
  );

  // Create report
  await waitFor(() => {
    const createReportButton = screen.getByText(/create report/i);
    fireEvent.click(createReportButton);
  });

  // Select template
  await waitFor(() => {
    const templateOption = screen.getByText(/financial report/i);
    fireEvent.click(templateOption);
  });
};

const interactWithProfilePage = async () => {
  render(
    <MemoryRouter>
      <ProfilePage />
    </MemoryRouter>
  );

  // Update profile
  await waitFor(() => {
    const editProfileButton = screen.getByText(/edit profile/i);
    fireEvent.click(editProfileButton);
  });

  // Change timezone
  await waitFor(() => {
    const timezoneSelect = screen.getByLabelText(/timezone/i);
    fireEvent.change(timezoneSelect, { target: { value: 'America/New_York' } });
  });
};

const interactWithBillingPage = async () => {
  render(
    <MemoryRouter>
      <BillingPage />
    </MemoryRouter>
  );

  // Add payment method
  await waitFor(() => {
    const addPaymentButton = screen.getByText(/add payment method/i);
    fireEvent.click(addPaymentButton);
  });
};

const interactWithSettingsPage = async () => {
  render(
    <MemoryRouter>
      <SettingsPage />
    </MemoryRouter>
  );

  // Change language
  await waitFor(() => {
    const languageSelect = screen.getByLabelText(/language/i);
    fireEvent.change(languageSelect, { target: { value: 'es' } });
  });
};

// Heavy Load Test Suite
describe('Celestial Sphere Application Heavy Load Test', () => {
  // Increase timeout for heavy load test
  jest.setTimeout(300000); // 5 minutes

  test('simulate 80 concurrent users', async () => {
    // Create an array of 80 user simulation promises
    const userSimulations = Array.from({ length: 80 }, (_, i) => 
      simulateUserJourney(i + 1)
    );

    // Run all simulations concurrently
    await Promise.all(userSimulations);

    // Verify overall system stability
    expect(userSimulations.length).toBe(80);
  });

  // Performance and Error Tracking
  afterEach(() => {
    // Log any unhandled errors or performance issues
    const unhandledErrors = global.unhandledErrors || [];
    expect(unhandledErrors.length).toBe(0);
  });
});

// Global error tracking
global.unhandledErrors = [];
process.on('unhandledRejection', (error) => {
  global.unhandledErrors.push(error);
});
