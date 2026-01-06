import React from 'react';
import { Box, Skeleton } from '@mui/material';

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 6 }) => (
    <Box>
        {[...Array(rows)].map((_, rowIndex) => (
            <Box
                key={rowIndex}
                sx={{
                    display: 'flex',
                    gap: 2,
                    py: 2,
                    px: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    animation: 'fadeIn 0.3s ease-out',
                    animationDelay: `${rowIndex * 50}ms`,
                    animationFillMode: 'both'
                }}
            >
                {[...Array(columns)].map((_, colIndex) => (
                    <Skeleton
                        key={colIndex}
                        variant="rounded"
                        width={colIndex === 0 ? 40 : `${Math.random() * 40 + 60}%`}
                        height={colIndex === 0 ? 40 : 20}
                        sx={{
                            borderRadius: colIndex === 0 ? 1 : 0.5,
                            flex: colIndex === columns - 1 ? 'none' : 1
                        }}
                    />
                ))}
            </Box>
        ))}
    </Box>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
    <Box
        sx={{
            p: 2.5,
            height: 140,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="circular" width={40} height={40} />
        </Box>
        <Skeleton variant="text" width={80} height={40} />
    </Box>
);

// Chart Skeleton
export const ChartSkeleton = ({ height = 300 }) => (
    <Box
        sx={{
            p: 3,
            height,
            bgcolor: 'background.paper',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column'
        }}
    >
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 1 }}>
            {[...Array(12)].map((_, i) => (
                <Skeleton
                    key={i}
                    variant="rounded"
                    width="100%"
                    height={`${Math.random() * 60 + 20}%`}
                    sx={{
                        flex: 1,
                        animation: 'slideUp 0.4s ease-out',
                        animationDelay: `${i * 50}ms`,
                        animationFillMode: 'both'
                    }}
                />
            ))}
        </Box>
    </Box>
);

// List Skeleton
export const ListSkeleton = ({ items = 5 }) => (
    <Box>
        {[...Array(items)].map((_, i) => (
            <Box
                key={i}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    py: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    animation: 'slideIn 0.3s ease-out',
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: 'both'
                }}
            >
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="40%" height={16} />
                </Box>
                <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
            </Box>
        ))}
    </Box>
);

// Card Grid Skeleton
export const CardGridSkeleton = ({ count = 6 }) => (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3 }}>
        {[...Array(count)].map((_, i) => (
            <Box
                key={i}
                sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    animation: 'fadeIn 0.3s ease-out',
                    animationDelay: `${i * 100}ms`,
                    animationFillMode: 'both'
                }}
            >
                <Skeleton variant="rectangular" height={160} />
                <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="80%" height={24} />
                    <Skeleton variant="text" width="60%" height={18} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Skeleton variant="text" width={80} height={20} />
                        <Skeleton variant="rounded" width={60} height={24} sx={{ borderRadius: 2 }} />
                    </Box>
                </Box>
            </Box>
        ))}
    </Box>
);

export default {
    TableSkeleton,
    StatsCardSkeleton,
    ChartSkeleton,
    ListSkeleton,
    CardGridSkeleton
};
