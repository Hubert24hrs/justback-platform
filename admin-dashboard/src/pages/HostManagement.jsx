import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    IconButton,
    Avatar,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab,
    Divider,
    Snackbar,
    Alert
} from '@mui/material';
import {
    CheckCircle,
    Cancel,
    MoreVert,
    Verified,
    People,
    Home,
    AttachMoney,
    Pending,
    Visibility,
    Email
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import EmptyState from '../components/EmptyState';

const mockHosts = [
    { id: 1, name: 'Chidinma Lagos', email: 'chidinma@example.com', phone: '+2348012345678', properties: 3, pendingProperties: 0, status: 'verified', revenue: 850000, totalBookings: 45, joinDate: '2025-09-15' },
    { id: 2, name: 'Yusuf Ahmad', email: 'yusuf@example.com', phone: '+2348023456789', properties: 1, pendingProperties: 2, status: 'pending', revenue: 0, totalBookings: 0, joinDate: '2025-12-20' },
    { id: 3, name: 'Ngozi Eze', email: 'ngozi@example.com', phone: '+2348034567890', properties: 5, pendingProperties: 1, status: 'verified', revenue: 2100000, totalBookings: 89, joinDate: '2025-06-10' },
    { id: 4, name: 'Tunde Adeyemi', email: 'tunde@example.com', phone: '+2348045678901', properties: 2, pendingProperties: 0, status: 'rejected', revenue: 150000, totalBookings: 12, joinDate: '2025-10-01' },
    { id: 5, name: 'Blessing Okonkwo', email: 'blessing@example.com', phone: '+2348056789012', properties: 4, pendingProperties: 1, status: 'verified', revenue: 1250000, totalBookings: 67, joinDate: '2025-07-22' },
];

const mockPendingProperties = [
    { id: 1, hostId: 2, title: 'Modern Lekki Apartment', city: 'Lagos', price: 45000, submittedAt: '2025-12-28' },
    { id: 2, hostId: 2, title: 'Cozy Studio in VI', city: 'Lagos', price: 35000, submittedAt: '2025-12-30' },
    { id: 3, hostId: 3, title: 'Luxury Suite Abuja', city: 'Abuja', price: 85000, submittedAt: '2025-12-29' },
    { id: 4, hostId: 5, title: 'Beach House PHC', city: 'Port Harcourt', price: 120000, submittedAt: '2025-12-31' },
];

export default function HostManagement() {
    const [hosts, setHosts] = useState(mockHosts);
    const [pendingProperties, setPendingProperties] = useState(mockPendingProperties);
    const [tabValue, setTabValue] = useState(0);
    const [selectedHost, setSelectedHost] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    const handleHostAction = (id, newStatus) => {
        setHosts(hosts.map(h => h.id === id ? { ...h, status: newStatus } : h));
        setNotification({
            open: true,
            message: `Host ${newStatus === 'verified' ? 'approved' : 'rejected'} successfully`,
            severity: newStatus === 'verified' ? 'success' : 'warning'
        });
    };

    const handlePropertyAction = (id, action) => {
        setPendingProperties(pendingProperties.filter(p => p.id !== id));
        setNotification({
            open: true,
            message: `Property ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            severity: action === 'approve' ? 'success' : 'warning'
        });
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
        return `₦${amount}`;
    };

    const stats = {
        totalHosts: hosts.length,
        verifiedHosts: hosts.filter(h => h.status === 'verified').length,
        pendingHosts: hosts.filter(h => h.status === 'pending').length,
        pendingProperties: pendingProperties.length,
        totalRevenue: hosts.reduce((sum, h) => sum + h.revenue, 0),
    };

    return (
        <Box>
            <PageHeader
                title="Host Management"
                subtitle="Manage hosts and property approvals"
                icon={People}
                badge={`${stats.pendingProperties} Pending`}
            />

            {/* Stats Cards */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Hosts"
                        value={stats.totalHosts}
                        icon={People}
                        color="#2979FF"
                        delay={0}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Verified Hosts"
                        value={stats.verifiedHosts}
                        icon={Verified}
                        color="#00C853"
                        delay={100}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Pending Properties"
                        value={stats.pendingProperties}
                        icon={Pending}
                        color="#FF9100"
                        delay={200}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Host Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon={AttachMoney}
                        color="#7B1FA2"
                        delay={300}
                    />
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper
                sx={{
                    borderRadius: 3,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    sx={{
                        px: 2,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            minHeight: 56
                        }
                    }}
                >
                    <Tab label={`All Hosts (${hosts.length})`} />
                    <Tab label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Pending Approval
                            <Chip size="small" label={hosts.filter(h => h.status === 'pending').length} color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                    } />
                    <Tab label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Property Requests
                            <Chip size="small" label={pendingProperties.length} color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>
                    } />
                </Tabs>
            </Paper>

            {/* Host Table */}
            {tabValue !== 2 && (
                <Paper
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: 'primary.light',
                            boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                        }
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Host</TableCell>
                                    <TableCell>Properties</TableCell>
                                    <TableCell>Total Revenue</TableCell>
                                    <TableCell>Bookings</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {hosts
                                    .filter(h => tabValue === 0 || h.status === 'pending')
                                    .map((host, index) => (
                                        <TableRow
                                            key={host.id}
                                            hover
                                            sx={{
                                                animation: 'slideIn 0.3s ease-out',
                                                animationDelay: `${index * 30}ms`,
                                                animationFillMode: 'both'
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Avatar
                                                        sx={{
                                                            background: host.status === 'verified'
                                                                ? 'linear-gradient(135deg, #00C853 0%, #64DD17 100%)'
                                                                : host.status === 'pending'
                                                                    ? 'linear-gradient(135deg, #FF9100 0%, #FFC107 100%)'
                                                                    : 'linear-gradient(135deg, #FF1744 0%, #FF5252 100%)',
                                                            fontWeight: 600
                                                        }}
                                                    >
                                                        {host.name[0]}
                                                    </Avatar>
                                                    <Box>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Typography variant="subtitle2" fontWeight="bold">
                                                                {host.name}
                                                            </Typography>
                                                            {host.status === 'verified' && (
                                                                <Verified fontSize="small" color="primary" />
                                                            )}
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary">{host.email}</Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Home fontSize="small" color="action" />
                                                    <Typography fontWeight="500">{host.properties}</Typography>
                                                    {host.pendingProperties > 0 && (
                                                        <Chip label={`+${host.pendingProperties}`} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography fontWeight="bold" color="primary.main">
                                                    {formatCurrency(host.revenue)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{host.totalBookings}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={host.status.toUpperCase()}
                                                    color={host.status === 'verified' ? 'success' : host.status === 'pending' ? 'warning' : 'error'}
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => { setSelectedHost(host); setDetailsOpen(true); }}
                                                    sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                                >
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                                {host.status === 'pending' && (
                                                    <>
                                                        <IconButton
                                                            color="success"
                                                            size="small"
                                                            onClick={() => handleHostAction(host.id, 'verified')}
                                                        >
                                                            <CheckCircle fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            size="small"
                                                            onClick={() => handleHostAction(host.id, 'rejected')}
                                                        >
                                                            <Cancel fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

            {/* Property Requests */}
            {tabValue === 2 && (
                <Paper
                    sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            borderColor: 'primary.light',
                            boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                        }
                    }}
                >
                    {pendingProperties.length === 0 ? (
                        <EmptyState
                            type="empty"
                            title="No Pending Properties"
                            description="All property submissions have been reviewed"
                        />
                    ) : (
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Property</TableCell>
                                        <TableCell>Host</TableCell>
                                        <TableCell>City</TableCell>
                                        <TableCell>Price/Night</TableCell>
                                        <TableCell>Submitted</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingProperties.map((property, index) => {
                                        const host = hosts.find(h => h.id === property.hostId);
                                        return (
                                            <TableRow
                                                key={property.id}
                                                hover
                                                sx={{
                                                    animation: 'slideIn 0.3s ease-out',
                                                    animationDelay: `${index * 30}ms`,
                                                    animationFillMode: 'both'
                                                }}
                                            >
                                                <TableCell>
                                                    <Typography fontWeight="bold">{property.title}</Typography>
                                                </TableCell>
                                                <TableCell>{host?.name || 'Unknown'}</TableCell>
                                                <TableCell>{property.city}</TableCell>
                                                <TableCell>
                                                    <Typography fontWeight="bold" color="primary.main">
                                                        {formatCurrency(property.price)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{property.submittedAt}</TableCell>
                                                <TableCell align="right">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="success"
                                                        sx={{ mr: 1, borderRadius: 2 }}
                                                        onClick={() => handlePropertyAction(property.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        sx={{ borderRadius: 2 }}
                                                        onClick={() => handlePropertyAction(property.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            {/* Host Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Host Details</DialogTitle>
                <DialogContent>
                    {selectedHost && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                                        fontSize: 24,
                                        fontWeight: 700
                                    }}
                                >
                                    {selectedHost.name[0]}
                                </Avatar>
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Typography variant="h6">{selectedHost.name}</Typography>
                                        {selectedHost.status === 'verified' && <Verified color="primary" />}
                                    </Box>
                                    <Typography color="text.secondary">{selectedHost.email}</Typography>
                                    <Typography variant="caption" color="text.secondary">{selectedHost.phone}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Properties</Typography>
                                    <Typography variant="h6" fontWeight="bold">{selectedHost.properties}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Total Revenue</Typography>
                                    <Typography variant="h6" fontWeight="bold" color="primary.main">{formatCurrency(selectedHost.revenue)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Total Bookings</Typography>
                                    <Typography variant="h6" fontWeight="bold">{selectedHost.totalBookings}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Member Since</Typography>
                                    <Typography variant="h6" fontWeight="bold">{selectedHost.joinDate}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button startIcon={<Email />} sx={{ borderRadius: 2 }}>Send Email</Button>
                    <Button onClick={() => setDetailsOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={5000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={notification.severity}
                    sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
