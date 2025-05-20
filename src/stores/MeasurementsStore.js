import { defineStore } from 'pinia';
import axios from 'axios';
import config from '../config';

export const useMeasurementsStore = defineStore('measurements', {
  state: () => ({
    measurementInfo: {
      lastBackup: '',
      lastMeasurement: '',
      plannedMeasurement: '',
      latestMeasurement: []
    },
    measurementHistory: [],
    measurementConfig: {},
    error: null
  }),
  getters: {},

  actions: {
    async fetchMeasurementsData(measurement_id) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/measurements/${measurement_id}`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        return response.data;
      } catch (error) {
        this.error = 'Cannot get measurements data ' + error;
      }
    },

    async downloadMeasurementZip(measurement_id) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/measurements/${measurement_id}`, {
          responseType: 'blob',
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        return new Blob([response.data], { type: 'application/zip' });
      } catch (error) {
        this.error = 'Cannot download measurement ZIP ' + error;
      }
    },

    async downloadMeasurementFromDrive(measurement_id) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/measurements/${measurement_id}/download-all`, {
          responseType: 'blob',
          headers: {
            Authorization: 'Bearer ' + token
          }
        });

        // Get filename from content-disposition header if available
        let filename = `measurement_${measurement_id}_${Date.now()}.zip`;
        const contentDisposition = response.headers['content-disposition'];
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename=(.+)$/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/["']/g, '');
          }
        }

        return {
          blob: new Blob([response.data], { type: 'application/zip' }),
          filename: filename
        };
      } catch (error) {
        this.error = 'Cannot download measurement: ' + error;
        return null;
      }
    },

    async fetchManualMeasurementConfig(data) {
      try {
        const token = localStorage.getItem('token');
        console.log('Starting manual measurement with data:', data);
        const response = await axios.post(`${config.backendUrl}/measurements/start`, data, data, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        this.error = null;
      } catch (error) {
        this.error = 'Cannot start manual measurement: ' + error;
      }
    },

    async fetchLatestMeasurements() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/measurements/latest`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        this.measurementInfo = {
          ...this.measurementInfo,
          lastBackup: response.data.last_backup,
          lastMeasurement: response.data.last_measurement,
          plannedMeasurement: response.data.planned_measurement,
          latestMeasurement: response.data.latest_measurement
        };
        this.error = null;
      } catch (error) {
        this.error = 'Cannot get latest measurements ' + error;
      }
    },

    async fetchMeasurementHistory(start_date, end_date) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/measurements/history`, {
          headers: {
            Authorization: 'Bearer ' + token
          },
          params: { start_date, end_date }
        });
        this.measurementHistory = response.data;
        this.error = null;
        // await this.downloadMeasurementZip(1);
      } catch (error) {
        this.error = 'Cannot get measurement history ' + error;
      }
    },

    async fetchMeasurementConfig() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/settings/measurement-config`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        this.measurementConfig = response.data;
        this.error = null;
      } catch (error) {
        this.error = 'Cannot get measurement configuration ' + error;
      }
    },

    async updateMeasurementConfig(data) {
      try {
        const token = localStorage.getItem('token');
        console.log('Request data being sent to server:', JSON.stringify(data));

        // Make sure boolean values are properly set
        const cleanData = {
          ...data,
          rgb_camera: data.rgb_camera === true,
          multispectral_camera: data.multispectral_camera === true
        };

        console.log('Cleaned request data:', JSON.stringify(cleanData));

        const response = await axios.put(`${config.backendUrl}/settings/measurement-config`, cleanData, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        console.log('Server response:', response.data);
        this.measurementConfig = response.data;
        this.error = null;
        return response.data;
      } catch (error) {
        console.error('Error updating config:', error);
        this.error = 'Cannot update measurement configuration ' + error;
        throw error;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
