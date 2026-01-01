import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material'
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Home as HomeIcon,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const result = await login(email, password)
            if (result.success) {
                navigate('/')
            } else {
                setError(result.error?.message || 'Login failed')
            }
        } catch (err) {
            setError(err.response?.data?.error?.message || 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 50%, #81C784 100%)',
                p: 2,
            }}
        >
            <Card
                sx={{
                    maxWidth: 420,
                    width: '100%',
                    p: 4,
                    borderRadius: 3,
                }}
            >
                {/* Logo */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        sx={{
                            width: 60,
                            height: 60,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                        }}
                    >
                        <HomeIcon sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                        JustBack Host
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        Manage your properties and bookings
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon color="action" />
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
                        margin="normal"
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{ mt: 3, py: 1.5 }}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Demo credentials: <strong>host@justback.com</strong> / <strong>password123</strong>
                    </Typography>
                </Box>
            </Card>
        </Box>
    )
}
