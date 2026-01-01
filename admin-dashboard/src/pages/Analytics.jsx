import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    CircularProgress
} from '@mui/material';
import api from '../services/api';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/dashboard');
            setData(response.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Analytics & Reports
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Monthly Revenue Trend
                        </Typography>
                        <Box sx={{ height: 320, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2, pt: 4 }}>
                            {data?.revenueChart?.map((item, index) => (
                                <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            height: `${(item.revenue / 2000000) * 250}px`,
                                            minHeight: 20,
                                            background: 'linear-gradient(180deg, #00A86B 0%, #00C87B 100%)',
                                            borderRadius: '8px 8px 0 0',
                                            transition: 'all 0.3s',
                                            '&:hover': { transform: 'scaleY(1.05)', transformOrigin: 'bottom' }
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                        {item.month}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        ₦{(item.revenue / 1000000).toFixed(1)}M
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Booking Status Distribution
                        </Typography>
                        <Box sx={{ mt: 4 }}>
                            {data?.bookingsByStatus && Object.entries(data.bookingsByStatus).map(([status, count], index) => {
                                const colors = { confirmed: '#4CAF50', pending: '#FF9800', cancelled: '#f44336', completed: '#2196F3' };
                                const total = Object.values(data.bookingsByStatus).reduce((a, b) => a + b, 0);
                                const percentage = ((count / total) * 100).toFixed(0);

                                return (
                                    <Box key={status} sx={{ mb: 3 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" textTransform="capitalize">{status}</Typography>
                                            <Typography variant="body2" fontWeight="bold">{count} ({percentage}%)</Typography>
                                        </Box>
                                        <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                                            <Box sx={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                bgcolor: colors[status] || '#9e9e9e',
                                                borderRadius: 4,
                                                transition: 'width 0.5s'
                                            }} />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Performing Cities
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {data?.topCities?.map((city, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'grey.300',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            fontWeight: 'bold',
                                            color: index < 3 ? 'white' : 'text.secondary'
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                    <Typography variant="body1" sx={{ width: 120 }}>{city.city}</Typography>
                                    <Box sx={{ flex: 1, mx: 2, height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                                        <Box sx={{
                                            width: `${(city.bookings / 100) * 100}%`,
                                            height: '100%',
                                            bgcolor: '#00A86B',
                                            borderRadius: 4
                                        }} />
                                    </Box>
                                    <Typography variant="body1" fontWeight="bold">{city.bookings}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Key Metrics Summary
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="success.dark">
                                        ₦{((data?.stats?.monthRevenue || 0) / 1000000).toFixed(1)}M
                                    </Typography>
                                    <Typography variant="body2">Monthly Revenue</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="info.dark">
                                        {data?.stats?.totalBookings || 0}
                                    </Typography>
                                    <Typography variant="body2">Total Bookings</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="warning.dark">
                                        {data?.stats?.totalProperties || 0}
                                    </Typography>
                                    <Typography variant="body2">Properties</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box sx={{ p: 2, bgcolor: 'secondary.light', borderRadius: 2, textAlign: 'center' }}>
                                    <Typography variant="h4" fontWeight="bold" color="secondary.dark">
                                        {data?.stats?.totalUsers || 0}
                                    </Typography>
                                    <Typography variant="body2">Users</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Analytics;
