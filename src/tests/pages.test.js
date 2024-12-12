const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const { MemoryRouter } = require('react-router-dom');
const { axe } = require('jest-axe');

// Import pages
const LoginPage = require('../pages/Login/index');
const SignupPage = require('../pages/Signup/index');
const DashboardPage = require('../pages/Dashboard/index');
const ProfilePage = require('../pages/Profile/index');
const SettingsPage = require('../pages/Settings/index');
const AnalyticsPage = require('../pages/AnalyticsPage');
const DataPage = require('../pages/DataPage');
const BillingPage = require('../pages/Billing/index');

// Mock services and contexts
const { AuthProvider } = require('../contexts/AuthContext');
const ErrorHandler = require('../utils/errorHandler');
const PerformanceAccessibilityTester = require('../utils/performanceAccessibility');

// Utility to wrap components with necessary providers
const renderWithProviders = (Component, props = {}) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Frontend Page Test Suite', () => {
  // Authentication Pages
  describe('Login Page', () => {
    it('renders login page', () => {
      renderWithProviders(LoginPage);
      expect(screen.getByText(/login/i)).toBeInTheDocument();
    });

    it('handles login form submission', async () => {
      const mockLogin = jest.fn();
      renderWithProviders(LoginPage, { onLogin: mockLogin });

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });

    it('validates login form inputs', () => {
      renderWithProviders(LoginPage);
      
      fireEvent.click(screen.getByRole('button', { name: /login/i }));
      
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('passes accessibility checks', async () => {
      const { container } = renderWithProviders(LoginPage);
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });
  });

  // Signup Page
  describe('Signup Page', () => {
    it('renders signup page', () => {
      renderWithProviders(SignupPage);
      expect(screen.getByText(/create account/i)).toBeInTheDocument();
    });

    it('handles signup form submission', async () => {
      const mockSignup = jest.fn();
      renderWithProviders(SignupPage, { onSignup: mockSignup });

      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'newuser@example.com' } });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'securePassword123!' } });
      fireEvent.click(screen.getByRole('button', { name: /signup/i }));

      await waitFor(() => {
        expect(mockSignup).toHaveBeenCalledWith('newuser@example.com', 'securePassword123!');
      });
    });
  });

  // Dashboard Page
  describe('Dashboard Page', () => {
    it('renders dashboard with key metrics', () => {
      renderWithProviders(DashboardPage);
      
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      expect(screen.getByText(/recent activity/i)).toBeInTheDocument();
    });

    it('measures dashboard render performance', () => {
      const renderMetrics = PerformanceAccessibilityTester.measureRenderPerformance(() => {
        renderWithProviders(DashboardPage);
      });

      expect(renderMetrics.isOptimal).toBe(true);
    });
  });

  // Profile Page
  describe('Profile Page', () => {
    it('renders user profile', () => {
      renderWithProviders(ProfilePage);
      expect(screen.getByText(/personal information/i)).toBeInTheDocument();
    });

    it('allows profile updates', async () => {
      const mockUpdateProfile = jest.fn();
      renderWithProviders(ProfilePage, { onUpdateProfile: mockUpdateProfile });

      fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Name' } });
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith(expect.objectContaining({
          name: 'New Name'
        }));
      });
    });
  });

  // Settings Page
  describe('Settings Page', () => {
    it('renders settings options', () => {
      renderWithProviders(SettingsPage);
      expect(screen.getByText(/account settings/i)).toBeInTheDocument();
      expect(screen.getByText(/preferences/i)).toBeInTheDocument();
    });
  });

  // Analytics Page
  describe('Analytics Page', () => {
    it('renders analytics dashboard', () => {
      renderWithProviders(AnalyticsPage);
      expect(screen.getByText(/data insights/i)).toBeInTheDocument();
    });
  });

  // Data Page
  describe('Data Page', () => {
    it('renders data management interface', () => {
      renderWithProviders(DataPage);
      expect(screen.getByText(/data explorer/i)).toBeInTheDocument();
    });
  });

  // Billing Page
  describe('Billing Page', () => {
    it('renders billing information', () => {
      renderWithProviders(BillingPage);
      expect(screen.getByText(/billing details/i)).toBeInTheDocument();
      expect(screen.getByText(/payment methods/i)).toBeInTheDocument();
    });
  });

  // Global Error Handling
  describe('Error Handling', () => {
    it('handles network errors gracefully', () => {
      const mockErrorHandler = jest.spyOn(ErrorHandler, 'handleNetworkError');
      
      // Simulate network error
      const networkError = new Error('Network Error');
      ErrorHandler.handleNetworkError(networkError);

      expect(mockErrorHandler).toHaveBeenCalledWith(networkError);
    });
  });
});

// Performance and Accessibility Global Check
describe('Global Performance and Accessibility', () => {
  const pages = [
    LoginPage, 
    SignupPage, 
    DashboardPage, 
    ProfilePage, 
    SettingsPage, 
    AnalyticsPage, 
    DataPage, 
    BillingPage
  ];

  pages.forEach(Page => {
    it(`checks performance and accessibility for ${Page.name}`, async () => {
      const { container } = renderWithProviders(Page);
      
      // Performance Check
      const renderMetrics = PerformanceAccessibilityTester.measureRenderPerformance(() => {
        renderWithProviders(Page);
      });
      expect(renderMetrics.isOptimal).toBe(true);

      // Accessibility Check
      const accessibilityResults = await PerformanceAccessibilityTester.checkAccessibility(container);
      expect(accessibilityResults.passed).toBe(true);
    });
  });
});
