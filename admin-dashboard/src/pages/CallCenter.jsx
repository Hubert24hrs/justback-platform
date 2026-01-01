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
    List,
    ListItem,
    ListItemText,
    Divider
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Phone as PhoneIcon,
    SmartToy as BotIcon
} from '@mui/icons-material';
import { callService } from '../services/api';
import moment from 'moment';

const CallCenter = () => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCall, setSelectedCall] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

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
            // Mock data
            setCalls([
                {
                    id: '1',
                    callSid: 'CA123...',
                    phoneNumber: '+2348000000',
                    direction: 'inbound',
                    status: 'completed',
                    duration: 120,
                    averageConfidence: 0.85,
                    createdAt: new Date(),
                    transcript: [
                        { speaker: 'customer', text: 'I want to book a room in Lagos.' },
                        { speaker: 'ai', text: 'Sure! I can help you with that. Which part of Lagos?' }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (call) => {
        setSelectedCall(call);
        setOpenDialog(true);
    };

    return (
        <Box p={4}>
            <Typography variant="h4" fontWeight="bold" mb={4}>
                AI Call Center Logs
            </Typography>

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
                            {loading ? (
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
        </Box>
    );
};

export default CallCenter;
