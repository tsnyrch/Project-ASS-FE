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
		async login(username, password) {
			try {
				const params = new URLSearchParams();
				params.append('username', username);
				params.append('password', password);

				const response = await axios.post(`${config.backendUrl}/users/login`, params, {
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
					},
				});

				this.token = response.data.access_token;
				localStorage.setItem('token', this.token);
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;

				// extract user information from JWT token
				const user = JSON.parse(atob(this.token.split('.')[1]));

				console.log("Login successful:", response.data);

				sessionStorage.setItem('first_name', user.first_name || '');
				sessionStorage.setItem('last_name', user.last_name || '');

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
