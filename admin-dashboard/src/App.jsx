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
            main: '#00A86B', // Vibrant Green
            light: '#66FFA6',
            dark: '#007A4D',
            contrastText: '#fff',
        },
        secondary: {
            main: '#2979FF', // Modern Blue
            light: '#75A7FF',
            dark: '#004ECB',
            contrastText: '#fff',
        },
        background: {
            default: '#F4F6F8',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#172B4D',
            secondary: '#6B778C',
        },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '0.2px',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none', // Remove uppercase default
            borderRadius: 8,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                },
                elevation1: {
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #E0E0E0',
                    boxShadow: 'none',
                },
            },
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
