import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            fetchProfile()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await api.get('/auth/me')
            if (response.data.success) {
                setUser(response.data.data)
            }
        } catch (error) {
            localStorage.removeItem('token')
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        if (response.data.success) {
            localStorage.setItem('token', response.data.data.accessToken)
            localStorage.setItem('refreshToken', response.data.data.refreshToken)
            setUser(response.data.data.user)
            return { success: true }
        }
        return { success: false, error: response.data.error }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
