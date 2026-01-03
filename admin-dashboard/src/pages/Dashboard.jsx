import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, CircularProgress, Grow, Tooltip as MuiTooltip } from '@mui/material';
import {
    TrendingUp,
    Home,
    CalendarToday,
    Phone,
    AttachMoney,
    People,
    MoreVert
} from '@mui/icons-material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import api, { adminService } from '../services/api';

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
            const response = await adminService.getDashboardData();
            setStats(response.data);
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
        { title: 'Active Bookings', value: stats?.stats?.activeBookings || 0, icon: <CalendarToday />, color: '#2979FF' },
        { title: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: <People />, color: '#7B1FA2' },
        { title: 'AI Calls Today', value: stats?.stats?.aiCallsToday || 0, icon: <Phone />, color: '#FF9100' },
        { title: 'Today Revenue', value: formatCurrency(stats?.stats?.todayRevenue), icon: <AttachMoney />, color: '#4CAF50' },
        { title: 'Monthly Revenue', value: formatCurrency(stats?.stats?.monthRevenue), icon: <TrendingUp />, color: '#F50057' },
    ];

    // Transform bookingsByStatus for PieChart
    const pieData = stats?.bookingsByStatus ? Object.entries(stats.bookingsByStatus).map(([name, value]) => ({ name, value })) : [];
    const COLORS = ['#00C853', '#FFD600', '#D50000', '#2962FF']; // Confirmed, Pending, Cancelled, Other

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    Dashboard Overview
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Last updated: {new Date().toLocaleTimeString()}
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3}>
                {statCards.map((stat, index) => (
                    <Grow in={true} timeout={300 + (index * 100)} key={index}>
                        <Grid item xs={12} sm={6} md={4} lg={2}>
                            <Paper
                                sx={{
                                    p: 2.5,
                                    height: 140,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <Typography color="textSecondary" variant="body2" fontWeight="600">
                                        {stat.title}
                                    </Typography>
                                    <Box
                                        sx={{
                                            backgroundColor: `${stat.color}15`, // 15% opacity
                                            color: stat.color,
                                            p: 1,
                                            borderRadius: 2,
                                            display: 'flex'
                                        }}
                                    >
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h4" fontWeight="bold">
                                    {stat.value}
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grow>
                ))}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Revenue Area Chart */}
                <Grow in={true} timeout={1000}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, height: 420, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Revenue Trends (Last 6 Months)
                            </Typography>
                            <Box sx={{ height: 340, width: '100%', mt: 2 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats?.revenueChart || []}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00A86B" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B778C', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B778C', fontSize: 12 }}
                                            tickFormatter={(val) => `₦${val / 1000}k`}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#00A86B" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grow>

                {/* Recent Bookings List */}
                <Grow in={true} timeout={1200}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, height: 420, borderRadius: 3, display: 'flex', flexDirection: 'column' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" fontWeight="bold">
                                    Recent Bookings
                                </Typography>
                            </Box>
                            <Box sx={{ overflowY: 'auto', flex: 1 }}>
                                {stats?.recentBookings?.length > 0 ? (
                                    stats.recentBookings.map((booking, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                py: 2,
                                                borderBottom: '1px solid #F5F5F5',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:last-child': { borderBottom: 'none' }
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" noWrap sx={{ maxWidth: 160 }}>
                                                    {booking.property}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    {booking.guest}
                                                </Typography>
                                            </Box>
                                            <Box textAlign="right">
                                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                                    ₦{(booking.amount).toLocaleString()}
                                                </Typography>
                                                <Box
                                                    component="span"
                                                    sx={{
                                                        px: 1, py: 0.25,
                                                        borderRadius: 1,
                                                        bgcolor: booking.status === 'confirmed' ? '#E8F5E9' : '#FFF3E0',
                                                        color: booking.status === 'confirmed' ? 'success.main' : 'warning.main',
                                                        fontSize: '0.65rem',
                                                        fontWeight: 'bold',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {booking.status}
                                                </Box>
                                            </Box>
                                        </Box>
                                    ))
                                ) : (
                                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%">
                                        <Typography color="textSecondary">No recent activity</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grow>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Booking Status Pie Chart */}
                <Grow in={true} timeout={1400}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: 350, borderRadius: 3 }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Booking Composition
                            </Typography>
                            <Box sx={{ height: 280, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="middle" align="right" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grow>

                {/* Top Cities */}
                <Grow in={true} timeout={1600}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ p: 3, height: 350, borderRadius: 3, overflowY: 'auto' }}>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Top Performing Cities
                            </Typography>
                            <Box sx={{ mt: 3 }}>
                                {stats?.topCities?.map((city, index) => (
                                    <Box key={index} sx={{ mb: 3 }}>
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" fontWeight="600">{city.city}</Typography>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">{city.bookings} Bookings</Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 8,
                                                bgcolor: '#F5F5F5',
                                                borderRadius: 4,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Grow in={true} timeout={1000 + (index * 200)}>
                                                <Box sx={{
                                                    width: `${Math.min((city.bookings / 20) * 100, 100)}%`, // Mock scale
                                                    height: '100%',
                                                    bgcolor: index === 0 ? '#00A86B' : '#2979FF',
                                                    borderRadius: 4
                                                }} />
                                            </Grow>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                </Grow>
            </Grid>
        </Box>
    );
}
