import { useState } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Alert,
} from '@mui/material'
import {
    AccountBalanceWallet,
    TrendingUp,
    ArrowUpward,
    Download,
} from '@mui/icons-material'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockChartData = [
    { month: 'Jul', earnings: 120000, payouts: 100000 },
    { month: 'Aug', earnings: 180000, payouts: 150000 },
    { month: 'Sep', earnings: 150000, payouts: 120000 },
    { month: 'Oct', earnings: 220000, payouts: 180000 },
    { month: 'Nov', earnings: 280000, payouts: 230000 },
    { month: 'Dec', earnings: 250000, payouts: 200000 },
]

const mockPayouts = [
    { id: 1, date: '2025-12-28', amount: 200000, status: 'completed', bank: 'GTBank ****4521' },
    { id: 2, date: '2025-12-15', amount: 180000, status: 'completed', bank: 'GTBank ****4521' },
    { id: 3, date: '2025-12-01', amount: 150000, status: 'completed', bank: 'GTBank ****4521' },
    { id: 4, date: '2025-11-15', amount: 120000, status: 'completed', bank: 'GTBank ****4521' },
]

export default function Earnings() {
    const [withdrawOpen, setWithdrawOpen] = useState(false)
    const [withdrawAmount, setWithdrawAmount] = useState('')
    const [success, setSuccess] = useState('')

    const stats = {
        availableBalance: 450000,
        totalEarnings: 2500000,
        pendingPayouts: 50000,
        thisMonth: 280000,
    }

    const formatMoney = (amount) => {
        return '₦' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const handleWithdraw = () => {
        setSuccess('Withdrawal request submitted successfully!')
        setWithdrawOpen(false)
        setWithdrawAmount('')
        setTimeout(() => setSuccess(''), 3000)
    }

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Earnings
                    </Typography>
                    <Typography color="text.secondary">
                        Track your income and request payouts
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<ArrowUpward />} onClick={() => setWithdrawOpen(true)}>
                    Withdraw
                </Button>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)', color: 'white' }}>
                        <CardContent>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>Available Balance</Typography>
                            <Typography variant="h4" fontWeight={700} mt={1}>
                                {formatMoney(stats.availableBalance)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <AccountBalanceWallet fontSize="small" />
                                <Typography variant="body2">Total Earnings</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} mt={1}>
                                {formatMoney(stats.totalEarnings)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <TrendingUp fontSize="small" />
                                <Typography variant="body2">This Month</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} mt={1} color="success.main">
                                {formatMoney(stats.thisMonth)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <ArrowUpward fontSize="small" />
                                <Typography variant="body2">Pending Payouts</Typography>
                            </Box>
                            <Typography variant="h5" fontWeight={700} mt={1} color="warning.main">
                                {formatMoney(stats.pendingPayouts)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* Chart */}
                <Grid item xs={12} lg={8}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6">Earnings vs Payouts</Typography>
                                <Button size="small" startIcon={<Download />}>Export</Button>
                            </Box>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={mockChartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₦${v / 1000}k`} />
                                    <Tooltip formatter={(value) => formatMoney(value)} />
                                    <Area type="monotone" dataKey="earnings" stackId="1" stroke="#2E7D32" fill="#4CAF50" fillOpacity={0.3} />
                                    <Area type="monotone" dataKey="payouts" stackId="2" stroke="#FF9800" fill="#FFB74D" fillOpacity={0.3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Payout History */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" mb={2}>Payout History</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {mockPayouts.map((payout) => (
                                            <TableRow key={payout.id}>
                                                <TableCell>{payout.date}</TableCell>
                                                <TableCell>{formatMoney(payout.amount)}</TableCell>
                                                <TableCell>
                                                    <Chip label={payout.status} size="small" color="success" />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Withdraw Dialog */}
            <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Request Withdrawal</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Available balance: <strong>{formatMoney(stats.availableBalance)}</strong>
                    </Typography>
                    <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                        }}
                        sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" mt={2} display="block">
                        Funds will be sent to your linked bank account (GTBank ****4521)
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleWithdraw}
                        disabled={!withdrawAmount || Number(withdrawAmount) > stats.availableBalance}
                    >
                        Withdraw
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
