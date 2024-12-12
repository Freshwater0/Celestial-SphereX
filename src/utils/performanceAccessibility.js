import { axe } from 'jest-axe';

/**
 * Performance and Accessibility Testing Utility
 */
export const PerformanceAccessibilityTester = {
  /**
   * Run accessibility checks on a component
   * @param {React.Component} component - React component to test
   * @returns {Promise<Object>} Accessibility test results
   */
  async checkAccessibility(component) {
    const results = await axe(component);
    return {
      passed: results.violations.length === 0,
      violations: results.violations
    };
  },

  /**
   * Measure component render performance
   * @param {Function} renderFunction - Function that renders the component
   * @returns {Object} Performance metrics
   */
  measureRenderPerformance(renderFunction) {
    const start = performance.now();
    renderFunction();
    const end = performance.now();

    return {
      renderTime: end - start,
      isOptimal: end - start < 16 // Less than one frame (60 fps)
    };
  },

  /**
   * Check for unnecessary re-renders
   * @param {React.Component} component - Component to analyze
   * @param {number} [threshold=3] - Maximum acceptable number of re-renders
   * @returns {Object} Re-render analysis
   */
  analyzeReRenders(component, threshold = 3) {
    const renderCount = component.getRenderCount();
    return {
      renderCount,
      isOptimal: renderCount <= threshold
    };
  },

  /**
   * Simulate various device and browser conditions
   * @param {Object} config - Simulation configuration
   */
  simulateConditions(config = {}) {
    const defaultConfig = {
      networkSpeed: 'slow3g',
      deviceType: 'mobile',
      screenSize: { width: 375, height: 667 }
    };

    const finalConfig = { ...defaultConfig, ...config };
    
    // Simulate network conditions
    if (window.navigator.connection) {
      window.navigator.connection.downlink = finalConfig.networkSpeed === 'slow3g' ? 0.1 : 10;
    }

    // Simulate screen size
    window.innerWidth = finalConfig.screenSize.width;
    window.innerHeight = finalConfig.screenSize.height;
  }
};

export default PerformanceAccessibilityTester;
