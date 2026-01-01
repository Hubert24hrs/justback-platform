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
    Avatar
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    FilterList as FilterIcon
} from '@mui/icons-material';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data.data?.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return 'error';
            case 'host': return 'primary';
            case 'guest': return 'success';
            default: return 'default';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm)
    );

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Users Management
                </Typography>
                <IconButton>
                    <FilterIcon />
                </IconButton>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box p={3}>
                    <TextField
                        fullWidth
                        placeholder="Search users by name, email, or phone..."
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
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Role</TableCell>
                                <TableCell>Wallet</TableCell>
                                <TableCell>Joined</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="body2" sx={{ mt: 1 }}>Loading users...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                        <Typography color="textSecondary">No users found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Avatar sx={{ mr: 2, bgcolor: getRoleColor(user.role) + '.main', width: 36, height: 36 }}>
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="500">
                                                {user.firstName} {user.lastName}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                        {user.emailVerified && (
                                            <Typography variant="caption" color="success.main">✓ Verified</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.phone || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.role?.toUpperCase() || 'GUEST'}
                                            color={getRoleColor(user.role)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="bold">
                                            ₦{user.walletBalance?.toLocaleString() || 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small">
                                            <ViewIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Users;
