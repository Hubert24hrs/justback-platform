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
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    FilterList as FilterIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import api from '../services/api';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data.data?.users || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setSnackbar({ open: true, message: 'Failed to load users', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            setSelectedUser(response.data.data);
            setViewOpen(true);
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to load user details', severity: 'error' });
        }
    };

    const handleEditOpen = (user) => {
        setSelectedUser(user);
        setEditRole(user.role);
        setEditOpen(true);
    };

    const handleEditSave = async () => {
        try {
            await api.patch(`/admin/users/${selectedUser.id}`, { role: editRole });
            setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
            setEditOpen(false);
            fetchUsers();
        } catch (error) {
            setSnackbar({ open: true, message: 'Failed to update user', severity: 'error' });
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

    const getKYCColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
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
                <Chip label={`${users.length} users`} color="primary" />
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
                                <TableCell>Role</TableCell>
                                <TableCell>KYC</TableCell>
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
                                    <TableCell>
                                        <Chip
                                            label={user.role?.toUpperCase() || 'GUEST'}
                                            color={getRoleColor(user.role)}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={user.kycStatus || 'PENDING'}
                                            color={getKYCColor(user.kycStatus)}
                                            size="small"
                                            variant="outlined"
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
                                        <IconButton size="small" onClick={() => handleViewUser(user.id)} title="View">
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleEditOpen(user)} title="Edit">
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* View User Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    User Details
                    <IconButton onClick={() => setViewOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedUser && (
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Name</Typography>
                                <Typography>{selectedUser.firstName} {selectedUser.lastName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Email</Typography>
                                <Typography>{selectedUser.email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Phone</Typography>
                                <Typography>{selectedUser.phone || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Role</Typography>
                                <Chip label={selectedUser.role} color={getRoleColor(selectedUser.role)} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">KYC Status</Typography>
                                <Chip label={selectedUser.kycStatus || 'PENDING'} color={getKYCColor(selectedUser.kycStatus)} size="small" />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="textSecondary">Wallet Balance</Typography>
                                <Typography fontWeight="bold">₦{selectedUser.walletBalance?.toLocaleString() || 0}</Typography>
                            </Grid>
                            {selectedUser.stats && (
                                <>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="textSecondary">Bookings</Typography>
                                        <Typography>{selectedUser.stats.bookings}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="textSecondary">Properties</Typography>
                                        <Typography>{selectedUser.stats.properties}</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit User</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Role</InputLabel>
                        <Select value={editRole} onChange={(e) => setEditRole(e.target.value)} label="Role">
                            <MenuItem value="guest">Guest</MenuItem>
                            <MenuItem value="host">Host</MenuItem>
                            <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default Users;
