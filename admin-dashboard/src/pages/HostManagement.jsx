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
    Card,
    CardContent,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tab,
    Tabs,
    Divider,
    LinearProgress
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
    const [rejectReason, setRejectReason] = useState('');

    const handleHostAction = (id, newStatus) => {
        setHosts(hosts.map(h => h.id === id ? { ...h, status: newStatus } : h));
    };

    const handlePropertyAction = (id, action) => {
        if (action === 'approve') {
            setPendingProperties(pendingProperties.filter(p => p.id !== id));
        } else {
            setPendingProperties(pendingProperties.filter(p => p.id !== id));
        }
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
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Host Management
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#e3f2fd' }}>
                                    <People sx={{ color: '#1976d2' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{stats.totalHosts}</Typography>
                                    <Typography variant="caption" color="text.secondary">Total Hosts</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9' }}>
                                    <Verified sx={{ color: '#4caf50' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{stats.verifiedHosts}</Typography>
                                    <Typography variant="caption" color="text.secondary">Verified</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#fff3e0' }}>
                                    <Pending sx={{ color: '#ff9800' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{stats.pendingProperties}</Typography>
                                    <Typography variant="caption" color="text.secondary">Pending Properties</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#f3e5f5' }}>
                                    <AttachMoney sx={{ color: '#9c27b0' }} />
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">{formatCurrency(stats.totalRevenue)}</Typography>
                                    <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tabs */}
            <Paper sx={{ borderRadius: 3, boxShadow: 3, mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={`All Hosts (${hosts.length})`} />
                    <Tab label={`Pending Approval (${hosts.filter(h => h.status === 'pending').length})`} />
                    <Tab label={`Property Requests (${pendingProperties.length})`} />
                </Tabs>
            </Paper>

            {/* Host Table */}
            {tabValue !== 2 && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
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
                                .map((host) => (
                                    <TableRow key={host.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Avatar sx={{ bgcolor: '#4caf50' }}>{host.name[0]}</Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="bold">
                                                        {host.name} {host.status === 'verified' && <Verified fontSize="small" color="primary" sx={{ verticalAlign: 'middle', ml: 0.5 }} />}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">{host.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Home fontSize="small" color="action" />
                                                {host.properties}
                                                {host.pendingProperties > 0 && (
                                                    <Chip label={`+${host.pendingProperties} pending`} size="small" color="warning" variant="outlined" />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{formatCurrency(host.revenue)}</TableCell>
                                        <TableCell>{host.totalBookings}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={host.status.toUpperCase()}
                                                color={host.status === 'verified' ? 'success' : host.status === 'pending' ? 'warning' : 'error'}
                                                size="small"
                                                variant="outlined"
                                                sx={{ borderRadius: 1, fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" onClick={() => { setSelectedHost(host); setDetailsOpen(true); }}>
                                                <Visibility />
                                            </IconButton>
                                            {host.status === 'pending' && (
                                                <>
                                                    <IconButton color="success" onClick={() => handleHostAction(host.id, 'verified')}>
                                                        <CheckCircle />
                                                    </IconButton>
                                                    <IconButton color="error" onClick={() => handleHostAction(host.id, 'rejected')}>
                                                        <Cancel />
                                                    </IconButton>
                                                </>
                                            )}
                                            <IconButton>
                                                <MoreVert />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Property Requests Tab */}
            {tabValue === 2 && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
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
                            {pendingProperties.map((property) => {
                                const host = hosts.find(h => h.id === property.hostId);
                                return (
                                    <TableRow key={property.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="bold">{property.title}</Typography>
                                        </TableCell>
                                        <TableCell>{host?.name || 'Unknown'}</TableCell>
                                        <TableCell>{property.city}</TableCell>
                                        <TableCell>{formatCurrency(property.price)}</TableCell>
                                        <TableCell>{property.submittedAt}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                sx={{ mr: 1 }}
                                                onClick={() => handlePropertyAction(property.id, 'approve')}
                                            >
                                                Approve
                                            </Button>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="error"
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

            {/* Host Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Host Details</DialogTitle>
                <DialogContent>
                    {selectedHost && (
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: '#4caf50', fontSize: 24 }}>
                                    {selectedHost.name[0]}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{selectedHost.name}</Typography>
                                    <Typography color="text.secondary">{selectedHost.email}</Typography>
                                    <Typography variant="caption" color="text.secondary">{selectedHost.phone}</Typography>
                                </Box>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Properties</Typography>
                                    <Typography variant="h6">{selectedHost.properties}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Total Revenue</Typography>
                                    <Typography variant="h6">{formatCurrency(selectedHost.revenue)}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Total Bookings</Typography>
                                    <Typography variant="h6">{selectedHost.totalBookings}</Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography color="text.secondary" variant="caption">Member Since</Typography>
                                    <Typography variant="h6">{selectedHost.joinDate}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<Email />}>Send Email</Button>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

