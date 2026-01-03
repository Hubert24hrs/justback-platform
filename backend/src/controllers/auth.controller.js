const authService = require('../services/auth.service');
const Joi = require('joi');

class AuthController {
    // Register new user
    async register(req, res, next) {
        try {
            // Validation schema
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().min(8).required(),
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                phone: Joi.string().pattern(/^(\+?\d{10,15})$/).required(),
                role: Joi.string().valid('guest', 'host').default('guest')
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const result = await authService.register(value);

            res.status(201).json({
                success: true,
                data: result,
                message: 'Registration successful'
            });
        } catch (error) {
            next(error);
        }
    }

    // Login user
    async login(req, res, next) {
        try {
            const schema = Joi.object({
                email: Joi.string().email().required(),
                password: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const result = await authService.login(value.email, value.password);

            res.json({
                success: true,
                data: result,
                message: 'Login successful'
            });
        } catch (error) {
            next(error);
        }
    }

    // Refresh token
    async refreshToken(req, res, next) {
        try {
            const schema = Joi.object({
                refreshToken: Joi.string().required()
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const tokens = await authService.refreshToken(value.refreshToken);

            res.json({
                success: true,
                data: tokens
            });
        } catch (error) {
            next(error);
        }
    }

    // Get current user profile
    async getProfile(req, res, next) {
        try {
            const profile = await authService.getProfile(req.user.id);

            res.json({
                success: true,
                data: profile
            });
        } catch (error) {
            next(error);
        }
    }

    // Update profile
    async updateProfile(req, res, next) {
        try {
            const schema = Joi.object({
                firstName: Joi.string(),
                lastName: Joi.string(),
                phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/),
                avatarUrl: Joi.string().uri()
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            const camelToSnake = {
                firstName: 'first_name',
                lastName: 'last_name',
                phone: 'phone',
                avatarUrl: 'avatar_url'
            };

            const updates = {};
            Object.keys(value).forEach(key => {
                updates[camelToSnake[key]] = value[key];
            });

            const result = await authService.updateProfile(req.user.id, updates);

            res.json({
                success: true,
                data: result,
                message: 'Profile updated successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Change password
    async changePassword(req, res, next) {
        try {
            const schema = Joi.object({
                currentPassword: Joi.string().required(),
                newPassword: Joi.string().min(8).required()
            });

            const { error, value } = schema.validate(req.body);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.details[0].message
                    }
                });
            }

            await authService.changePassword(
                req.user.id,
                value.currentPassword,
                value.newPassword
            );

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    // Logout (client-side token removal, optional server-side blacklist)
    async logout(req, res) {
        // In a production app, you might want to blacklist the token
        // For now, client just deletes the token
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}

module.exports = new AuthController();
