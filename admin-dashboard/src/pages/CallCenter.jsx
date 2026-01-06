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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    Button,
    TextField,
    MenuItem,
    Alert,
    Snackbar,
    Typography,
    Avatar
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Phone as PhoneIcon,
    SmartToy as BotIcon,
    AddIcCall as CallIcon
} from '@mui/icons-material';
import { callService } from '../services/api';
import moment from 'moment';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { TableSkeleton } from '../components/SkeletonLoader';

const CallCenter = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    // Call Initiation State
    const [openCallDialog, setOpenCallDialog] = useState(false);
    const [callData, setCallData] = useState({ phoneNumber: '', context: 'Property Inquiry' });
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            setLoading(true);
            const data = await callService.getAll();
            setCalls(data.data || []);
        } catch (error) {
            console.error('Error fetching calls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (call) => {
        setSelectedCall(call);
        setOpenDialog(true);
    };

    const handleInitiateCall = async () => {
        try {
            await callService.initiateCall(callData.phoneNumber, callData.context);
            setNotification({ open: true, message: 'AI Call Initiated successfully!', severity: 'success' });
            setOpenCallDialog(false);
            fetchCalls();
        } catch (error) {
            console.error('Error initiating call:', error);
            setNotification({ open: true, message: 'Failed to initiate call', severity: 'error' });
        }
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return 'success';
        if (confidence >= 0.5) return 'warning';
        return 'error';
    };

    return (
        <Box>
            <PageHeader
                title="AI Call Center"
                subtitle="Monitor and manage AI voice calls"
                icon={PhoneIcon}
                action={
                    <Button
                        variant="contained"
                        startIcon={<CallIcon />}
                        onClick={() => setOpenCallDialog(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Simulate AI Call
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
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Duration</TableCell>
                                <TableCell>Confidence</TableCell>
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
                            ) : calls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <EmptyState
                                            type="empty"
                                            title="No Call Logs Yet"
                                            description="AI call logs will appear here once calls are made"
                                            actionLabel="Simulate a Call"
                                            onAction={() => setOpenCallDialog(true)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : calls.map((call, index) => (
                                <TableRow
                                    key={call.id}
                                    hover
                                    sx={{
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 30}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <TableCell>
                                        <Box fontWeight="500">{moment(call.createdAt).format('MMM D, h:mm A')}</Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {moment(call.createdAt).fromNow()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Avatar
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: 'primary.light',
                                                    color: 'primary.main'
                                                }}
                                            >
                                                <PhoneIcon sx={{ fontSize: 16 }} />
                                            </Avatar>
                                            <Typography variant="body2" fontWeight="500" fontFamily="monospace">
                                                {call.phoneNumber}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="600">
                                            {call.duration}s
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 60,
                                                    height: 6,
                                                    bgcolor: 'grey.200',
                                                    borderRadius: 3,
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: `${call.averageConfidence * 100}%`,
                                                        height: '100%',
                                                        bgcolor: call.averageConfidence >= 0.8 ? 'success.main' : call.averageConfidence >= 0.5 ? 'warning.main' : 'error.main',
                                                        borderRadius: 3
                                                    }}
                                                />
                                            </Box>
                                            <Chip
                                                label={`${Math.round(call.averageConfidence * 100)}%`}
                                                color={getConfidenceColor(call.averageConfidence)}
                                                size="small"
                                                sx={{ fontWeight: 600, minWidth: 50 }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={call.status}
                                            size="small"
                                            variant="outlined"
                                            color={call.status === 'completed' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleViewDetails(call)}
                                            size="small"
                                            sx={{ '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                        >
                                            <ViewIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Transcript Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Call Transcript
                    {selectedCall && (
                        <Typography variant="body2" color="text.secondary">
                            {selectedCall.phoneNumber} • {moment(selectedCall.createdAt).format('MMM D, YYYY h:mm A')}
                        </Typography>
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {selectedCall && (
                        <List>
                            {selectedCall.transcript.map((line, index) => (
                                <ListItem
                                    key={index}
                                    alignItems="flex-start"
                                    sx={{
                                        animation: 'slideIn 0.3s ease-out',
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: 'both'
                                    }}
                                >
                                    <Avatar
                                        sx={{
                                            mr: 2,
                                            width: 36,
                                            height: 36,
                                            bgcolor: line.speaker === 'ai' ? 'primary.main' : 'grey.300'
                                        }}
                                    >
                                        {line.speaker === 'ai' ? (
                                            <BotIcon sx={{ fontSize: 20 }} />
                                        ) : (
                                            <PhoneIcon sx={{ fontSize: 20, color: 'grey.600' }} />
                                        )}
                                    </Avatar>
                                    <ListItemText
                                        primary={line.speaker === 'ai' ? 'JustBack AI' : 'Customer'}
                                        secondary={line.text}
                                        primaryTypographyProps={{
                                            fontWeight: 'bold',
                                            color: line.speaker === 'ai' ? 'primary' : 'textPrimary',
                                            fontSize: '0.9rem'
                                        }}
                                        secondaryTypographyProps={{
                                            sx: { mt: 0.5 }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Initiate Call Dialog */}
            <Dialog open={openCallDialog} onClose={() => setOpenCallDialog(false)}>
                <DialogTitle sx={{ fontWeight: 600 }}>Simulate AI Call</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        value={callData.phoneNumber}
                        onChange={(e) => setCallData({ ...callData, phoneNumber: e.target.value })}
                        placeholder="+234..."
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        select
                        margin="dense"
                        label="Context"
                        fullWidth
                        value={callData.context}
                        onChange={(e) => setCallData({ ...callData, context: e.target.value })}
                    >
                        <MenuItem value="Property Inquiry">Property Inquiry</MenuItem>
                        <MenuItem value="Booking Confirmation">Booking Confirmation</MenuItem>
                        <MenuItem value="Support">Support</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setOpenCallDialog(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button onClick={handleInitiateCall} variant="contained" sx={{ borderRadius: 2, px: 4 }}>
                        Start Call
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

export default CallCenter;
