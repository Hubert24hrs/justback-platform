import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material'
import {
    Add as AddIcon,
    MoreVert,
    Edit,
    Delete,
    Visibility,
    VisibilityOff,
    LocationOn,
    Star,
    BedOutlined,
    BathtubOutlined,
} from '@mui/icons-material'
import api from '../services/api'

export default function Properties() {
    const navigate = useNavigate()
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [anchorEl, setAnchorEl] = useState(null)
    const [selectedProperty, setSelectedProperty] = useState(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    useEffect(() => {
        fetchProperties()
    }, [])

    const fetchProperties = async () => {
        try {
            const response = await api.get('/properties')
            if (response.data.success) {
                setProperties(response.data.data.properties)
            }
        } catch (error) {
            console.error('Error fetching properties:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMenuOpen = (event, property) => {
        setAnchorEl(event.currentTarget)
        setSelectedProperty(property)
    }

    const handleMenuClose = () => {
        setAnchorEl(null)
    }

    const handleEdit = () => {
        navigate(`/properties/edit/${selectedProperty.id}`)
        handleMenuClose()
    }

    const handleDelete = async () => {
        try {
            await api.delete(`/properties/${selectedProperty.id}`)
            setProperties(properties.filter(p => p.id !== selectedProperty.id))
            setDeleteDialogOpen(false)
            handleMenuClose()
        } catch (error) {
            console.error('Error deleting property:', error)
        }
    }

    const handleToggleVisibility = async () => {
        try {
            const newStatus = selectedProperty.status === 'active' ? 'inactive' : 'active'
            await api.put(`/properties/${selectedProperty.id}`, { status: newStatus })
            setProperties(properties.map(p =>
                p.id === selectedProperty.id ? { ...p, status: newStatus } : p
            ))
            handleMenuClose()
        } catch (error) {
            console.error('Error updating property:', error)
        }
    }

    const formatMoney = (amount) => {
        return '₦' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }

    const PropertyCard = ({ property }) => (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ position: 'relative' }}>
                <CardMedia
                    component="img"
                    height="180"
                    image={property.images?.[0] || `https://picsum.photos/400/300?random=${property.id}`}
                    alt={property.title}
                    sx={{ objectFit: 'cover' }}
                />
                <Chip
                    label={property.status}
                    size="small"
                    color={property.status === 'active' ? 'success' : 'default'}
                    sx={{ position: 'absolute', top: 12, left: 12 }}
                />
                <IconButton
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: 'grey.100' } }}
                    size="small"
                    onClick={(e) => handleMenuOpen(e, property)}
                >
                    <MoreVert fontSize="small" />
                </IconButton>
            </Box>
            <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" noWrap fontWeight={600}>
                    {property.title}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, color: 'text.secondary' }}>
                    <LocationOn fontSize="small" />
                    <Typography variant="body2">{property.city}, {property.state}</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BedOutlined fontSize="small" color="action" />
                        <Typography variant="body2">{property.bedrooms}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BathtubOutlined fontSize="small" color="action" />
                        <Typography variant="body2">{property.bathrooms}</Typography>
                    </Box>
                    {property.rating > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Star fontSize="small" sx={{ color: '#FFB800' }} />
                            <Typography variant="body2">{property.rating}</Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Typography variant="h6" color="primary" fontWeight={700}>
                        {formatMoney(property.pricePerNight)}
                        <Typography component="span" variant="body2" color="text.secondary">
                            /night
                        </Typography>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {property.reviewCount || 0} reviews
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    )

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        My Properties
                    </Typography>
                    <Typography color="text.secondary">
                        Manage your listed properties
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/properties/add')}
                >
                    Add Property
                </Button>
            </Box>

            <Grid container spacing={3}>
                {loading
                    ? [...Array(6)].map((_, i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Card>
                                <Skeleton variant="rectangular" height={180} />
                                <CardContent>
                                    <Skeleton width="80%" />
                                    <Skeleton width="60%" />
                                    <Skeleton width="40%" />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))
                    : properties.map((property) => (
                        <Grid item xs={12} sm={6} md={4} key={property.id}>
                            <PropertyCard property={property} />
                        </Grid>
                    ))}
            </Grid>

            {!loading && properties.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No properties yet
                    </Typography>
                    <Typography color="text.secondary" mb={3}>
                        Start hosting by adding your first property
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/properties/add')}>
                        Add Your First Property
                    </Button>
                </Box>
            )}

            {/* Context Menu */}
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={handleEdit}>
                    <Edit fontSize="small" sx={{ mr: 1 }} /> Edit
                </MenuItem>
                <MenuItem onClick={handleToggleVisibility}>
                    {selectedProperty?.status === 'active' ? (
                        <>
                            <VisibilityOff fontSize="small" sx={{ mr: 1 }} /> Deactivate
                        </>
                    ) : (
                        <>
                            <Visibility fontSize="small" sx={{ mr: 1 }} /> Activate
                        </>
                    )}
                </MenuItem>
                <MenuItem onClick={() => { setDeleteDialogOpen(true); handleMenuClose() }} sx={{ color: 'error.main' }}>
                    <Delete fontSize="small" sx={{ mr: 1 }} /> Delete
                </MenuItem>
            </Menu>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Delete Property</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete "{selectedProperty?.title}"? This action cannot be undone.
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
