import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({
    title,
    value,
    icon: Icon,
    color = '#00A86B',
    trend,
    trendValue,
    prefix = '',
    suffix = '',
    delay = 0
}) => {
    const [displayValue, setDisplayValue] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    // Animate number counting
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (!isVisible) return;

        const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        const duration = 1000;
        const steps = 30;
        const stepValue = numericValue / steps;
        let current = 0;

        const interval = setInterval(() => {
            current += stepValue;
            if (current >= numericValue) {
                setDisplayValue(numericValue);
                clearInterval(interval);
            } else {
                setDisplayValue(current);
            }
        }, duration / steps);

        return () => clearInterval(interval);
    }, [value, isVisible]);

    const formatValue = (val) => {
        if (typeof value === 'string' && value.includes('₦')) {
            return value; // Already formatted
        }
        if (val >= 1000000) {
            return `${(val / 1000000).toFixed(1)}M`;
        }
        if (val >= 1000) {
            return `${(val / 1000).toFixed(1)}K`;
        }
        return Math.round(val).toLocaleString();
    };

    return (
        <Paper
            sx={{
                p: 2.5,
                height: 150,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)',
                transition: 'all 0.3s ease',
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 40px ${color}20`,
                    borderColor: `${color}40`
                },
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`
                }
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography
                    color="text.secondary"
                    variant="body2"
                    fontWeight="600"
                    sx={{ letterSpacing: '0.5px' }}
                >
                    {title}
                </Typography>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
                        color: color
                    }}
                >
                    {Icon && <Icon sx={{ fontSize: 24 }} />}
                </Box>
            </Box>

            {/* Value */}
            <Box>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    sx={{
                        color: 'text.primary',
                        lineHeight: 1.2
                    }}
                >
                    {prefix}{typeof value === 'string' ? value : formatValue(displayValue)}{suffix}
                </Typography>

                {/* Trend */}
                {trend && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {trend === 'up' ? (
                            <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                        ) : (
                            <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                        )}
                        <Typography
                            variant="caption"
                            fontWeight="600"
                            color={trend === 'up' ? 'success.main' : 'error.main'}
                        >
                            {trendValue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Background decoration */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -20,
                    bottom: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${color}08`,
                    pointerEvents: 'none'
                }}
            />
        </Paper>
    );
};

export default StatsCard;
