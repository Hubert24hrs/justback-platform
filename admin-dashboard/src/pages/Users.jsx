import React, { useState, useEffect } from 'react';
import {
    Box,
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
    Alert,
    Typography,
    Tabs,
    Tab
} from '@mui/material';
import {
    Search as SearchIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Close as CloseIcon,
    People as PeopleIcon,
    PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editRole, setEditRole] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [tabValue, setTabValue] = useState(0);

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

    const getFilteredUsers = () => {
        let filtered = users.filter(u =>
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone?.includes(searchTerm)
        );

        if (tabValue === 1) filtered = filtered.filter(u => u.role?.toLowerCase() === 'guest');
        if (tabValue === 2) filtered = filtered.filter(u => u.role?.toLowerCase() === 'host');
        if (tabValue === 3) filtered = filtered.filter(u => u.role?.toLowerCase() === 'admin');

        return filtered;
    };

    const filteredUsers = getFilteredUsers();

    const roleCounts = {
        all: users.length,
        guest: users.filter(u => u.role?.toLowerCase() === 'guest').length,
        host: users.filter(u => u.role?.toLowerCase() === 'host').length,
        admin: users.filter(u => u.role?.toLowerCase() === 'admin').length
    };

    return (
        <Box>
            <PageHeader
                title="Users"
                subtitle={`${users.length} registered users`}
                icon={PeopleIcon}
                badge={`${roleCounts.host} Hosts`}
            />

            <Paper
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        borderColor: 'primary.light',
                        boxShadow: '0 8px 30px rgba(0, 168, 107, 0.08)'
                    }
                }}
            >
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(_, v) => setTabValue(v)}
                        sx={{
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                fontWeight: 600,
                                minHeight: 56
                            }
                        }}
                    >
                        <Tab label={`All Users (${roleCounts.all})`} />
                        <Tab label={`Guests (${roleCounts.guest})`} />
                        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            Hosts <Chip size="small" label={roleCounts.host} color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                        </Box>} />
                        <Tab label={`Admins (${roleCounts.admin})`} />
                    </Tabs>
                </Box>

                {/* Search */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
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
                        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'background.default' } }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
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
                                    <TableCell colSpan={7} sx={{ p: 0 }}>
                                        <TableSkeleton rows={5} columns={7} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <EmptyState
                                            type="search"
                                            title="No Users Found"
                                            description={searchTerm ? "Try adjusting your search terms" : "No users have registered yet"}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.map((user, index) => (
                                <TableRow
                                    key={user.id}
                                    hover
                                    sx={{
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 30}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <TableCell>
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    background: `linear-gradient(135deg, ${getRoleColor(user.role) === 'error' ? '#FF1744' : getRoleColor(user.role) === 'primary' ? '#2979FF' : '#00C853'} 0%, ${getRoleColor(user.role) === 'error' ? '#FF616F' : getRoleColor(user.role) === 'primary' ? '#75A7FF' : '#5EFC82'} 100%)`,
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                {user.firstName?.[0]}{user.lastName?.[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">
                                                    {user.firstName} {user.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {user.phone || 'No phone'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{user.email}</Typography>
                                        {user.emailVerified && (
                                            <Typography variant="caption" color="success.main" fontWeight="600">
                                                ✓ Verified
                                            </Typography>
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
                                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                                            ₦{user.walletBalance?.toLocaleString() || 0}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{formatDate(user.createdAt)}</Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleViewUser(user.id)}
                                            title="View"
                                            sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                        >
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleEditOpen(user)}
                                            title="Edit"
                                            sx={{ ml: 0.5, '&:hover': { bgcolor: 'secondary.main', color: 'white' } }}
                                        >
                                            <EditIcon fontSize="small" />
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
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    User Details
                    <IconButton onClick={() => setViewOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {selectedUser && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                                        fontSize: '2rem',
                                        fontWeight: 700
                                    }}
                                >
                                    {selectedUser.firstName?.[0]}{selectedUser.lastName?.[0]}
                                </Avatar>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Name</Typography>
                                <Typography fontWeight="600">{selectedUser.firstName} {selectedUser.lastName}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Email</Typography>
                                <Typography>{selectedUser.email}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Phone</Typography>
                                <Typography>{selectedUser.phone || '-'}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Role</Typography>
                                <Box><Chip label={selectedUser.role} color={getRoleColor(selectedUser.role)} size="small" /></Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">KYC Status</Typography>
                                <Box><Chip label={selectedUser.kycStatus || 'PENDING'} color={getKYCColor(selectedUser.kycStatus)} size="small" /></Box>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">Wallet Balance</Typography>
                                <Typography fontWeight="bold" color="primary.main">₦{selectedUser.walletBalance?.toLocaleString() || 0}</Typography>
                            </Grid>
                            {selectedUser.stats && (
                                <>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">Bookings</Typography>
                                        <Typography fontWeight="600">{selectedUser.stats.bookings}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary">Properties</Typography>
                                        <Typography fontWeight="600">{selectedUser.stats.properties}</Typography>
                                    </Grid>
                                </>
                            )}
                        </Grid>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Edit User Role</DialogTitle>
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
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleEditSave} sx={{ borderRadius: 2, px: 4 }}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Users;
