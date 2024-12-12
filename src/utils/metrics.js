const logger = require('./logger');
const client = require('prom-client');

class Metrics {
  constructor() {
    // Enable Prometheus metrics collection
    client.collectDefaultMetrics();

    // Custom metrics for report scheduling and templates
    this.reportScheduleCreationCounter = new client.Counter({
      name: 'report_schedule_creation_total',
      help: 'Total number of report schedules created'
    });

    this.reportTemplateCounter = new client.Counter({
      name: 'report_template_total',
      help: 'Total number of report templates',
      labelNames: ['action']
    });

    this.reportDeliveryHistogram = new client.Histogram({
      name: 'report_delivery_duration_seconds',
      help: 'Report delivery duration in seconds',
      labelNames: ['method']
    });

    this.scheduleExecutionCounter = new client.Counter({
      name: 'report_schedule_execution_total',
      help: 'Total number of report schedule executions',
      labelNames: ['status']
    });

    // Existing metrics from previous implementation
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTimeTotal: 0,
      responseTimes: [], // Keep last 1000 response times for average calculation
      statusCodes: {},
      endpoints: {},
      lastErrors: [] // Keep last 100 errors
    };
  }

  // Record a request
  recordRequest(endpoint, method) {
    this.metrics.requestCount++;
    const key = `${method}:${endpoint}`;
    this.metrics.endpoints[key] = (this.metrics.endpoints[key] || 0) + 1;
  }

  // Record response time
  recordResponseTime(time) {
    this.metrics.responseTimeTotal += time;
    this.metrics.responseTimes.push(time);
    if (this.metrics.responseTimes.length > 1000) {
      this.metrics.responseTimes.shift();
    }
  }

  // Record status code
  recordStatusCode(code) {
    this.metrics.statusCodes[code] = (this.metrics.statusCodes[code] || 0) + 1;
  }

  // Record error
  recordError(error) {
    this.metrics.errorCount++;
    this.metrics.lastErrors.unshift({
      message: error.message,
      stack: error.stack,
      timestamp: new Date()
    });
    if (this.metrics.lastErrors.length > 100) {
      this.metrics.lastErrors.pop();
    }
  }

  // New methods for advanced reporting metrics
  recordReportScheduleCreation() {
    this.reportScheduleCreationCounter.inc();
  }

  recordReportTemplateAction(action) {
    this.reportTemplateCounter.inc({ action });
  }

  recordReportDelivery(method, duration) {
    this.reportDeliveryHistogram.observe({ method }, duration);
  }

  recordScheduleExecution(status) {
    this.scheduleExecutionCounter.inc({ status });
  }

  // Prometheus metrics endpoint handler
  async getPrometheusMetrics() {
    return await client.register.metrics();
  }

  // Get average response time
  getAverageResponseTime() {
    if (this.metrics.responseTimes.length === 0) return 0;
    return this.metrics.responseTimeTotal / this.metrics.responseTimes.length;
  }

  // Get error rate
  getErrorRate() {
    if (this.metrics.requestCount === 0) return 0;
    return (this.metrics.errorCount / this.metrics.requestCount) * 100;
  }

  // Get metrics summary
  getSummary() {
    return {
      totalRequests: this.metrics.requestCount,
      totalErrors: this.metrics.errorCount,
      errorRate: this.getErrorRate(),
      averageResponseTime: this.getAverageResponseTime(),
      statusCodeDistribution: this.metrics.statusCodes,
      endpointUsage: this.metrics.endpoints,
      recentErrors: this.metrics.lastErrors.slice(0, 10) // Last 10 errors
    };
  }

  // Reset metrics
  reset() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTimeTotal: 0,
      responseTimes: [],
      statusCodes: {},
      endpoints: {},
      lastErrors: []
    };
  }
}

// Create singleton instance
const metrics = new Metrics();

module.exports = metrics;
