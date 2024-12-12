const { PrismaClient } = require('@prisma/client');
const AdvancedSchedulingService = require('../../src/services/advancedSchedulingService');
const logger = require('../../src/utils/logger');

describe('AdvancedSchedulingService', () => {
  let prisma;
  let schedulingService;

  beforeAll(() => {
    prisma = new PrismaClient();
    schedulingService = new AdvancedSchedulingService();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Schedule Creation', () => {
    it('should create a daily schedule', async () => {
      const scheduleData = {
        reportId: 'test-report-123',
        recurrenceType: 'DAILY',
        time: { hour: 9, minute: 0 },
        deliveryMethod: 'EMAIL',
        deliveryConfig: { email: 'test@example.com' },
        exportFormat: 'PDF'
      };

      const createdSchedule = await schedulingService.createSchedule(scheduleData);
      
      expect(createdSchedule).toBeDefined();
      expect(createdSchedule.recurrenceType).toBe('DAILY');
      expect(createdSchedule.status).toBe('ACTIVE');
    });

    it('should create a weekly schedule', async () => {
      const scheduleData = {
        reportId: 'test-report-456',
        recurrenceType: 'WEEKLY',
        specificDays: ['MON', 'FRI'],
        time: { hour: 14, minute: 30 },
        deliveryMethod: 'SLACK',
        deliveryConfig: { slackWebhook: 'https://slack.webhook' },
        exportFormat: 'EXCEL'
      };

      const createdSchedule = await schedulingService.createSchedule(scheduleData);
      
      expect(createdSchedule).toBeDefined();
      expect(createdSchedule.recurrenceType).toBe('WEEKLY');
      expect(createdSchedule.specificDays).toEqual(['MON', 'FRI']);
    });
  });

  describe('Report Export', () => {
    it('should generate PDF export', async () => {
      const mockReport = {
        id: 'test-report-789',
        name: 'Test Report',
        data: { /* mock report data */ }
      };

      const pdfExport = await schedulingService.generateReportExport(mockReport, 'PDF');
      
      expect(pdfExport).toBeDefined();
      // Add more specific PDF export checks
    });

    it('should generate Excel export', async () => {
      const mockReport = {
        id: 'test-report-101',
        name: 'Test Report',
        data: { /* mock report data */ }
      };

      const excelExport = await schedulingService.generateReportExport(mockReport, 'EXCEL');
      
      expect(excelExport).toBeDefined();
      // Add more specific Excel export checks
    });
  });

  describe('Report Delivery', () => {
    it('should attempt email delivery', async () => {
      const mockSchedule = {
        deliveryMethod: 'EMAIL',
        deliveryConfig: { email: 'recipient@example.com' }
      };
      const mockExportedReport = { /* mock exported report */ };

      await expect(schedulingService.deliverReport(mockSchedule, mockExportedReport))
        .resolves.not.toThrow();
    });

    it('should attempt Slack delivery', async () => {
      const mockSchedule = {
        deliveryMethod: 'SLACK',
        deliveryConfig: { slackWebhook: 'https://slack.webhook' }
      };
      const mockExportedReport = { /* mock exported report */ };

      await expect(schedulingService.deliverReport(mockSchedule, mockExportedReport))
        .resolves.not.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid delivery method', async () => {
      const mockSchedule = {
        deliveryMethod: 'INVALID_METHOD',
        deliveryConfig: {}
      };
      const mockExportedReport = { /* mock exported report */ };

      await expect(schedulingService.deliverReport(mockSchedule, mockExportedReport))
        .rejects.toThrow();
    });

    it('should handle export format errors', async () => {
      const mockReport = {
        id: 'test-report-error',
        name: 'Error Report'
      };

      await expect(schedulingService.generateReportExport(mockReport, 'INVALID_FORMAT'))
        .rejects.toThrow();
    });
  });
});
