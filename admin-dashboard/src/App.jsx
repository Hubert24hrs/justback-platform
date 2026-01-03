import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import CallCenter from './pages/CallCenter';
import Analytics from './pages/Analytics';
import HostManagement from './pages/HostManagement';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#00A86B',
        },
        secondary: {
            main: '#2E7D32',
        },
    },
});

function PrivateRoute({ children }) {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <Router>
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
                            <Route path="bookings" element={<Bookings />} />
                            <Route path="users" element={<Users />} />
                            <Route path="call-center" element={<CallCenter />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="hosts" element={<HostManagement />} />
                            <Route path="reports" element={<Reports />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
