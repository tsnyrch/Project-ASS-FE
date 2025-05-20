import { defineStore } from 'pinia';
import axios from 'axios';
import config from '@/config.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: null,
    error: null,
    afterLoginRoute: null,
    isLoggedIn: null,
    users: []
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
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        this.token = response.data.access_token;
        localStorage.setItem('token', this.token);
        axios.defaults.headers.common['Authorization'] = 'Bearer ' + this.token;

        // extract user information from JWT token
        const user = JSON.parse(atob(this.token.split('.')[1]));

        sessionStorage.setItem('first_name', user.first_name || '');
        sessionStorage.setItem('last_name', user.last_name || '');
        sessionStorage.setItem('is_admin', user.is_admin || '');

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

        // Setup response interceptor for 401 errors
        this.setupAuthInterceptor();
      }
    },

    // Clear auth and token
    async logout() {
      this.token = null;
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      sessionStorage.removeItem('first_name');
      sessionStorage.removeItem('last_name');
      sessionStorage.removeItem('is_admin');
      this.isLoggedIn = false;
    },

    // Setup axios interceptor to catch 401 errors
    setupAuthInterceptor() {
      // Remove existing interceptors if any
      if (axios.interceptors && this.interceptorId) {
        axios.interceptors.response.eject(this.interceptorId);
      }

      // Add a response interceptor
      this.interceptorId = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response && error.response.status === 401) {
            // Logout user
            await this.logout();

            // Redirect to login page
            // Use router.push to avoid circular dependency
            if (router.currentRoute.value.name !== 'login') {
              router.push({ name: 'login' });
            }

            // Show message to user
            this.error = 'Vaše přihlášení vypršelo. Prosím, přihlaste se znovu.';
          }

          return Promise.reject(error);
        }
      );
    },

    // Get user list
    async fetchUsers() {
      try {
        const token = this.token || localStorage.getItem('token');
        const response = await axios.get(`${config.backendUrl}/users/`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
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
        const response = await axios.post(`${config.backendUrl}/users/`, data, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        this.users.push(response.data);
        this.error = null;
      } catch (error) {
        this.error = 'Cannot add user ' + error;
      }
    },

    async deleteUser(userId) {
      try {
        const token = this.token || localStorage.getItem('token');
        await axios.delete(`${config.backendUrl}/users/${userId}`, {
          headers: {
            Authorization: 'Bearer ' + token
          }
        });
        this.error = null;
      } catch (error) {
        this.error = 'Cannot delete user ' + error;
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
