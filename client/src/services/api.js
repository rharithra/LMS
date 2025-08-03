import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
};

// Leave API
export const leaveAPI = {
  getLeaves: (params) => api.get('/leaves', { params }),
  getLeave: (id) => api.get(`/leaves/${id}`),
  createLeave: (leaveData) => api.post('/leaves', leaveData),
  updateLeave: (id, leaveData) => api.put(`/leaves/${id}`, leaveData),
  approveLeave: (id, approvalData) => api.put(`/leaves/${id}/approve`, approvalData),
  cancelLeave: (id) => api.delete(`/leaves/${id}`),
  addComment: (id, comment) => api.post(`/leaves/${id}/comments`, { comment }),
  getLeaveStats: () => api.get('/leaves/stats'),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  updateLeaveBalance: (id, balanceData) => api.put(`/users/${id}/leave-balance`, balanceData),
  getProfile: () => api.get('/users/me/profile'),
  updateProfile: (profileData) => api.put('/users/me/profile', profileData),
  getTeam: () => api.get('/users/me/team'),
  getDepartmentUsers: (departmentId) => api.get(`/users/departments/${departmentId}`),
};

// Department API
export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getDepartment: (id) => api.get(`/departments/${id}`),
  createDepartment: (departmentData) => api.post('/departments', departmentData),
  updateDepartment: (id, departmentData) => api.put(`/departments/${id}`, departmentData),
  deleteDepartment: (id) => api.delete(`/departments/${id}`),
  getDepartmentEmployees: (id) => api.get(`/departments/${id}/employees`),
};

export default api; 