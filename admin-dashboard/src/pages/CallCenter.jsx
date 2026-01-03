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
    Snackbar
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Phone as PhoneIcon,
    SmartToy as BotIcon,
    AddIcCall as CallIcon
} from '@mui/icons-material';
import { callService } from '../services/api';
import moment from 'moment';

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
            fetchCalls(); // Refresh list to show the new "queued" or "completed" call
        } catch (error) {
            console.error('Error initiating call:', error);
            setNotification({ open: true, message: 'Failed to initiate call', severity: 'error' });
        }
    };

    return (
        <Box p={4}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h4" fontWeight="bold">
                    AI Call Center Logs
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<CallIcon />}
                    onClick={() => setOpenCallDialog(true)}
                    color="primary"
                    sx={{ borderRadius: 2 }}
                >
                    Simulate AI Call
                </Button>
            </Box>

            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
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
                            {loading && calls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                        Loading logs...
                                    </TableCell>
                                </TableRow>
                            ) : calls.map((call) => (
                                <TableRow key={call.id} hover>
                                    <TableCell>{moment(call.createdAt).fromNow()}</TableCell>
                                    <TableCell>{call.phoneNumber}</TableCell>
                                    <TableCell>{call.duration}s</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${Math.round(call.averageConfidence * 100)}%`}
                                            color={call.averageConfidence > 0.8 ? 'success' : 'warning'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={call.status} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton onClick={() => handleViewDetails(call)}>
                                            <ViewIcon />
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
                <DialogTitle>Call Transcript Details</DialogTitle>
                <DialogContent dividers>
                    {selectedCall && (
                        <List>
                            {selectedCall.transcript.map((line, index) => (
                                <ListItem key={index} alignItems="flex-start">
                                    <Box mr={2}>
                                        {line.speaker === 'ai' ? (
                                            <BotIcon color="primary" />
                                        ) : (
                                            <PhoneIcon color="action" />
                                        )}
                                    </Box>
                                    <ListItemText
                                        primary={line.speaker === 'ai' ? 'JustBack AI' : 'Customer'}
                                        secondary={line.text}
                                        primaryTypographyProps={{
                                            fontWeight: 'bold',
                                            color: line.speaker === 'ai' ? 'primary' : 'textPrimary'
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
            </Dialog>

            {/* Validate Call Dialog */}
            <Dialog open={openCallDialog} onClose={() => setOpenCallDialog(false)}>
                <DialogTitle>Simulate AI Call</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Phone Number"
                        fullWidth
                        value={callData.phoneNumber}
                        onChange={(e) => setCallData({ ...callData, phoneNumber: e.target.value })}
                        placeholder="+234..."
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
                <DialogActions>
                    <Button onClick={() => setOpenCallDialog(false)}>Cancel</Button>
                    <Button onClick={handleInitiateCall} variant="contained">Call</Button>
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

export default CallCenter;
