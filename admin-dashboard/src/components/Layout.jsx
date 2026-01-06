import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Badge,
    Tooltip,
    InputBase,
    alpha
} from '@mui/material';
import {
    Dashboard,
    Home,
    CalendarToday,
    People,
    Phone,
    BarChart,
    Menu as MenuIcon,
    Logout,
    Settings,
    VerifiedUser,
    Notifications,
    Search as SearchIcon,
    DarkMode,
    LightMode,
    Assessment,
    ChevronRight
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useColorMode } from '../App';

const drawerWidth = 260;

const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Properties', icon: <Home />, path: '/properties' },
    { text: 'Bookings', icon: <CalendarToday />, path: '/bookings' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Call Center', icon: <Phone />, path: '/call-center' },
    { text: 'Analytics', icon: <BarChart />, path: '/analytics' },
    { text: 'Hosts', icon: <VerifiedUser />, path: '/hosts' },
    { text: 'Reports', icon: <Assessment />, path: '/reports' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { mode, toggleColorMode } = useColorMode();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const drawer = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: mode === 'light'
                    ? 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)'
                    : 'linear-gradient(180deg, #1A1F26 0%, #0F1419 100%)'
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5
                }}
            >
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(0, 168, 107, 0.3)'
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#fff'
                        }}
                    >
                        JB
                    </Typography>
                </Box>
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                            background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            lineHeight: 1.2
                        }}
                    >
                        JustBack
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Admin Portal
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Navigation */}
            <List sx={{ px: 2, py: 2, flex: 1 }}>
                {menuItems.map((item, index) => {
                    const active = isActive(item.path);
                    return (
                        <ListItem
                            key={item.text}
                            disablePadding
                            sx={{
                                mb: 0.5,
                                animation: 'slideIn 0.3s ease-out',
                                animationDelay: `${index * 50}ms`,
                                animationFillMode: 'both'
                            }}
                        >
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.25,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    bgcolor: active ? 'primary.main' : 'transparent',
                                    color: active ? 'white' : 'text.primary',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: active
                                            ? 'primary.dark'
                                            : mode === 'light'
                                                ? 'rgba(0, 168, 107, 0.08)'
                                                : 'rgba(0, 168, 107, 0.15)',
                                        transform: 'translateX(4px)'
                                    },
                                    '&::before': active ? {
                                        content: '""',
                                        position: 'absolute',
                                        left: 0,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: 4,
                                        height: 24,
                                        borderRadius: 2,
                                        bgcolor: 'white'
                                    } : {}
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 40,
                                        color: active ? 'inherit' : 'text.secondary'
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.9rem',
                                        fontWeight: active ? 600 : 500
                                    }}
                                />
                                {active && (
                                    <ChevronRight sx={{ fontSize: 18, opacity: 0.7 }} />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Footer */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: mode === 'light' ? 'rgba(0, 168, 107, 0.08)' : 'rgba(0, 168, 107, 0.15)',
                        border: '1px solid',
                        borderColor: mode === 'light' ? 'rgba(0, 168, 107, 0.2)' : 'rgba(0, 168, 107, 0.25)'
                    }}
                >
                    <Typography variant="caption" color="text.secondary" display="block">
                        Need help?
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        View Documentation →
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    bgcolor: mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(26,31,38,0.8)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ display: { sm: 'none' }, color: 'text.primary' }}
                        >
                            <MenuIcon />
                        </IconButton>

                        {/* Search Bar */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center',
                                bgcolor: mode === 'light' ? '#F4F6F8' : 'rgba(255,255,255,0.05)',
                                borderRadius: 2.5,
                                px: 2,
                                py: 0.5,
                                width: 280,
                                transition: 'all 0.2s ease',
                                border: '1px solid transparent',
                                '&:focus-within': {
                                    bgcolor: mode === 'light' ? '#fff' : 'rgba(255,255,255,0.08)',
                                    borderColor: 'primary.main',
                                    boxShadow: '0 0 0 3px rgba(0, 168, 107, 0.1)'
                                }
                            }}
                        >
                            <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
                            <InputBase
                                placeholder="Search anything..."
                                sx={{
                                    flex: 1,
                                    fontSize: '0.875rem',
                                    color: 'text.primary'
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    bgcolor: mode === 'light' ? '#E0E0E0' : 'rgba(255,255,255,0.1)',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    color: 'text.secondary',
                                    fontSize: '0.7rem'
                                }}
                            >
                                ⌘K
                            </Typography>
                        </Box>
                    </Box>

                    {/* Right Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {/* Theme Toggle */}
                        <Tooltip title={mode === 'light' ? 'Dark mode' : 'Light mode'}>
                            <IconButton onClick={toggleColorMode} sx={{ color: 'text.secondary' }}>
                                {mode === 'light' ? <DarkMode /> : <LightMode />}
                            </IconButton>
                        </Tooltip>

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton sx={{ color: 'text.secondary' }}>
                                <Badge badgeContent={3} color="error">
                                    <Notifications />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Profile */}
                        <Box
                            onClick={handleProfileMenuOpen}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                ml: 1,
                                p: 0.5,
                                pr: 1.5,
                                borderRadius: 3,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'
                                }
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                                    fontSize: '0.875rem',
                                    fontWeight: 600
                                }}
                            >
                                {user?.firstName?.[0]}{user?.lastName?.[0] || 'A'}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="body2" fontWeight="600" color="text.primary" lineHeight={1.2}>
                                    {user?.firstName || 'Admin'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Administrator
                                </Typography>
                            </Box>
                        </Box>

                        {/* Profile Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleProfileMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    minWidth: 200,
                                    borderRadius: 2,
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
                                }
                            }}
                        >
                            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
                                <Settings sx={{ mr: 1.5, fontSize: 20 }} />
                                Settings
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <Logout sx={{ mr: 1.5, fontSize: 20 }} />
                                Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none'
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            border: 'none',
                            borderRight: '1px solid',
                            borderColor: 'divider'
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: 'calc(100vh - 64px)',
                    bgcolor: 'background.default',
                    animation: 'fadeIn 0.3s ease-out'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
