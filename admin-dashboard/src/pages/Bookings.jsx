import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
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
    CircularProgress,
    Menu,
    MenuItem,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon,
    MoreVert as MoreVertIcon,
    CheckCircle as ApproveIcon,
    Block as RejectIcon
} from '@mui/icons-material';
import { bookingService } from '../services/api';

const Bookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

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

    const filteredBookings = bookings.filter(b =>
        b.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guest?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guest?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Bookings Management
                </Typography>
                <IconButton>
                    <FilterIcon />
                </IconButton>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box p={3}>
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
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
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
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" sx={{ mt: 1 }}>Loading bookings...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="textSecondary">No bookings found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredBookings.map((booking) => (
                                <TableRow key={booking.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                                            {booking.id?.slice(0, 8)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {booking.property?.title || 'Unknown Property'}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {booking.property?.city || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName}` : 'Unknown'}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            {booking.guest?.email || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {formatDate(booking.checkIn)}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary">
                                            to {formatDate(booking.checkOut)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">
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
                                        <IconButton onClick={(e) => handleMenuOpen(e, booking)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ViewIcon sx={{ mr: 1, fontSize: 18 }} /> View Details
                </MenuItem>
                <MenuItem onClick={() => handleUpdateStatus('confirmed')} sx={{ color: 'success.main' }}>
                    <ApproveIcon sx={{ mr: 1, fontSize: 18 }} /> Approve
                </MenuItem>
                <MenuItem onClick={() => handleUpdateStatus('cancelled')} sx={{ color: 'error.main' }}>
                    <RejectIcon sx={{ mr: 1, fontSize: 18 }} /> Reject
                </MenuItem>
            </Menu>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Bookings;
