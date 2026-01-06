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
    Button,
    TextField,
    InputAdornment,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    Alert,
    Snackbar,
    Avatar
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { propertyService } from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';

const Properties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);

    // Modal State
    const [openModal, setOpenModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        pricePerNight: '',
        city: '',
        state: '',
        address: '',
        imageUrl: '',
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1
    });

    // Notification State
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchProperties();
    }, []);

    const fetchProperties = async () => {
        try {
            setLoading(true);
            const data = await propertyService.getAll();
            setProperties(data.data.properties || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
            showNotification('Failed to load properties', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, property) => {
        setAnchorEl(event.currentTarget);
        setSelectedProperty(property);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedProperty(null);
    };

    const handleOpenModal = () => {
        setFormData({
            title: '', description: '', pricePerNight: '', city: 'Lagos', state: 'Lagos',
            address: '', imageUrl: '', maxGuests: 2, bedrooms: 1, bathrooms: 1
        });
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                ...formData,
                pricePerNight: parseFloat(formData.pricePerNight),
                maxGuests: parseInt(formData.maxGuests),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseInt(formData.bathrooms),
                status: 'APPROVED'
            };

            await propertyService.create(payload);
            showNotification('Property created successfully');
            handleCloseModal();
            fetchProperties();
        } catch (error) {
            console.error('Error creating property:', error);
            showNotification('Failed to create property', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedProperty) return;
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await propertyService.delete(selectedProperty.id);
                showNotification('Property deleted successfully');
                fetchProperties();
            } catch (error) {
                console.error('Error deleting property:', error);
                showNotification('Failed to delete property', 'error');
            }
        }
        handleMenuClose();
    };

    const showNotification = (message, severity = 'success') => {
        setNotification({ open: true, message, severity });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return 'success';
            case 'PENDING': return 'warning';
            case 'REJECTED': return 'error';
            default: return 'default';
        }
    };

    const filteredProperties = properties.filter(p =>
        p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <PageHeader
                title="Properties"
                subtitle={`${properties.length} properties listed`}
                icon={HomeIcon}
                action={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenModal}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Property
                    </Button>
                }
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
                {/* Search Bar */}
                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <TextField
                        fullWidth
                        placeholder="Search properties by name or city..."
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
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                bgcolor: 'background.default'
                            }
                        }}
                    />
                </Box>

                {/* Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Property</TableCell>
                                <TableCell>Location</TableCell>
                                <TableCell>Host</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ p: 0 }}>
                                        <TableSkeleton rows={5} columns={6} />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProperties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            type="empty"
                                            title="No Properties Found"
                                            description={searchTerm ? "Try adjusting your search terms" : "Start by adding your first property"}
                                            actionLabel="Add Property"
                                            onAction={handleOpenModal}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : filteredProperties.map((property, index) => (
                                <TableRow
                                    key={property.id}
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
                                                variant="rounded"
                                                src={property.imageUrl}
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    bgcolor: 'grey.200'
                                                }}
                                            >
                                                <HomeIcon sx={{ color: 'grey.400' }} />
                                            </Avatar>
                                            <Box>
                                                <Box fontWeight="600" fontSize="0.9rem">
                                                    {property.title}
                                                </Box>
                                                <Box fontSize="0.75rem" color="text.secondary">
                                                    {property.bedrooms} bed · {property.bathrooms} bath
                                                </Box>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box fontWeight="500">{property.city}</Box>
                                        <Box fontSize="0.75rem" color="text.secondary">{property.state}</Box>
                                    </TableCell>
                                    <TableCell>
                                        {property.host ? `${property.host.firstName} ${property.host.lastName}` : (property.hostId || 'Admin')}
                                    </TableCell>
                                    <TableCell>
                                        <Box fontWeight="700" color="primary.main">
                                            ₦{property.pricePerNight?.toLocaleString()}
                                        </Box>
                                        <Box fontSize="0.7rem" color="text.secondary">per night</Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={property.status || 'PENDING'}
                                            color={getStatusColor(property.status || 'PENDING')}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, property)}
                                            sx={{
                                                '&:hover': { bgcolor: 'primary.main', color: 'white' }
                                            }}
                                        >
                                            <MoreVertIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Actions Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    sx: { borderRadius: 2, minWidth: 160, boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }
                }}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ViewIcon sx={{ mr: 1.5, fontSize: 18 }} /> View Details
                </MenuItem>
                <MenuItem onClick={handleMenuClose}>
                    <EditIcon sx={{ mr: 1.5, fontSize: 18 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1.5, fontSize: 18 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Add Property Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle sx={{ fontWeight: 600 }}>Add New Property</DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Property Title" name="title" value={formData.title} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth multiline rows={3} label="Description" name="description" value={formData.description} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth type="number" label="Price per Night (₦)" name="pricePerNight" value={formData.pricePerNight} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="City" name="city" value={formData.city} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="State" name="state" value={formData.state} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleInputChange} placeholder="https://..." />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth type="number" label="Max Guests" name="maxGuests" value={formData.maxGuests} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth type="number" label="Bedrooms" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField fullWidth type="number" label="Bathrooms" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={handleCloseModal} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ borderRadius: 2, px: 4 }}>
                        {loading ? 'Creating...' : 'Create Property'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={5000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={notification.severity}
                    sx={{ width: '100%', borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Properties;
