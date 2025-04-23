import { defineStore } from 'pinia';
import axios from 'axios';
import config from '../config';

export const useMeasurementsStore = defineStore('measurements', {
	state: () => ({
		measurementInfo: {
			lastBackup: '',
			lastMeasurement: '',
			plannedMeasurement: '',
			latestMeasurement: [],
		},
		measurementHistory: [],
		measurementConfig: {},
		error: null,
	}),
	getters: {},

	actions: {
		async fetchMeasurementsData(measurementId) {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/measurements/${measurementId}`,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				return response.data;
			} catch (error) {
				this.error = 'Cannot get measurements data ' + error;
			}
		},

		async downloadMeasurementZip(measurementId) {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/measurements/${measurementId}`,
					{
						responseType: 'blob',
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				return new Blob([response.data], { type: 'application/zip' });
			} catch (error) {
				this.error = 'Cannot download measurement ZIP ' + error;
			}
		},

		async fetchManualMeasurementConfig() {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/measurements/start`,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				this.measurementConfig = response.data;
				this.error = null;
				return response.data;
			} catch (error) {
				this.error = 'Cannot get manual measurement configuration ' + error;
			}
		},

		async fetchLatestMeasurements() {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/measurements/latest`,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				this.measurementInfo = {
					...this.measurementInfo,
					lastBackup: response.data.lastBackup,
					lastMeasurement: response.data.lastMeasurement,
					plannedMeasurement: response.data.plannedMeasurement,
					latestMeasurement: response.data.latestMeasurement,
				};
				this.error = null;
			} catch (error) {
				this.error = 'Cannot get latest measurements ' + error;
			}
		},

		async fetchMeasurementHistory(startDate, endDate) {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/measurements/history`,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
						params: { startDate, endDate },
					}
				);
				this.measurementHistory = response.data;
				this.error = null;
				await this.downloadMeasurementZip(1);
			} catch (error) {
				this.error = 'Cannot get measurement history ' + error;
			}
		},

		async fetchMeasurementConfig() {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.get(
					`${config.backendUrl}/settings/measurementConfig`,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				this.measurementConfig = response.data;
				this.error = null;
			} catch (error) {
				this.error = 'Cannot get measurement configuration ' + error;
			}
		},

		async updateMeasurementConfig(data) {
			try {
				const token = localStorage.getItem('token');
				const response = await axios.put(
					`${config.backendUrl}/settings/measurementConfig`,
					data,
					{
						headers: {
							Authorization: 'Bearer ' + token,
						},
					}
				);
				this.measurementConfig = response.data;
				this.error = null;
			} catch (error) {
				this.error = 'Cannot update measurement configuration ' + error;
			}
		},

		clearError() {
			this.error = null;
		},
	},
});
