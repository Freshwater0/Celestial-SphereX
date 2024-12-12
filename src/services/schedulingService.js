import axios from 'axios';
import apiConfig from '../config/apiConfig';

const schedulingService = {
  getRecurrenceTypes() {
    return [
      { value: 'ONCE', label: 'Once' },
      { value: 'DAILY', label: 'Daily' },
      { value: 'WEEKLY', label: 'Weekly' },
      { value: 'MONTHLY', label: 'Monthly' },
      { value: 'CUSTOM', label: 'Custom' }
    ];
  },

  getDeliveryMethods() {
    return [
      { value: 'EMAIL', label: 'Email' },
      { value: 'DOWNLOAD', label: 'Download' },
      { value: 'SLACK', label: 'Slack' },
      { value: 'TEAMS', label: 'Microsoft Teams' },
      { value: 'WEBHOOK', label: 'Webhook' }
    ];
  },

  getExportFormats() {
    return [
      { value: 'PDF', label: 'PDF' },
      { value: 'EXCEL', label: 'Excel' },
      { value: 'CSV', label: 'CSV' },
      { value: 'JSON', label: 'JSON' }
    ];
  },

  async createSchedule(scheduleData) {
    try {
      const response = await axios.post(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.SCHEDULING.CREATE}`, 
        scheduleData,
        {
          headers: apiConfig.HEADERS,
          timeout: apiConfig.TIMEOUT
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw error;
    }
  },

  async listSchedules() {
    try {
      const response = await axios.get(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.SCHEDULING.LIST}`,
        {
          headers: apiConfig.HEADERS,
          timeout: apiConfig.TIMEOUT
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw error;
    }
  },

  async updateSchedule(scheduleId, updateData) {
    try {
      const response = await axios.put(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.SCHEDULING.UPDATE.replace(':id', scheduleId)}`, 
        updateData,
        {
          headers: apiConfig.HEADERS,
          timeout: apiConfig.TIMEOUT
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw error;
    }
  },

  async deleteSchedule(scheduleId) {
    try {
      const response = await axios.delete(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.SCHEDULING.DELETE.replace(':id', scheduleId)}`,
        {
          headers: apiConfig.HEADERS,
          timeout: apiConfig.TIMEOUT
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
};

export default schedulingService;
