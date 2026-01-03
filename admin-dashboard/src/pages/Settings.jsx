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
    Card,
    CardContent,
    Grid
} from '@mui/material';
import { Save } from '@mui/icons-material';

export default function Settings() {
    const [settings, setSettings] = useState({
        allowRegistrations: true,
        maintenanceMode: false,
        emailNotifications: true,
        aiVoiceEnabled: true,
        platformFee: '10'
    });

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <Box maxWidth="lg">
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Platform Settings
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">General Configuration</Typography>
                        </Box>
                        <List>
                            <ListItem>
                                <ListItemText
                                    primary="Allow New User Registrations"
                                    secondary="If disabled, standard users cannot sign up."
                                />
                                <ListItemSecondaryAction>
                                    <Switch
                                        edge="end"
                                        checked={settings.allowRegistrations}
                                        onChange={() => handleToggle('allowRegistrations')}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="Maintenance Mode"
                                    secondary="Show maintenance page to all users except admins."
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
                            <Divider />
                            <ListItem>
                                <ListItemText
                                    primary="Enable AI Voice Agents"
                                    secondary="Master switch for RAG-based voice support."
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

                    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Financial</Typography>
                        </Box>
                        <Box sx={{ p: 3 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle1">Platform Service Fee (%)</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Percentage taken from each booking.
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Percentage"
                                        type="number"
                                        value={settings.platformFee}
                                        InputProps={{ endAdornment: '%' }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Paper>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<Save />}
                            sx={{ borderRadius: 2, px: 4 }}
                        >
                            Save Changes
                        </Button>
                    </Box>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, bgcolor: '#e8f5e9' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>System Status</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                                <Typography>Server: <strong>Online</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                                <Typography>Database: <strong>Connected (Mock)</strong></Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'success.main', mr: 1 }} />
                                <Typography>Redis: <strong>Connected</strong></Typography>
                            </Box>
                            <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                                Version: 1.0.0-beta
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
