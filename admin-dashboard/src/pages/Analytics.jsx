import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography
} from '@mui/material';
import {
    BarChart as BarChartIcon,
    TrendingUp
} from '@mui/icons-material';
import { adminService } from '../services/api';
import PageHeader from '../components/PageHeader';
import StatsCard from '../components/StatsCard';
import { ChartSkeleton, StatsCardSkeleton } from '../components/SkeletonLoader';

const Analytics = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminService.getDashboardData();
            setData(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <PageHeader
                title="Analytics & Reports"
                subtitle="Track your platform performance"
                icon={BarChartIcon}
            />

            {/* Key Metrics */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <StatsCardSkeleton />
                        </Grid>
                    ))
                ) : (
                    <>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Monthly Revenue"
                                value={`₦${((data?.stats?.monthRevenue || 0) / 1000000).toFixed(1)}M`}
                                color="#00A86B"
                                trend="up"
                                trendValue="+32%"
                                delay={0}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Total Bookings"
                                value={data?.stats?.totalBookings || 0}
                                color="#2979FF"
                                trend="up"
                                trendValue="+12%"
                                delay={100}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Properties"
                                value={data?.stats?.totalProperties || 0}
                                color="#FF9100"
                                trend="up"
                                trendValue="+8%"
                                delay={200}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Total Users"
                                value={data?.stats?.totalUsers || 0}
                                color="#7B1FA2"
                                trend="up"
                                trendValue="+24%"
                                delay={300}
                            />
                        </Grid>
                    </>
                )}
            </Grid>

            <Grid container spacing={3}>
                {/* Revenue Chart */}
                <Grid item xs={12} md={8}>
                    {loading ? (
                        <ChartSkeleton height={400} />
                    ) : (
                        <Paper
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: 400,
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    borderColor: 'primary.light',
                                    boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                                }
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Monthly Revenue Trend
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                                Last 6 months performance
                            </Typography>
                            <Box sx={{ height: 280, display: 'flex', alignItems: 'flex-end', gap: 2, px: 2 }}>
                                {data?.revenueChart?.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            flex: 1,
                                            textAlign: 'center',
                                            animation: 'slideUp 0.5s ease-out',
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: `${(item.revenue / 2000000) * 220}px`,
                                                minHeight: 20,
                                                background: 'linear-gradient(180deg, #00A86B 0%, #00D4AA 100%)',
                                                borderRadius: '8px 8px 0 0',
                                                transition: 'all 0.3s',
                                                boxShadow: '0 4px 14px rgba(0, 168, 107, 0.2)',
                                                '&:hover': {
                                                    transform: 'scaleY(1.05)',
                                                    transformOrigin: 'bottom',
                                                    boxShadow: '0 8px 24px rgba(0, 168, 107, 0.3)'
                                                }
                                            }}
                                        />
                                        <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                                            {item.month}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            ₦{(item.revenue / 1000000).toFixed(1)}M
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Paper>
                    )}
                </Grid>

                {/* Booking Status */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            height: 400,
                            border: '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                borderColor: 'primary.light',
                                boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                            }
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Booking Status Distribution
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                            Breakdown by status
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {data?.bookingsByStatus && Object.entries(data.bookingsByStatus).map(([status, count], index) => {
                                const colors = {
                                    confirmed: '#00C853',
                                    pending: '#FF9100',
                                    cancelled: '#FF1744',
                                    completed: '#2979FF'
                                };
                                const total = Object.values(data.bookingsByStatus).reduce((a, b) => a + b, 0);
                                const percentage = ((count / total) * 100).toFixed(0);

                                return (
                                    <Box
                                        key={status}
                                        sx={{
                                            mb: 3,
                                            animation: 'slideIn 0.3s ease-out',
                                            animationDelay: `${index * 100}ms`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" textTransform="capitalize" fontWeight="500">
                                                {status}
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {count} ({percentage}%)
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: '100%', height: 8, bgcolor: 'grey.100', borderRadius: 4 }}>
                                            <Box
                                                sx={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    bgcolor: colors[status] || '#9e9e9e',
                                                    borderRadius: 4,
                                                    transition: 'width 1s ease-out',
                                                    transitionDelay: `${index * 150}ms`
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>
                </Grid>

                {/* Top Cities */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
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
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Top Performing Cities
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                            Based on booking volume
                        </Typography>
                        <Box sx={{ mt: 2 }}>
                            {data?.topCities?.map((city, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        mb: 2.5,
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 100}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'grey.200',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mr: 2,
                                            fontWeight: 'bold',
                                            color: index < 3 ? 'white' : 'text.secondary',
                                            fontSize: '0.875rem',
                                            boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                                        }}
                                    >
                                        {index + 1}
                                    </Box>
                                    <Typography variant="body1" sx={{ width: 120, fontWeight: 500 }}>{city.city}</Typography>
                                    <Box sx={{ flex: 1, mx: 2, height: 8, bgcolor: 'grey.100', borderRadius: 4 }}>
                                        <Box
                                            sx={{
                                                width: `${Math.min((city.bookings / 100) * 100, 100)}%`,
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
                                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                                        {city.bookings}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>

                {/* Quick Stats */}
                <Grid item xs={12} md={6}>
                    <Paper
                        sx={{
                            p: 3,
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
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Performance Insights
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3 }}>
                            Key platform metrics
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        bgcolor: 'rgba(0, 168, 107, 0.1)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <TrendingUp sx={{ color: 'primary.main', fontSize: 32, mb: 1 }} />
                                    <Typography variant="h5" fontWeight="bold" color="primary.main">
                                        32%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Revenue Growth
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        bgcolor: 'rgba(41, 121, 255, 0.1)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold" color="secondary.main">
                                        4.8
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Avg. Rating
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        bgcolor: 'rgba(255, 145, 0, 0.1)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold" color="warning.main">
                                        85%
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Occupancy Rate
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        p: 2.5,
                                        bgcolor: 'rgba(123, 31, 162, 0.1)',
                                        borderRadius: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h5" fontWeight="bold" sx={{ color: '#7B1FA2' }}>
                                        2.3K
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        AI Calls/Month
                                    </Typography>
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
