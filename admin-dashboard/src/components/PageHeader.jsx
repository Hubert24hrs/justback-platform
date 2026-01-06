import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Chip } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    action,
    badge,
    icon: Icon
}) => {
    return (
        <Box
            sx={{
                mb: 4,
                animation: 'slideUp 0.4s ease-out'
            }}
        >
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 1 }}
                >
                    {breadcrumbs.map((crumb, index) => (
                        <Link
                            key={index}
                            href={crumb.href || '#'}
                            underline="hover"
                            color={index === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                            sx={{
                                fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                                fontSize: '0.875rem',
                                cursor: crumb.href ? 'pointer' : 'default'
                            }}
                        >
                            {crumb.label}
                        </Link>
                    ))}
                </Breadcrumbs>
            )}

            {/* Title Row */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {Icon && (
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                                color: 'white',
                                boxShadow: '0 4px 14px rgba(0, 168, 107, 0.3)'
                            }}
                        >
                            <Icon />
                        </Box>
                    )}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                sx={{
                                    background: 'linear-gradient(135deg, #172B4D 0%, #00A86B 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text'
                                }}
                            >
                                {title}
                            </Typography>
                            {badge && (
                                <Chip
                                    label={badge}
                                    size="small"
                                    sx={{
                                        fontWeight: 600,
                                        background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                                        color: 'white'
                                    }}
                                />
                            )}
                        </Box>
                        {subtitle && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Action Button(s) */}
                {action && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {action}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PageHeader;
