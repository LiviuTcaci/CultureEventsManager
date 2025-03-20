import axios, { AxiosResponse } from 'axios';

// Base API configuration
// When running in Docker, API host is the service name 'api'
// The protocol and port depend on whether we are in the browser (client-side) or Docker (server-side)
const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5165/api'  // Development on local machine
  : '/api';                      // Production in Docker container (nginx handles proxy)

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle expired tokens, network errors, etc.
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiService = {
  // Generic GET method
  get: <T>(url: string): Promise<T> => {
    return api.get<T, AxiosResponse<T>>(url).then((response) => response.data);
  },

  // Generic POST method
  post: <T>(url: string, data: any): Promise<T> => {
    return api.post<T, AxiosResponse<T>>(url, data).then((response) => response.data);
  },

  // Generic PUT method
  put: <T>(url: string, data: any): Promise<T> => {
    return api.put<T, AxiosResponse<T>>(url, data).then((response) => response.data);
  },

  // Generic DELETE method
  delete: <T>(url: string): Promise<T> => {
    return api.delete<T, AxiosResponse<T>>(url).then((response) => response.data);
  },
};
