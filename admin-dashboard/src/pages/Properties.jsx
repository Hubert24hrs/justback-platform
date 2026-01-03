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
    Snackbar
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Visibility as ViewIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { propertyService } from '../services/api';

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
                status: 'APPROVED' // Auto-approve admin created properties
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
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    Properties Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{ borderRadius: 2 }}
                    onClick={handleOpenModal}
                >
                    Add Property
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box p={3}>
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
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
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
                            {loading && properties.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Loading properties...
                                    </TableCell>
                                </TableRow>
                            ) : filteredProperties.map((property) => (
                                <TableRow key={property.id} hover>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Box
                                                width={40}
                                                height={40}
                                                bgcolor="grey.200"
                                                borderRadius={1}
                                                mr={2}
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                                overflow="hidden"
                                            >
                                                {property.imageUrl ? (
                                                    <img src={property.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Typography variant="caption">IMG</Typography>
                                                )}
                                            </Box>
                                            <Typography variant="subtitle2">{property.title}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{property.city}, {property.state}</TableCell>
                                    <TableCell>{property.host ? `${property.host.firstName} ${property.host.lastName}` : (property.hostId || 'Admin')}</TableCell>
                                    <TableCell>₦{property.pricePerNight?.toLocaleString()}/night</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={property.status || 'PENDING'}
                                            color={getStatusColor(property.status || 'PENDING')}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={(e) => handleMenuOpen(e, property)}>
                                            <MoreVertIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleMenuClose}>
                    <ViewIcon sx={{ mr: 1, fontSize: 18 }} /> View Details
                </MenuItem>
                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <DeleteIcon sx={{ mr: 1, fontSize: 18 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Add Property Modal */}
            <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
                <DialogTitle>Add New Property</DialogTitle>
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
                <DialogActions>
                    <Button onClick={handleCloseModal}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Property'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Properties;
