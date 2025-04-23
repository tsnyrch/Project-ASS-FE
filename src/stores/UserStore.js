import { defineStore } from 'pinia';
import axios from 'axios';
import config from '@/config.js';

export const useUserStore = defineStore('user', {
	state: () => ({
		token: null,
		error: null,
		afterLoginRoute: null,
		isLoggedIn: null,
		users: [],
	}),

	getters: {
		// Add getters as needed
	},

	actions: {
		// Log in and store token
		async login(userName, password) {
			try {
				const data = { userName, password };
				const response = await axios.post(`${config.backendUrl}/users/login`, data);

				this.token = response.data.accessToken;
				localStorage.setItem('token', this.token);
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;

				sessionStorage.setItem('first_name', response.data.firstName);
				sessionStorage.setItem('last_name', response.data.lastName);

				this.error = null;
				this.isLoggedIn = true;
			} catch (e) {
				this.error = 'Cannot log in! ' + e;
				this.isLoggedIn = false;
			}
		},

		// Restore token on app reload
		initializeToken() {
			const token = localStorage.getItem('token');
			if (token) {
				this.token = token;
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
				this.isLoggedIn = true;
			}
		},

		// Clear auth and token
		logout() {
			this.token = null;
			delete axios.defaults.headers.common['Authorization'];
			localStorage.removeItem('token');
			this.isLoggedIn = false;
		},

		// Get user list
		async fetchUsers() {
			try {
				const token = this.token || localStorage.getItem('token');
				const response = await axios.get(`${config.backendUrl}/users`, {
					headers: {
						Authorization: 'Bearer ' + token,
					},
				});
				this.users = response.data;
				this.error = null;
			} catch (error) {
				this.error = 'Cannot get users ' + error;
			}
		},

		// Add user
		async addUser(data) {
			try {
				const token = this.token || localStorage.getItem('token');
				const response = await axios.post(`${config.backendUrl}/users`, data, {
					headers: {
						Authorization: 'Bearer ' + token,
					},
				});
				this.users.push(response.data);
				this.error = null;
			} catch (error) {
				this.error = 'Cannot add user ' + error;
			}
		},

		clearError() {
			this.error = null;
		},
	},
});
