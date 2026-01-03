import axios from 'axios';

// Mock server running on port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { accessToken } = response.data.data;
                localStorage.setItem('access_token', accessToken);

                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

// API service methods
export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const propertyService = {
    getAll: async (params) => {
        const response = await api.get('/properties', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/properties/${id}`);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/properties/${id}`, data);
        return response.data;
    },
};

export const bookingService = {
    getAll: async (params) => {
        const response = await api.get('/bookings', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },
};

export const callService = {
    getAll: async (params) => {
        const response = await api.get('/ai-voice/calls', { params });
        return response.data;
    },
};

export const adminService = {
    getStats: async () => {
        const response = await api.get('/admin/stats');
        return response.data;
    },
    getRevenueAnalytics: async () => {
        const response = await api.get('/admin/analytics/revenue');
        return response.data;
    },
    getRecentActivity: async () => {
        const response = await api.get('/admin/activity');
        return response.data;
    },
    getDashboardData: async () => {
        const response = await api.get('/admin/dashboard');
        return response.data;
    }
};
