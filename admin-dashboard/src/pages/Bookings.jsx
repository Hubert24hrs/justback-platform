import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as ApproveIcon,
    Block as RejectIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { bookingService } from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const data = await bookingService.getAll();
            setBookings(data.data.bookings || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showNotification('Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, booking) => {
        setAnchorEl(event.currentTarget);
        setSelectedBooking(booking);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBooking(null);
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedBooking) return;
        try {
            await bookingService.updateStatus(selectedBooking.id, status);
            showNotification(`Booking ${status.toLowerCase()} successfully`);
            fetchBookings();
        } catch (error) {
            console.error('Error updating booking status:', error);
            showNotification('Failed to update booking status', 'error');
        }
        handleMenuClose();
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'success';
            case 'pending': return 'warning';
            case 'cancelled': return 'error';
            case 'completed': return 'info';
            case 'checked_in': return 'primary';
            default: return 'default';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getFilteredBookings = () => {
        let filtered = bookings.filter(b =>
            b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (tabValue === 1) filtered = filtered.filter(b => b.status?.toLowerCase() === 'pending');
        if (tabValue === 2) filtered = filtered.filter(b => b.status?.toLowerCase() === 'confirmed');
        if (tabValue === 3) filtered = filtered.filter(b => b.status?.toLowerCase() === 'completed');

        return filtered;
    };

    const filteredBookings = getFilteredBookings();

    const statusCounts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status?.toLowerCase() === 'pending').length,
        confirmed: bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length,
        completed: bookings.filter(b => b.status?.toLowerCase() === 'completed').length
    };

    return (
        <Box>
            <PageHeader
                title="Bookings"
                subtitle={`${bookings.length} total bookings`}
                icon={CalendarIcon}
            />

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
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 56
                            }
                        }}
                    >
                        <Tab label={`All (${statusCounts.all})`} />
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Pending <Chip size="small" label={statusCounts.pending} color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>} />
                        <Tab label={`Confirmed (${statusCounts.confirmed})`} />
                        <Tab label={`Completed (${statusCounts.completed})`} />
                    </Tabs>
                </Box>

                {/* Search */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        placeholder="Search bookings by ID, property, or guest..."
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Booking ID</TableCell>
                                <TableCell>Property</TableCell>
                                <TableCell>Guest</TableCell>
                                <TableCell>Check-in/out</TableCell>
                                <TableCell>Total</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ p: 0 }}>
                                        <TableSkeleton rows={5} columns={7} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <EmptyState
                                            type="search"
                                            title="No Bookings Found"
                                            description={searchTerm ? "Try adjusting your search terms" : "No bookings have been made yet"}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.map((booking, index) => (
                                <TableRow
                                    key={booking.id}
                                    hover
                                    sx={{
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 30}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight="bold"
                                            sx={{
                                                fontFamily: 'monospace',
                                                bgcolor: 'grey.100',
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: 1,
                                                display: 'inline-block'
                                            }}
                                        >
                                            {booking.id?.slice(0, 8)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box fontWeight="500" noWrap sx={{ maxWidth: 200 }}>
                                            {booking.property?.title || 'Unknown Property'}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.property?.city || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box fontWeight="500">
                                            {booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Unknown'}
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {booking.guest?.email || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box fontWeight="500">{formatDate(booking.checkIn)}</Box>
                                        <Typography variant="caption" color="text.secondary">
                                            → {formatDate(booking.checkOut)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            ₦{booking.totalPrice?.toLocaleString() || 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={booking.status?.toUpperCase() || 'UNKNOWN'}
                                            color={getStatusColor(booking.status)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, booking)}
                                            sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { borderRadius: 2, minWidth: 160, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }
                }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} /> View Details
                </MenuItem>
                <MenuItem onClick={() => handleUpdateStatus('confirmed')} sx={{ color: 'success.main' }}>
                    <ApproveIcon sx={{ mr: 1.5, fontSize: 18 }} /> Approve
                </MenuItem>
                <MenuItem onClick={() => handleUpdateStatus('cancelled')} sx={{ color: 'error.main' }}>
                    <RejectIcon sx={{ mr: 1.5, fontSize: 18 }} /> Reject
                </MenuItem>
            </Menu>

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
};

export default Bookings;
