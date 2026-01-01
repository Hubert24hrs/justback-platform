import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Skeleton,
} from '@mui/material'
import {
    TrendingUp,
    Home as HomeIcon,
    CalendarMonth,
    AccountBalanceWallet,
    ArrowForward,
    Person,
} from '@mui/icons-material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

const mockChartData = [
    { month: 'Jul', earnings: 120000 },
    { month: 'Aug', earnings: 180000 },
    { month: 'Sep', earnings: 150000 },
    { month: 'Oct', earnings: 220000 },
    { month: 'Nov', earnings: 280000 },
    { month: 'Dec', earnings: 250000 },
]

export default function Dashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentBookings, setRecentBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch host stats (mock data for now)
            setStats({
                totalEarnings: 2500000,
                thisMonthEarnings: 350000,
                totalProperties: 5,
                activeBookings: 8,
                occupancyRate: 78,
            })

            // Fetch recent bookings
            const bookingsRes = await api.get('/bookings', { params: { limit: 5 } })
            if (bookingsRes.data.success) {
                setRecentBookings(bookingsRes.data.data.bookings.slice(0, 5))
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({ title, value, subtitle, icon, color }) => (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography color="text.secondary" variant="body2" gutterBottom>
                            {title}
                        </Typography>
                        {loading ? (
                            <Skeleton width={100} height={40} />
                        ) : (
                            <Typography variant="h4" fontWeight={700}>
                                {value}
                            </Typography>
                        )}
                        {subtitle && (
                            <Typography variant="body2" color="success.main" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUp fontSize="small" /> {subtitle}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${color}.light`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    )

    const formatMoney = (amount) => {
        return '₦' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Dashboard
                    </Typography>
                    <Typography color="text.secondary">
                        Welcome back! Here's what's happening with your properties.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<HomeIcon />}
                    onClick={() => navigate('/properties/add')}
                >
                    Add Property
                </Button>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Earnings"
                        value={stats ? formatMoney(stats.totalEarnings) : '-'}
                        subtitle="+12% from last month"
                        icon={<AccountBalanceWallet sx={{ color: 'primary.main' }} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="This Month"
                        value={stats ? formatMoney(stats.thisMonthEarnings) : '-'}
                        icon={<TrendingUp sx={{ color: 'success.main' }} />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Properties"
                        value={stats?.totalProperties || '-'}
                        icon={<HomeIcon sx={{ color: 'info.main' }} />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Active Bookings"
                        value={stats?.activeBookings || '-'}
                        subtitle={`${stats?.occupancyRate}% occupancy`}
                        icon={<CalendarMonth sx={{ color: 'warning.main' }} />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Earnings Chart */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">Earnings Overview</Typography>
                                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/earnings')}>
                                    View Details
                                </Button>
                            </Box>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={mockChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                    <Line
                                        type="monotone"
                                        dataKey="earnings"
                                        stroke="#2E7D32"
                                        strokeWidth={3}
                                        dot={{ fill: '#2E7D32', strokeWidth: 2 }}
                                        activeDot={{ r: 8 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Bookings */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Recent Bookings</Typography>
                                <Button size="small" endIcon={<ArrowForward />} onClick={() => navigate('/bookings')}>
                                    View All
                                </Button>
                            </Box>
                            <List>
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <ListItem key={i}>
                                            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton width="80%" />
                                                <Skeleton width="60%" />
                                            </Box>
                                        </ListItem>
                                    ))
                                ) : recentBookings.length === 0 ? (
                                    <Typography color="text.secondary" align="center" py={4}>
                                        No recent bookings
                                    </Typography>
                                ) : (
                                    recentBookings.map((booking) => (
                                        <ListItem key={booking.id} sx={{ px: 0 }}>
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: 'primary.light' }}>
                                                    <Person />
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={booking.property?.title || 'Property'}
                                                secondary={`${booking.checkIn} → ${booking.checkOut}`}
                                            />
                                            <Chip
                                                label={booking.status}
                                                size="small"
                                                color={getStatusColor(booking.status)}
                                            />
                                        </ListItem>
                                    ))
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    )
}
