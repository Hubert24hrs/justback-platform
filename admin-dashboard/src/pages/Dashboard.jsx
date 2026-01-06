import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Grow, IconButton, Tooltip } from '@mui/material';
import {
    TrendingUp,
    Home,
    CalendarToday,
    Phone,
    AttachMoney,
    People,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { adminService } from '../services/api';
import StatsCard from '../components/StatsCard';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { StatsCardSkeleton, ChartSkeleton, ListSkeleton } from '../components/SkeletonLoader';

export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardData();
            setStats(response.data);
            setLastUpdated(new Date());
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

    const statCards = [
        { title: 'Total Properties', value: stats?.stats?.totalProperties || 0, icon: Home, color: '#00A86B', trend: 'up', trendValue: '+12%' },
        { title: 'Active Bookings', value: stats?.stats?.activeBookings || 0, icon: CalendarToday, color: '#2979FF', trend: 'up', trendValue: '+8%' },
        { title: 'Total Users', value: stats?.stats?.totalUsers || 0, icon: People, color: '#7B1FA2', trend: 'up', trendValue: '+24%' },
        { title: 'AI Calls Today', value: stats?.stats?.aiCallsToday || 0, icon: Phone, color: '#FF9100' },
        { title: 'Today Revenue', value: formatCurrency(stats?.stats?.todayRevenue), icon: AttachMoney, color: '#4CAF50', trend: 'up', trendValue: '+15%' },
        { title: 'Monthly Revenue', value: formatCurrency(stats?.stats?.monthRevenue), icon: TrendingUp, color: '#F50057', trend: 'up', trendValue: '+32%' },
    ];

    // Transform bookingsByStatus for PieChart
    const pieData = stats?.bookingsByStatus ? Object.entries(stats.bookingsByStatus).map(([name, value]) => ({ name, value })) : [];
    const COLORS = ['#00C853', '#FFD600', '#D50000', '#2962FF'];

    if (error) {
        return (
            <Box>
                <PageHeader
                    title="Dashboard Overview"
                    subtitle="Monitor your platform performance"
                />
                <EmptyState
                    type="error"
                    title="Failed to Load Dashboard"
                    description={error}
                    actionLabel="Try Again"
                    onAction={fetchDashboardData}
                />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Header */}
            <PageHeader
                title="Dashboard Overview"
                subtitle={`Last updated: ${lastUpdated.toLocaleTimeString()}`}
                action={
                    <Tooltip title="Refresh data">
                        <IconButton
                            onClick={fetchDashboardData}
                            sx={{
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': { bgcolor: 'primary.main', color: 'white' }
                            }}
                        >
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                }
            />

            {/* Stats Cards */}
            <Grid container spacing={2.5}>
                {loading ? (
                    [...Array(6)].map((_, index) => (
                        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
                            <StatsCardSkeleton />
                        </Grid>
                    ))
                ) : (
                    statCards.map((stat, index) => (
                        <Grow in={true} timeout={300 + (index * 100)} key={index}>
                            <Grid item xs={12} sm={6} md={4} lg={2}>
                                <StatsCard
                                    title={stat.title}
                                    value={stat.value}
                                    icon={stat.icon}
                                    color={stat.color}
                                    trend={stat.trend}
                                    trendValue={stat.trendValue}
                                    delay={index * 100}
                                />
                            </Grid>
                        </Grow>
                    ))
                )}
            </Grid>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                {/* Revenue Area Chart */}
                <Grow in={true} timeout={1000}>
                    <Grid item xs={12} md={8}>
                        {loading ? (
                            <ChartSkeleton height={420} />
                        ) : (
                            <Paper
                                sx={{
                                    p: 3,
                                    height: 420,
                                    borderRadius: 3,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        borderColor: 'primary.light',
                                        boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Box>
                                        <Typography variant="h6" fontWeight="bold">
                                            Revenue Trends
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Last 6 months performance
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 0.5,
                                            borderRadius: 2,
                                            bgcolor: 'success.main',
                                            color: 'white',
                                            fontSize: '0.75rem',
                                            fontWeight: 600
                                        }}
                                    >
                                        +32% Growth
                                    </Box>
                                </Box>
                                <Box sx={{ height: 320, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats?.revenueChart || []}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#00A86B" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#00A86B" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B778C', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B778C', fontSize: 12 }}
                                                tickFormatter={(val) => `₦${val / 1000}k`}
                                            />
                                            <RechartsTooltip
                                                contentStyle={{
                                                    borderRadius: 12,
                                                    border: 'none',
                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                                    padding: '12px 16px'
                                                }}
                                                formatter={(value) => [`₦${value.toLocaleString()}`, 'Revenue']}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#00A86B"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        )}
                    </Grid>
                </Grow>

                {/* Recent Bookings List */}
                <Grow in={true} timeout={1200}>
                    <Grid item xs={12} md={4}>
                        <Paper
                            sx={{
                                p: 3,
                                height: 420,
                                borderRadius: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.light',
                                    boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                                }
                            }}
                        >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Recent Bookings
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Latest activity
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ overflowY: 'auto', flex: 1 }}>
                                {loading ? (
                                    <ListSkeleton items={5} />
                                ) : stats?.recentBookings?.length > 0 ? (
                                    stats.recentBookings.map((booking, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                py: 2,
                                                borderBottom: '1px solid',
                                                borderColor: 'divider',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                '&:last-child': { borderBottom: 'none' },
                                                animation: 'slideIn 0.3s ease-out',
                                                animationDelay: `${index * 50}ms`,
                                                animationFillMode: 'both'
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" noWrap sx={{ maxWidth: 160 }}>
                                                    {booking.property}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" display="block">
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
                                                        px: 1,
                                                        py: 0.25,
                                                        borderRadius: 1,
                                                        bgcolor: booking.status === 'confirmed' ? 'success.main' : 'warning.main',
                                                        color: 'white',
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
                                        <Typography color="text.secondary">No recent activity</Typography>
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
                        <Paper
                            sx={{
                                p: 3,
                                height: 350,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.light',
                                    boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                                }
                            }}
                        >
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Booking Composition
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                                Breakdown by status
                            </Typography>
                            <Box sx={{ height: 260, width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Box>
                        </Paper>
                    </Grid>
                </Grow>

                {/* Top Cities */}
                <Grow in={true} timeout={1600}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                height: 350,
                                borderRadius: 3,
                                overflowY: 'auto',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.light',
                                    boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                                }
                            }}
                        >
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Top Performing Cities
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                Based on booking volume
                            </Typography>
                            <Box>
                                {stats?.topCities?.map((city, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            mb: 3,
                                            animation: 'slideIn 0.3s ease-out',
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        bgcolor: index === 0 ? 'primary.main' : 'grey.200',
                                                        color: index === 0 ? 'white' : 'text.secondary',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 600,
                                                        fontSize: '0.65rem'
                                                    }}
                                                >
                                                    {index + 1}
                                                </Typography>
                                                <Typography variant="body2" fontWeight="600">{city.city}</Typography>
                                            </Box>
                                            <Typography variant="body2" color="primary.main" fontWeight="bold">
                                                {city.bookings} Bookings
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 8,
                                                bgcolor: 'grey.100',
                                                borderRadius: 4,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${Math.min((city.bookings / 20) * 100, 100)}%`,
                                                    height: '100%',
                                                    background: index === 0
                                                        ? 'linear-gradient(90deg, #00A86B 0%, #00D4AA 100%)'
                                                        : 'linear-gradient(90deg, #2979FF 0%, #75A7FF 100%)',
                                                    borderRadius: 4,
                                                    transition: 'width 1s ease-out',
                                                    transitionDelay: `${index * 200}ms`
                                                }}
                                            />
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
