import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    ButtonGroup,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Avatar
} from '@mui/material';
import {
    Download,
    TrendingUp,
    TrendingDown,
    AttachMoney,
    CalendarToday,
    Home,
    People
} from '@mui/icons-material';

// Mock data for reports
const monthlyRevenue = [
    { month: 'Jul 2025', revenue: 1200000, bookings: 45, commission: 120000 },
    { month: 'Aug 2025', revenue: 1450000, bookings: 52, commission: 145000 },
    { month: 'Sep 2025', revenue: 1100000, bookings: 41, commission: 110000 },
    { month: 'Oct 2025', revenue: 1650000, bookings: 58, commission: 165000 },
    { month: 'Nov 2025', revenue: 1800000, bookings: 65, commission: 180000 },
    { month: 'Dec 2025', revenue: 1550000, bookings: 54, commission: 155000 },
];

const topProperties = [
    { id: 1, title: 'Skyline Glass Penthouse', host: 'Chidinma Lagos', bookings: 28, revenue: 2380000, rating: 4.9 },
    { id: 2, title: 'Neon Horizon Duplex', host: 'Yusuf Ahmad', bookings: 22, revenue: 2090000, rating: 4.8 },
    { id: 3, title: 'Solaris Grand Hotel', host: 'Ngozi Eze', bookings: 35, revenue: 1925000, rating: 4.7 },
    { id: 4, title: 'Quantum Smart-Stay', host: 'Blessing Okonkwo', bookings: 42, revenue: 1470000, rating: 4.6 },
    { id: 5, title: 'Infinity Neon Club', host: 'Tunde Adeyemi', bookings: 8, revenue: 2000000, rating: 4.9 },
];

const topHosts = [
    { id: 1, name: 'Ngozi Eze', properties: 5, bookings: 89, revenue: 2100000, rating: 4.8 },
    { id: 2, name: 'Chidinma Lagos', properties: 3, bookings: 45, revenue: 850000, rating: 4.7 },
    { id: 3, name: 'Blessing Okonkwo', properties: 4, bookings: 67, revenue: 1250000, rating: 4.6 },
];

export default function Reports() {
    const [dateRange, setDateRange] = useState('6months');
    const [reportType, setReportType] = useState('revenue');

    const formatCurrency = (amount) => {
        if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `₦${(amount / 1000).toFixed(0)}K`;
        return `₦${amount}`;
    };

    const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const totalBookings = monthlyRevenue.reduce((sum, m) => sum + m.bookings, 0);
    const totalCommission = monthlyRevenue.reduce((sum, m) => sum + m.commission, 0);
    const avgBookingValue = totalRevenue / totalBookings;

    const handleExport = (format) => {
        // Mock export functionality
        const data = reportType === 'revenue' ? monthlyRevenue :
            reportType === 'properties' ? topProperties : topHosts;

        if (format === 'csv') {
            const headers = Object.keys(data[0]).join(',');
            const rows = data.map(row => Object.values(row).join(',')).join('\n');
            const csv = `${headers}\n${rows}`;
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `justback_${reportType}_report.csv`;
            a.click();
        } else {
            alert(`Exporting ${reportType} report as ${format.toUpperCase()}...`);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Reports & Analytics
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Date Range</InputLabel>
                        <Select
                            value={dateRange}
                            label="Date Range"
                            onChange={(e) => setDateRange(e.target.value)}
                        >
                            <MenuItem value="30days">Last 30 Days</MenuItem>
                            <MenuItem value="3months">Last 3 Months</MenuItem>
                            <MenuItem value="6months">Last 6 Months</MenuItem>
                            <MenuItem value="1year">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                    <ButtonGroup variant="outlined" size="small">
                        <Button onClick={() => handleExport('csv')} startIcon={<Download />}>
                            CSV
                        </Button>
                        <Button onClick={() => handleExport('pdf')}>
                            PDF
                        </Button>
                    </ButtonGroup>
                </Box>
            </Box>

            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography color="rgba(255,255,255,0.8)" variant="caption">
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="h4" color="white" fontWeight="bold">
                                        {formatCurrency(totalRevenue)}
                                    </Typography>
                                    <Chip
                                        icon={<TrendingUp sx={{ color: '#4caf50 !important' }} />}
                                        label="+12.5%"
                                        size="small"
                                        sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <AttachMoney sx={{ color: 'white' }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography color="rgba(255,255,255,0.8)" variant="caption">
                                        Total Bookings
                                    </Typography>
                                    <Typography variant="h4" color="white" fontWeight="bold">
                                        {totalBookings}
                                    </Typography>
                                    <Chip
                                        icon={<TrendingUp sx={{ color: '#4caf50 !important' }} />}
                                        label="+8.3%"
                                        size="small"
                                        sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <CalendarToday sx={{ color: 'white' }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography color="rgba(255,255,255,0.8)" variant="caption">
                                        Platform Commission
                                    </Typography>
                                    <Typography variant="h4" color="white" fontWeight="bold">
                                        {formatCurrency(totalCommission)}
                                    </Typography>
                                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                                        10% of revenue
                                    </Typography>
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <TrendingUp sx={{ color: 'white' }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ borderRadius: 3, boxShadow: 2, background: 'linear-gradient(135deg, #4776E6 0%, #8E54E9 100%)' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <Box>
                                    <Typography color="rgba(255,255,255,0.8)" variant="caption">
                                        Avg. Booking Value
                                    </Typography>
                                    <Typography variant="h4" color="white" fontWeight="bold">
                                        {formatCurrency(avgBookingValue)}
                                    </Typography>
                                    <Chip
                                        icon={<TrendingDown sx={{ color: '#f44336 !important' }} />}
                                        label="-2.1%"
                                        size="small"
                                        sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                                    />
                                </Box>
                                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                    <Home sx={{ color: 'white' }} />
                                </Avatar>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Report Type Tabs */}
            <ButtonGroup variant="outlined" sx={{ mb: 3 }}>
                <Button
                    variant={reportType === 'revenue' ? 'contained' : 'outlined'}
                    onClick={() => setReportType('revenue')}
                >
                    Revenue Report
                </Button>
                <Button
                    variant={reportType === 'properties' ? 'contained' : 'outlined'}
                    onClick={() => setReportType('properties')}
                >
                    Top Properties
                </Button>
                <Button
                    variant={reportType === 'hosts' ? 'contained' : 'outlined'}
                    onClick={() => setReportType('hosts')}
                >
                    Top Hosts
                </Button>
            </ButtonGroup>

            {/* Revenue Report Table */}
            {reportType === 'revenue' && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Month</TableCell>
                                <TableCell align="right">Revenue</TableCell>
                                <TableCell align="right">Bookings</TableCell>
                                <TableCell align="right">Commission (10%)</TableCell>
                                <TableCell align="right">Avg. per Booking</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {monthlyRevenue.map((row) => (
                                <TableRow key={row.month} hover>
                                    <TableCell>{row.month}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.revenue)}</TableCell>
                                    <TableCell align="right">{row.bookings}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.commission)}</TableCell>
                                    <TableCell align="right">{formatCurrency(row.revenue / row.bookings)}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: '#e8f5e9' }}>
                                <TableCell><strong>Total</strong></TableCell>
                                <TableCell align="right"><strong>{formatCurrency(totalRevenue)}</strong></TableCell>
                                <TableCell align="right"><strong>{totalBookings}</strong></TableCell>
                                <TableCell align="right"><strong>{formatCurrency(totalCommission)}</strong></TableCell>
                                <TableCell align="right"><strong>{formatCurrency(avgBookingValue)}</strong></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Top Properties Table */}
            {reportType === 'properties' && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Property</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell align="right">Bookings</TableCell>
                                <TableCell align="right">Revenue</TableCell>
                                <TableCell align="center">Rating</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topProperties.map((property, index) => (
                                <TableRow key={property.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            color={index < 3 ? 'primary' : 'default'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell><strong>{property.title}</strong></TableCell>
                                    <TableCell>{property.host}</TableCell>
                                    <TableCell align="right">{property.bookings}</TableCell>
                                    <TableCell align="right">{formatCurrency(property.revenue)}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`⭐ ${property.rating}`}
                                            size="small"
                                            variant="outlined"
                                            color={property.rating >= 4.8 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Top Hosts Table */}
            {reportType === 'hosts' && (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell align="right">Properties</TableCell>
                                <TableCell align="right">Total Bookings</TableCell>
                                <TableCell align="right">Total Revenue</TableCell>
                                <TableCell align="center">Avg Rating</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topHosts.map((host, index) => (
                                <TableRow key={host.id} hover>
                                    <TableCell>
                                        <Chip
                                            label={index + 1}
                                            size="small"
                                            color={index < 3 ? 'primary' : 'default'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#4caf50' }}>
                                                {host.name[0]}
                                            </Avatar>
                                            <strong>{host.name}</strong>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">{host.properties}</TableCell>
                                    <TableCell align="right">{host.bookings}</TableCell>
                                    <TableCell align="right">{formatCurrency(host.revenue)}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={`⭐ ${host.rating}`}
                                            size="small"
                                            variant="outlined"
                                            color={host.rating >= 4.7 ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
