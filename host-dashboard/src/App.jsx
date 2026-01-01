import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import AddProperty from './pages/AddProperty'
import Bookings from './pages/Bookings'
import Earnings from './pages/Earnings'
import Settings from './pages/Settings'

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>
    }

    return user ? children : <Navigate to="/login" />
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="properties" element={<Properties />} />
                <Route path="properties/add" element={<AddProperty />} />
                <Route path="properties/edit/:id" element={<AddProperty />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="earnings" element={<Earnings />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    )
}

export default App
