import { useState, useEffect } from 'react'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    TextField,
    Button,
    Switch,
    Divider,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Avatar,
    Alert,
    LinearProgress,
} from '@mui/material'
import {
    Person,
    Notifications,
    SmartToy,
    Payment,
    Security,
    Save,
    FlashOn,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'
import { hostApi } from '../services/api'

export default function Settings() {
    const { user } = useAuth()
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [indexing, setIndexing] = useState(false)
    const [indexProgress, setIndexProgress] = useState(0)

    const [settings, setSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        bookingAlerts: true,
        marketingEmails: false,
        aiAutoReply: true,
        instantBooking: false,
    })

    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
    })

    const [aiFaqs, setAiFaqs] = useState([])

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const response = await hostApi.getAISettings()
            if (response.data.success) {
                setAiFaqs(response.data.data.faqs)
                setSettings(prev => ({ ...prev, aiAutoReply: response.data.data.aiAutoReply }))
            }
        } catch (err) {
            setError('Failed to load settings')
        }
    }

    const handleToggle = (setting) => {
        setSettings({ ...settings, [setting]: !settings[setting] })
    }

    const handleProfileChange = (field) => (e) => {
        setProfile({ ...profile, [field]: e.target.value })
    }

    const handleSave = async () => {
        try {
            await hostApi.updateAISettings({
                faqs: aiFaqs,
                aiAutoReply: settings.aiAutoReply
            })
            setSuccess('Settings saved successfully!')
            setTimeout(() => setSuccess(''), 3000)
        } catch (err) {
            setError('Failed to save settings')
        }
    }

    const handleAddFaq = () => {
        setAiFaqs([...aiFaqs, { question: '', answer: '' }])
    }

    const handleFaqChange = (index, field, value) => {
        const newFaqs = [...aiFaqs]
        newFaqs[index][field] = value
        setAiFaqs(newFaqs)
    }

    const handleIndexKB = async () => {
        setIndexing(true)
        setIndexProgress(0)

        // Simulate progress
        const interval = setInterval(() => {
            setIndexProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval)
                    return 100
                }
                return prev + 10
            })
        }, 300)

        try {
            await hostApi.indexKnowledgeBase()
            setTimeout(() => {
                setIndexing(false)
                setSuccess('AI Knowledge Base re-indexed with latest FAQs!')
                setTimeout(() => setSuccess(''), 3000)
            }, 3500)
        } catch (err) {
            setIndexing(false)
            setError('Indexing failed')
        }
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Settings
                </Typography>
                <Typography color="text.secondary">
                    Manage your account and preferences
                </Typography>
            </Box>

            {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Profile Settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                    <Person fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">Profile</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Update your personal information
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="First Name"
                                        value={profile.firstName}
                                        onChange={handleProfileChange('firstName')}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        value={profile.lastName}
                                        onChange={handleProfileChange('lastName')}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Email"
                                        value={profile.email}
                                        onChange={handleProfileChange('email')}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange('phone')}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Notification Settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'info.light' }}>
                                    <Notifications />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">Notifications</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Control how you receive updates
                                    </Typography>
                                </Box>
                            </Box>

                            <List disablePadding>
                                <ListItem disableGutters>
                                    <ListItemText primary="Email Notifications" secondary="Receive updates via email" />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={settings.emailNotifications}
                                            onChange={() => handleToggle('emailNotifications')}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText primary="SMS Notifications" secondary="Get text messages for bookings" />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={settings.smsNotifications}
                                            onChange={() => handleToggle('smsNotifications')}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem disableGutters>
                                    <ListItemText primary="Booking Alerts" secondary="Instant alerts for new bookings" />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={settings.bookingAlerts}
                                            onChange={() => handleToggle('bookingAlerts')}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* AI Assistant Settings */}
                <Grid item xs={12}>
                    <Card sx={{
                        border: indexing ? '1px solid' : 'none',
                        borderColor: 'primary.main',
                        transition: 'all 0.3s'
                    }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: 'success.light' }}>
                                        <SmartToy />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">AI Assistant (RAG)</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Train your AI voice assistant with specific property knowledge
                                        </Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="outlined"
                                    startIcon={<FlashOn />}
                                    onClick={handleIndexKB}
                                    disabled={indexing}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {indexing ? 'Indexing...' : 'Index Knowledge Base'}
                                </Button>
                            </Box>

                            {indexing && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="caption" color="primary" sx={{ mb: 1, display: 'block' }}>
                                        AI is learning from your latest updates... {indexProgress}%
                                    </Typography>
                                    <LinearProgress variant="determinate" value={indexProgress} sx={{ height: 10, borderRadius: 5 }} />
                                </Box>
                            )}

                            <Box sx={{ mb: 3 }}>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Enable AI Auto-Reply"
                                        secondary="Let AI answer common questions from guests during calls"
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={settings.aiAutoReply}
                                            onChange={() => handleToggle('aiAutoReply')}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </Box>

                            <Divider sx={{ mb: 3 }} />

                            <Typography variant="subtitle2" gutterBottom fontWeight={700}>
                                Knowledge Base FAQs
                            </Typography>
                            <Grid container spacing={2}>
                                {aiFaqs.map((faq, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                            <TextField
                                                fullWidth
                                                label="Question"
                                                variant="standard"
                                                value={faq.question}
                                                onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                                                sx={{ mb: 1 }}
                                            />
                                            <TextField
                                                fullWidth
                                                label="AI Answer"
                                                variant="standard"
                                                multiline
                                                rows={2}
                                                value={faq.answer}
                                                onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                                            />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                            <Button variant="text" sx={{ mt: 2 }} onClick={handleAddFaq}>
                                + Add Training Question
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Booking Settings */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'warning.light' }}>
                                    <Payment />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">Booking Preferences</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Control booking settings
                                    </Typography>
                                </Box>
                            </Box>

                            <List disablePadding>
                                <ListItem disableGutters>
                                    <ListItemText
                                        primary="Instant Booking"
                                        secondary="Allow guests to book without approval"
                                    />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            checked={settings.instantBooking}
                                            onChange={() => handleToggle('instantBooking')}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Security */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <Avatar sx={{ bgcolor: 'error.light' }}>
                                    <Security />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">Security</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Keep your account secure
                                    </Typography>
                                </Box>
                            </Box>

                            <Button variant="outlined" fullWidth sx={{ mb: 2 }}>
                                Change Password
                            </Button>
                            <Button variant="outlined" color="error" fullWidth>
                                Delete Account
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 4, textAlign: 'right' }}>
                <Button variant="contained" startIcon={<Save />} onClick={handleSave} size="large">
                    Save Changes
                </Button>
            </Box>
        </Box>
    )
}
