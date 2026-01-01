import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Chip,
    OutlinedInput,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    Alert,
} from '@mui/material'
import { ArrowBack, Save, PhotoCamera } from '@mui/icons-material'
import api from '../services/api'

const propertyTypes = ['apartment', 'house', 'villa', 'studio', 'room']
const allAmenities = [
    'wifi', 'ac', 'pool', 'gym', 'parking', 'generator', 'security',
    'kitchen', 'tv', 'washer', 'dryer', 'beach_access', 'balcony', 'garden'
]

const steps = ['Basic Info', 'Location', 'Details', 'Photos']

export default function AddProperty() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEditing = Boolean(id)
    const [activeStep, setActiveStep] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        propertyType: 'apartment',
        address: '',
        city: '',
        state: '',
        pricePerNight: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        amenities: [],
        images: [],
    })

    useEffect(() => {
        if (isEditing) {
            fetchProperty()
        }
    }, [id])

    const fetchProperty = async () => {
        try {
            const response = await api.get(`/properties/${id}`)
            if (response.data.success) {
                const property = response.data.data
                setFormData({
                    title: property.title || '',
                    description: property.description || '',
                    propertyType: property.propertyType || 'apartment',
                    address: property.address || '',
                    city: property.city || '',
                    state: property.state || '',
                    pricePerNight: property.pricePerNight || '',
                    bedrooms: property.bedrooms || 1,
                    bathrooms: property.bathrooms || 1,
                    maxGuests: property.maxGuests || 2,
                    amenities: property.amenities || [],
                    images: property.images || [],
                })
            }
        } catch (error) {
            console.error('Error fetching property:', error)
            setError('Failed to load property')
        }
    }

    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value })
    }

    const handleAmenitiesChange = (event) => {
        setFormData({ ...formData, amenities: event.target.value })
    }

    const handleNext = () => {
        setActiveStep((prev) => prev + 1)
    }

    const handleBack = () => {
        setActiveStep((prev) => prev - 1)
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError('')

        try {
            if (isEditing) {
                await api.put(`/properties/${id}`, formData)
                setSuccess('Property updated successfully!')
            } else {
                await api.post('/properties', formData)
                setSuccess('Property created successfully!')
            }
            setTimeout(() => navigate('/properties'), 1500)
        } catch (error) {
            setError(error.response?.data?.error?.message || 'Failed to save property')
        } finally {
            setLoading(false)
        }
    }

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Property Title"
                                value={formData.title}
                                onChange={handleChange('title')}
                                placeholder="e.g., Luxury 3-Bedroom Apartment in Lekki"
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                value={formData.description}
                                onChange={handleChange('description')}
                                multiline
                                rows={4}
                                placeholder="Describe your property..."
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Property Type</InputLabel>
                                <Select
                                    value={formData.propertyType}
                                    onChange={handleChange('propertyType')}
                                    label="Property Type"
                                >
                                    {propertyTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Price Per Night"
                                type="number"
                                value={formData.pricePerNight}
                                onChange={handleChange('pricePerNight')}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">₦</InputAdornment>,
                                }}
                                required
                            />
                        </Grid>
                    </Grid>
                )

            case 1:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street Address"
                                value={formData.address}
                                onChange={handleChange('address')}
                                placeholder="e.g., 25 Admiralty Way"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={formData.city}
                                onChange={handleChange('city')}
                                placeholder="e.g., Lagos"
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="State"
                                value={formData.state}
                                onChange={handleChange('state')}
                                placeholder="e.g., Lagos"
                                required
                            />
                        </Grid>
                    </Grid>
                )

            case 2:
                return (
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Bedrooms"
                                type="number"
                                value={formData.bedrooms}
                                onChange={handleChange('bedrooms')}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Bathrooms"
                                type="number"
                                value={formData.bathrooms}
                                onChange={handleChange('bathrooms')}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <TextField
                                fullWidth
                                label="Max Guests"
                                type="number"
                                value={formData.maxGuests}
                                onChange={handleChange('maxGuests')}
                                inputProps={{ min: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Amenities</InputLabel>
                                <Select
                                    multiple
                                    value={formData.amenities}
                                    onChange={handleAmenitiesChange}
                                    input={<OutlinedInput label="Amenities" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {allAmenities.map((amenity) => (
                                        <MenuItem key={amenity} value={amenity}>
                                            {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                )

            case 3:
                return (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PhotoCamera sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                            Upload Property Photos
                        </Typography>
                        <Typography color="text.secondary" mb={3}>
                            Add photos to make your listing more attractive
                        </Typography>
                        <Button variant="outlined" startIcon={<PhotoCamera />}>
                            Select Photos
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary" mt={2}>
                            Photo upload will be available with cloud storage integration
                        </Typography>
                    </Box>
                )

            default:
                return null
        }
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/properties')}
                    sx={{ mb: 2 }}
                >
                    Back to Properties
                </Button>
                <Typography variant="h4" fontWeight={700}>
                    {isEditing ? 'Edit Property' : 'Add New Property'}
                </Typography>
            </Box>

            <Card>
                <CardContent sx={{ p: 4 }}>
                    <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {success && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {success}
                        </Alert>
                    )}

                    {renderStepContent(activeStep)}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                        <Box>
                            {activeStep === steps.length - 1 ? (
                                <Button
                                    variant="contained"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    startIcon={<Save />}
                                >
                                    {loading ? 'Saving...' : isEditing ? 'Update Property' : 'Create Property'}
                                </Button>
                            ) : (
                                <Button variant="contained" onClick={handleNext}>
                                    Next
                                </Button>
                            )}
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
