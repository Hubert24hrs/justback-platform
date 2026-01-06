import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
    Checkbox,
    FormControlLabel,
    CircularProgress
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0F1419 0%, #1A2634 50%, #0F1419 100%)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Animated Background Elements */}
            <Box
                sx={{
                    position: 'absolute',
                    width: 500,
                    height: 500,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,168,107,0.15) 0%, transparent 70%)',
                    top: -200,
                    right: -100,
                    animation: 'float 8s ease-in-out infinite'
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(41,121,255,0.12) 0%, transparent 70%)',
                    bottom: -150,
                    left: -100,
                    animation: 'float 10s ease-in-out infinite reverse'
                }}
            />

            {/* Login Card */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 4, sm: 5 },
                    width: '100%',
                    maxWidth: 440,
                    mx: 2,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.98)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 24px 80px rgba(0, 0, 0, 0.3)',
                    animation: 'slideUp 0.5s ease-out'
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #00A86B 0%, #00D4AA 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                            boxShadow: '0 8px 32px rgba(0, 168, 107, 0.35)',
                            animation: 'glow 3s ease-in-out infinite'
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 28,
                                fontWeight: 800,
                                color: '#fff'
                            }}
                        >
                            JB
                        </Typography>
                    </Box>
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
                        JustBack
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Admin Dashboard
                    </Typography>
                </Box>

                {/* Welcome Text */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h5" fontWeight="600" gutterBottom>
                        Welcome back! 👋
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Sign in to continue managing your platform
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 3,
                            borderRadius: 2,
                            animation: 'slideUp 0.3s ease-out'
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        sx={{ mb: 2.5 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Remember Me & Forgot Password */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    sx={{
                                        color: 'text.secondary',
                                        '&.Mui-checked': { color: 'primary.main' }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" color="text.secondary">
                                    Remember me
                                </Typography>
                            }
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'primary.main',
                                cursor: 'pointer',
                                fontWeight: 500,
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Forgot password?
                        </Typography>
                    </Box>

                    {/* Submit Button */}
                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            borderRadius: 2.5,
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: '-100%',
                                width: '200%',
                                height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                animation: loading ? 'shimmer 1.5s infinite' : 'none'
                            }
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                Signing in...
                            </Box>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                {/* Footer */}
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                        Protected by enterprise-grade security 🔒
                    </Typography>
                </Box>
            </Paper>

            {/* Version */}
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    color: 'rgba(255,255,255,0.4)'
                }}
            >
                JustBack Admin v1.0.0
            </Typography>
        </Box>
    );
}
