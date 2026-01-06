import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Alert,
    Snackbar,
    Avatar,
    IconButton
} from '@mui/material';
import {
    Save as SaveIcon,
    Settings as SettingsIcon,
    Security as SecurityIcon,
    Notifications as NotificationsIcon,
    Payment as PaymentIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

export default function Settings() {
    const [settings, setSettings] = useState({
        allowRegistrations: true,
        maintenanceMode: false,
        emailNotifications: true,
        aiVoiceEnabled: true,
        platformFee: '10'
    });

    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [saving, setSaving] = useState(false);

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        setTimeout(() => {
            setSaving(false);
            setNotification({ open: true, message: 'Settings saved successfully!', severity: 'success' });
        }, 1000);
    };

    return (
        <Box>
            <PageHeader
                title="Platform Settings"
                subtitle="Configure your platform settings"
                icon={SettingsIcon}
                action={
                    <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={handleSave}
                        disabled={saving}
                        sx={{ borderRadius: 2, px: 4 }}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                }
            />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    {/* General Configuration */}
                    <Paper
                        sx={{
                            borderRadius: 3,
                            mb: 3,
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
                        <Box
                            sx={{
                                p: 2.5,
                                background: 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(0,168,107,0.05) 100%)',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'primary.main'
                                }}
                            >
                                <SettingsIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">General Configuration</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Basic platform settings
                                </Typography>
                            </Box>
                        </Box>
                        <List>
                            <ListItem sx={{ py: 2 }}>
                                <ListItemText
                                    primary="Allow New User Registrations"
                                    secondary="If disabled, standard users cannot sign up."
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={settings.allowRegistrations}
                                        onChange={() => handleToggle('allowRegistrations')}
                                        color="primary"
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                            <ListItem sx={{ py: 2 }}>
                                <ListItemText
                                    primary="Maintenance Mode"
                                    secondary="Show maintenance page to all users except admins."
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        color="error"
                                        checked={settings.maintenanceMode}
                                        onChange={() => handleToggle('maintenanceMode')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider component="li" />
                            <ListItem sx={{ py: 2 }}>
                                <ListItemText
                                    primary="Enable AI Voice Agents"
                                    secondary="Master switch for RAG-based voice support."
                                    primaryTypographyProps={{ fontWeight: 500 }}
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        color="primary"
                                        checked={settings.aiVoiceEnabled}
                                        onChange={() => handleToggle('aiVoiceEnabled')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    {/* Financial Settings */}
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
                        <Box
                            sx={{
                                p: 2.5,
                                background: 'linear-gradient(135deg, rgba(41,121,255,0.1) 0%, rgba(41,121,255,0.05) 100%)',
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 36,
                                    height: 36,
                                    bgcolor: 'secondary.main'
                                }}
                            >
                                <PaymentIcon sx={{ fontSize: 18 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">Financial Settings</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Payment and fee configurations
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={3} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1" fontWeight="600">Platform Service Fee</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Percentage taken from each booking.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Fee Percentage"
                                        type="number"
                                        value={settings.platformFee}
                                        onChange={(e) => setSettings({ ...settings, platformFee: e.target.value })}
                                        InputProps={{ endAdornment: '%' }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    {/* System Status */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
                            border: 'none',
                            mb: 3
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">System Status</Typography>
                                <IconButton size="small">
                                    <RefreshIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: 'success.main',
                                        mr: 1.5,
                                        boxShadow: '0 0 8px #00C853'
                                    }}
                                />
                                <Typography>Server: <strong>Online</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: 'success.main',
                                        mr: 1.5,
                                        boxShadow: '0 0 8px #00C853'
                                    }}
                                />
                                <Typography>Database: <strong>Connected</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: 'success.main',
                                        mr: 1.5,
                                        boxShadow: '0 0 8px #00C853'
                                    }}
                                />
                                <Typography>Redis: <strong>Connected</strong></Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="caption" color="text.secondary" display="block">
                                Version: 1.0.0-beta
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Last updated: Just now
                            </Typography>
                        </CardContent>
                    </Card>

                    {/* Security Card */}
                    <Card
                        sx={{
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'warning.main' }}>
                                    <SecurityIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">Security</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                All systems are protected with enterprise-grade security.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                                    🔒 SSL/TLS
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                                    🛡️ JWT Auth
                                </Box>
                                <Box sx={{ px: 1.5, py: 0.5, bgcolor: 'grey.100', borderRadius: 2, fontSize: '0.75rem', fontWeight: 600 }}>
                                    🔐 Bcrypt
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

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
}
