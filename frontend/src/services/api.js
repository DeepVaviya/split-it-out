import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://split-it-out.onrender.com'

const API = axios.create({ 
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      error.message = 'Unable to connect to server. Make sure the backend is running.';
      return Promise.reject(error);
    }
    
    // Handle specific status codes
    const { status } = error.response;
    
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not on login page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    
    if (status === 400) {
      console.error('Bad request:', error.response.data);
    }
    
    if (status === 500) {
      console.error('Server error:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const checkHealth = async () => {
  try { const res = await API.get('/health'); return res.data.status === 'ok'; } catch { return false; }
};

// Groups
export const createGroup = (data) => API.post('/groups', data);
export const getGroup = (id) => API.get(`/groups/${id}`);
export const getGroups = () => API.get('/groups/my');
export const deleteGroup = (id) => API.delete(`/groups/${id}`);

// Expenses
export const addExpense = (data) => API.post('/expenses/add', data);
export const getExpenses = (groupId) => API.get(`/expenses/group/${groupId}`);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);