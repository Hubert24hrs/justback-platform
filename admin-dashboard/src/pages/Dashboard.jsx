import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress } from '@mui/material';
import {
    TrendingUp,
    Home,
    CalendarToday,
    Phone,
    AttachMoney,
    People
} from '@mui/icons-material';
import api from '../services/api';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/analytics/dashboard');
            setStats(response.data.data);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (amount >= 1000000) {
            return `₦${(amount / 1000000).toFixed(1)}M`;
        }
        return `₦${amount?.toLocaleString() || 0}`;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const statCards = [
        { title: 'Total Properties', value: stats?.stats?.totalProperties || 0, icon: <Home />, color: '#00A86B' },
        { title: 'Active Bookings', value: stats?.stats?.activeBookings || 0, icon: <CalendarToday />, color: '#2196F3' },
        { title: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: <People />, color: '#9C27B0' },
        { title: 'AI Calls Today', value: stats?.stats?.aiCallsToday || 0, icon: <Phone />, color: '#FF9800' },
        { title: 'Today Revenue', value: formatCurrency(stats?.stats?.todayRevenue), icon: <AttachMoney />, color: '#4CAF50' },
        { title: 'Monthly Revenue', value: formatCurrency(stats?.stats?.monthRevenue), icon: <TrendingUp />, color: '#E91E63' },
    ];

    return (
        <Box>
            <Typography variant="h4" gutterBottom fontWeight="bold">
                Dashboard Overview
            </Typography>

            <Grid container spacing={3}>
                {statCards.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                        <Paper
                            sx={{
                                p: 2.5,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 130,
                                borderRadius: 3,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                            }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                <Typography color="textSecondary" variant="body2" fontWeight="500">
                                    {stat.title}
                                </Typography>
                                <Box
                                    sx={{
                                        backgroundColor: stat.color,
                                        color: 'white',
                                        p: 0.8,
                                        borderRadius: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {stat.icon}
                                </Box>
                            </Box>
                            <Typography variant="h4" component="div" fontWeight="bold">
                                {stat.value}
                            </Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Revenue Overview
                        </Typography>
                        <Box sx={{ height: 320, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2, pt: 4 }}>
                            {stats?.revenueChart?.map((item, index) => (
                                <Box key={index} sx={{ flex: 1, textAlign: 'center' }}>
                                    <Box
                                        sx={{
                                            height: `${(item.revenue / 2000000) * 250}px`,
                                            minHeight: 20,
                                            backgroundColor: '#00A86B',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'all 0.3s',
                                            '&:hover': { backgroundColor: '#00C87B' }
                                        }}
                                    />
                                    <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
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
                    <Paper sx={{ p: 3, height: 400, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Recent Bookings
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {stats?.recentBookings?.length > 0 ? (
                                stats.recentBookings.map((booking, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            py: 1.5,
                                            borderBottom: index < 4 ? '1px solid #eee' : 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" fontWeight="500" noWrap sx={{ maxWidth: 160 }}>
                                                {booking.property}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                {booking.guest}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="body2" fontWeight="bold" color="success.main">
                                                ₦{(booking.amount / 1000).toFixed(0)}K
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: booking.status === 'confirmed' ? 'success.main' :
                                                        booking.status === 'pending' ? 'warning.main' :
                                                            booking.status === 'cancelled' ? 'error.main' : 'info.main',
                                                    fontWeight: 'bold',
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {booking.status}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                                    No recent bookings
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Bookings by Status
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            {stats?.bookingsByStatus && Object.entries(stats.bookingsByStatus).map(([status, count]) => (
                                <Box key={status} sx={{ flex: 1, textAlign: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Typography variant="h5" fontWeight="bold" color={
                                        status === 'confirmed' ? 'success.main' :
                                            status === 'pending' ? 'warning.main' :
                                                status === 'cancelled' ? 'error.main' : 'info.main'
                                    }>
                                        {count}
                                    </Typography>
                                    <Typography variant="caption" textTransform="capitalize">{status}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Top Cities
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {stats?.topCities?.map((city, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                                    <Typography variant="body2" sx={{ width: 120 }}>{city.city}</Typography>
                                    <Box sx={{ flex: 1, mx: 2, height: 8, bgcolor: 'grey.200', borderRadius: 4 }}>
                                        <Box sx={{
                                            width: `${(city.bookings / 100) * 100}%`,
                                            height: '100%',
                                            bgcolor: '#00A86B',
                                            borderRadius: 4
                                        }} />
                                    </Box>
                                    <Typography variant="body2" fontWeight="bold">{city.bookings}</Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
