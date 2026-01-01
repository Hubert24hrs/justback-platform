import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
} from '@mui/material'
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    CalendarMonth as CalendarIcon,
    AccountBalanceWallet as WalletIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Add as AddIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 260

const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Properties', icon: <HomeIcon />, path: '/properties' },
    { text: 'Bookings', icon: <CalendarIcon />, path: '/bookings' },
    { text: 'Earnings', icon: <WalletIcon />, path: '/earnings' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
]

export default function Layout() {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('md'))
    const [mobileOpen, setMobileOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout } = useAuth()

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleProfileMenuClose = () => {
        setAnchorEl(null)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <HomeIcon sx={{ color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    JustBack
                </Typography>
            </Box>

            <Divider />

            {/* Add Property Button */}
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={() => navigate('/properties/add')}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        borderRadius: 2,
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <AddIcon />
                    </ListItemIcon>
                    <ListItemText primary="Add Property" />
                </ListItemButton>
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 2, flex: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            onClick={() => {
                                navigate(item.path)
                                if (isMobile) setMobileOpen(false)
                            }}
                            selected={location.pathname === item.path}
                            sx={{
                                borderRadius: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                    '&:hover': { bgcolor: 'primary.main' },
                                    '& .MuiListItemIcon-root': { color: 'white' },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            {/* User Profile Section */}
            <Box sx={{ p: 2 }}>
                <Box
                    sx={{
                        p: 2,
                        bgcolor: 'grey.100',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                    }}
                >
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user?.firstName?.[0] || 'H'}
                    </Avatar>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            Host
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            {/* App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    bgcolor: 'background.default',
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Box sx={{ flex: 1 }} />
                    <IconButton onClick={handleProfileMenuOpen}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                            {user?.firstName?.[0] || 'H'}
                        </Avatar>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                    >
                        <MenuItem onClick={() => { navigate('/settings'); handleProfileMenuClose(); }}>
                            <SettingsIcon sx={{ mr: 1 }} /> Settings
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1 }} /> Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { width: drawerWidth, borderRight: '1px solid', borderColor: 'divider' },
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
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
