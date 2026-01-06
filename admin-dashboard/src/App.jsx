import React, { createContext, useContext, useState, useMemo } from 'react';
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
import './index.css';

// Theme Context for Dark Mode
const ColorModeContext = createContext({ toggleColorMode: () => { } });
export const useColorMode = () => useContext(ColorModeContext);

const getDesignTokens = (mode) => ({
    palette: {
        mode,
        primary: {
            main: '#00A86B',
            light: '#66FFA6',
            dark: '#007A4D',
            contrastText: '#fff',
        },
        secondary: {
            main: '#2979FF',
            light: '#75A7FF',
            dark: '#004ECB',
            contrastText: '#fff',
        },
        success: {
            main: '#00C853',
            light: '#5EFC82',
            dark: '#009624',
        },
        warning: {
            main: '#FFD600',
            light: '#FFFF52',
            dark: '#C7A500',
        },
        error: {
            main: '#FF1744',
            light: '#FF616F',
            dark: '#C4001D',
        },
        ...(mode === 'light'
            ? {
                background: {
                    default: '#F8FAFC',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#172B4D',
                    secondary: '#6B778C',
                },
                divider: 'rgba(0, 0, 0, 0.08)',
            }
            : {
                background: {
                    default: '#0F1419',
                    paper: '#1A1F26',
                },
                text: {
                    primary: '#F7F9FC',
                    secondary: '#8899A6',
                },
                divider: 'rgba(255, 255, 255, 0.08)',
            }),
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
        h1: {
            fontWeight: 800,
            letterSpacing: '-1px',
        },
        h2: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h3: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h4: {
            fontWeight: 700,
            letterSpacing: '-0.5px',
        },
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.25px',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '0.15px',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
        body1: {
            fontSize: '0.938rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
    },
    shape: {
        borderRadius: 12,
    },
    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.04)',
        '0 2px 4px rgba(0,0,0,0.04)',
        '0 4px 8px rgba(0,0,0,0.04)',
        '0 6px 12px rgba(0,0,0,0.06)',
        '0 8px 16px rgba(0,0,0,0.06)',
        '0 12px 24px rgba(0,0,0,0.08)',
        '0 16px 32px rgba(0,0,0,0.08)',
        '0 20px 40px rgba(0,0,0,0.10)',
        '0 24px 48px rgba(0,0,0,0.10)',
        '0 28px 56px rgba(0,0,0,0.12)',
        '0 32px 64px rgba(0,0,0,0.12)',
        ...Array(12).fill('0 32px 64px rgba(0,0,0,0.12)'),
    ],
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 20px',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 4px 14px rgba(0, 168, 107, 0.25)',
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #007A4D 0%, #00A86B 100%)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    borderRadius: 16,
                },
                elevation1: {
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                },
                elevation2: {
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid',
                    borderColor: mode === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        borderColor: '#00A86B40',
                        boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    '& .MuiTableCell-head': {
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '0.5px',
                        color: mode === 'light' ? '#6B778C' : '#8899A6',
                        backgroundColor: mode === 'light' ? '#F8FAFC' : '#151A21',
                        borderBottom: 'none',
                    },
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                        backgroundColor: mode === 'light' ? '#F8FAFC' : '#1F2937',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        transition: 'all 0.2s ease',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00A86B60',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#00A86B',
                            borderWidth: 2,
                        },
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 20,
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.2)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: 'none',
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
    const [mode, setMode] = useState('light');

    const colorMode = useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
            },
            mode
        }),
        [mode]
    );

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
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
        </ColorModeContext.Provider>
    );
}

export default App;
