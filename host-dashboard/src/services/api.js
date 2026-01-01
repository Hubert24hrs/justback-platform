import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = localStorage.getItem('refreshToken')
                const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                    refreshToken,
                })

                const { accessToken } = response.data.data
                localStorage.setItem('token', accessToken)

                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api

// API helper functions
export const hostApi = {
    // Dashboard stats
    getStats: () => api.get('/host/stats'),

    // Properties
    getMyProperties: () => api.get('/properties', { params: { mine: true } }),
    getProperty: (id) => api.get(`/properties/${id}`),
    createProperty: (data) => api.post('/properties', data),
    updateProperty: (id, data) => api.put(`/properties/${id}`, data),
    deleteProperty: (id) => api.delete(`/properties/${id}`),

    // Bookings
    getBookings: (params) => api.get('/bookings', { params }),
    getBooking: (id) => api.get(`/bookings/${id}`),
    updateBookingStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),

    // Earnings
    getEarnings: () => api.get('/host/earnings'),
    getPayoutHistory: () => api.get('/host/payouts'),
    requestPayout: (amount) => api.post('/host/payouts', { amount }),

    // AI Settings & RAG
    getAISettings: () => api.get('/host/settings/ai'),
    updateAISettings: (data) => api.post('/host/settings/ai', data),
    indexKnowledgeBase: () => api.post('/host/settings/ai/index'),
}
