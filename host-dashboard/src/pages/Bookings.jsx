import { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tabs,
    Tab,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Skeleton,
    Avatar,
} from '@mui/material'
import {
    Visibility,
    Check,
    Close,
    Message,
    CalendarMonth,
    Person,
} from '@mui/icons-material'
import api from '../services/api'

export default function Bookings() {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [tabValue, setTabValue] = useState(0)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [detailsOpen, setDetailsOpen] = useState(false)

    useEffect(() => {
        fetchBookings()
    }, [])

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings')
            if (response.data.success) {
                setBookings(response.data.data.bookings)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue)
    }

    const getStatusColor = (status) => {
        const colors = {
            confirmed: 'success',
            pending: 'warning',
            cancelled: 'error',
            completed: 'info',
            checked_in: 'primary',
        }
        return colors[status] || 'default'
    }

    const formatMoney = (amount) => {
        return '₦' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const filterBookings = () => {
        switch (tabValue) {
            case 1:
                return bookings.filter(b => b.status === 'pending')
            case 2:
                return bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in')
            case 3:
                return bookings.filter(b => b.status === 'completed')
            default:
                return bookings
        }
    }

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking)
        setDetailsOpen(true)
    }

    const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        active: bookings.filter(b => b.status === 'confirmed' || b.status === 'checked_in').length,
        completed: bookings.filter(b => b.status === 'completed').length,
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Bookings
                </Typography>
                <Typography color="text.secondary">
                    Manage reservations for your properties
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, overflowX: 'auto' }}>
                {[
                    { label: 'Total', value: stats.total, icon: <CalendarMonth /> },
                    { label: 'Pending', value: stats.pending, icon: <CalendarMonth />, color: 'warning' },
                    { label: 'Active', value: stats.active, icon: <CalendarMonth />, color: 'success' },
                    { label: 'Completed', value: stats.completed, icon: <CalendarMonth />, color: 'info' },
                ].map((stat) => (
                    <Card key={stat.label} sx={{ minWidth: 140, flex: 1 }}>
                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="h4" fontWeight={700} color={stat.color ? `${stat.color}.main` : 'text.primary'}>
                                {stat.value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stat.label}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Card>
                <CardContent>
                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                        <Tab label="All" />
                        <Tab label="Pending" />
                        <Tab label="Active" />
                        <Tab label="Completed" />
                    </Tabs>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Guest</TableCell>
                                    <TableCell>Property</TableCell>
                                    <TableCell>Check-in</TableCell>
                                    <TableCell>Check-out</TableCell>
                                    <TableCell>Amount</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <TableRow key={i}>
                                            {[...Array(7)].map((_, j) => (
                                                <TableCell key={j}><Skeleton /></TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : filterBookings().length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                            <Typography color="text.secondary">No bookings found</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filterBookings().map((booking) => (
                                        <TableRow key={booking.id} hover>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                                                        <Person fontSize="small" />
                                                    </Avatar>
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {booking.guest?.firstName} {booking.guest?.lastName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {booking.guest?.email}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                                    {booking.property?.title || 'Property'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{booking.checkIn}</TableCell>
                                            <TableCell>{booking.checkOut}</TableCell>
                                            <TableCell fontWeight={600}>{formatMoney(booking.totalPrice)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={booking.status}
                                                    size="small"
                                                    color={getStatusColor(booking.status)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <IconButton size="small" onClick={() => handleViewDetails(booking)}>
                                                    <Visibility fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small">
                                                    <Message fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Booking Details Dialog */}
            <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Booking Details</DialogTitle>
                <DialogContent dividers>
                    {selectedBooking && (
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary">Property</Typography>
                            <Typography variant="body1" mb={2}>{selectedBooking.property?.title}</Typography>

                            <Typography variant="subtitle2" color="text.secondary">Guest</Typography>
                            <Typography variant="body1" mb={2}>
                                {selectedBooking.guest?.firstName} {selectedBooking.guest?.lastName}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Check-in</Typography>
                                    <Typography>{selectedBooking.checkIn}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Check-out</Typography>
                                    <Typography>{selectedBooking.checkOut}</Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Guests</Typography>
                                    <Typography>{selectedBooking.guests}</Typography>
                                </Box>
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary">Amount</Typography>
                                    <Typography fontWeight={600}>{formatMoney(selectedBooking.totalPrice)}</Typography>
                                </Box>
                            </Box>

                            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                            <Chip label={selectedBooking.status} color={getStatusColor(selectedBooking.status)} size="small" />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                    {selectedBooking?.status === 'pending' && (
                        <>
                            <Button color="error" startIcon={<Close />}>Decline</Button>
                            <Button variant="contained" startIcon={<Check />}>Accept</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    )
}
