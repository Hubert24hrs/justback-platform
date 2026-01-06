import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
    Inbox as InboxIcon,
    Search as SearchIcon,
    Error as ErrorIcon,
    Add as AddIcon
} from '@mui/icons-material';

const illustrations = {
    empty: InboxIcon,
    search: SearchIcon,
    error: ErrorIcon
};

const EmptyState = ({
    type = 'empty',
    title = 'No data found',
    description = 'There are no items to display at the moment.',
    actionLabel,
    onAction,
    icon: CustomIcon
}) => {
    const Icon = CustomIcon || illustrations[type];

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 4,
                textAlign: 'center',
                animation: 'fadeIn 0.5s ease-out'
            }}
        >
            {/* Animated Icon Container */}
            <Box
                sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(0,168,107,0.1) 0%, rgba(41,121,255,0.1) 100%)',
                    mb: 3,
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: -8,
                        borderRadius: '50%',
                        border: '2px dashed',
                        borderColor: 'primary.light',
                        opacity: 0.5,
                        animation: 'spin 20s linear infinite'
                    }
                }}
            >
                <Icon
                    sx={{
                        fontSize: 56,
                        color: 'primary.main',
                        animation: 'float 3s ease-in-out infinite'
                    }}
                />
            </Box>

            {/* Title */}
            <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ color: 'text.primary' }}
            >
                {title}
            </Typography>

            {/* Description */}
            <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 400, mb: actionLabel ? 3 : 0 }}
            >
                {description}
            </Typography>

            {/* Action Button */}
            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={onAction}
                    sx={{
                        mt: 2,
                        px: 4,
                        py: 1.5,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                        boxShadow: '0 4px 14px rgba(0, 168, 107, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(0, 168, 107, 0.4)',
                            transform: 'translateY(-2px)'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
};

export default EmptyState;
