"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const userMapper_1 = require("../../../application/mappers/userMapper");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const notificationPublisher_1 = require("../../socket/notificationPublisher");
const logger_1 = require("../../../utils/logger");
class AuthController {
    constructor(_signupService, _verifyOtpService, _loginService, _resendOtpService, _forgetPasswordService, _resetPasswordService, _googleAuthService, _notificationPublisher) {
        this._signupService = _signupService;
        this._verifyOtpService = _verifyOtpService;
        this._loginService = _loginService;
        this._resendOtpService = _resendOtpService;
        this._forgetPasswordService = _forgetPasswordService;
        this._resetPasswordService = _resetPasswordService;
        this._googleAuthService = _googleAuthService;
        this._notificationPublisher = _notificationPublisher;
    }
    async signupUser(req, res) {
        try {
            const { userDto, interviewerDto } = req.body;
            await this._signupService.execute(userDto, interviewerDto);
            // Notify admins about a new registration
            this._notificationPublisher.toAdmin(notificationPublisher_1.NotifyEvents.NewRegistration, {
                role: userDto.role,
                email: userDto.email,
                name: userDto.name,
                timestamp: new Date().toISOString(),
            });
            res.status(HttpStatusCode_1.HttpStatusCode.CREATED).json({ message: "User created successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async verifyOtp(req, res) {
        try {
            const result = await this._verifyOtpService.execute(req.body);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            await this._resendOtpService.execute(email);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "Otp sent successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async forgetPassword(req, res) {
        try {
            logger_1.logger.info("BODY RECEIVED:", req.body);
            const { email } = req.body;
            await this._forgetPasswordService.execute({ email });
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "OTP sent to your email successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async resetPassword(req, res) {
        try {
            const { email, otp, newPassword } = req.body;
            await this._resetPasswordService.execute({ email, otp, newPassword });
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "Password reset successfully" });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async login(req, res) {
        try {
            const loginDto = (0, userMapper_1.toLoginUserDTO)(req.body);
            const result = await this._loginService.execute(loginDto);
            const jwt = require('jsonwebtoken');
            const payload = {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
                isBlocked: result.user.isBlocked || false
            };
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000, // 15 minutes
                path: '/'
            });
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({
                user: result.user,
                message: 'Login successful'
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred.",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refresh_token;
            if (!refreshToken) {
                return res.status(HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED).json({
                    error: "Refresh token not found"
                });
            }
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            if (decoded.isBlocked) {
                res.clearCookie('access_token');
                res.clearCookie('refresh_token');
                return res.status(HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED).json({
                    error: 'User is blocked'
                });
            }
            const newAccessToken = jwt.sign({
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                isBlocked: decoded.isBlocked
            }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });
            // Return user data
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role,
                    isBlocked: decoded.isBlocked
                },
                accessToken: newAccessToken
            });
        }
        catch (error) {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.status(HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED).json({
                error: 'Invalid refresh token'
            });
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.clearCookie('auth_user');
            res.clearCookie('auth_interviewer');
            res.clearCookie('auth_admin');
            res.clearCookie('temp_auth');
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: 'Logout successful' });
        }
        catch (error) {
            res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                error: 'Logout failed',
                code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
            });
        }
    }
    async googleLogin(req, res) {
        try {
            logger_1.logger.info('Google login request body:', req.body);
            const googleData = req.body;
            // Validate required fields
            if (!googleData.email || !googleData.name || !googleData.googleId) {
                logger_1.logger.warn('Google login validation failed', {
                    email: !!googleData.email,
                    name: !!googleData.name,
                    googleId: !!googleData.googleId
                });
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: 'Missing required fields: email, name, and googleId are required',
                    code: ErrorCode_1.ErrorCode.VALIDATION_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
                return;
            }
            const result = await this._googleAuthService.googleLogin(googleData);
            if (!result.needsRoleSelection) {
                const jwt = require('jsonwebtoken');
                const payload = {
                    id: result.user.id,
                    email: result.user.email,
                    role: result.user.role,
                    isBlocked: false
                };
                const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
                const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000, // 15 minutes
                    path: '/'
                });
                res.cookie('refresh_token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                    path: '/'
                });
            }
            else {
                // Set temporary cookie for role selection
                res.cookie('temp_auth', result.token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 15 * 60 * 1000, // 15 minutes - temporary
                    path: '/'
                });
            }
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({
                user: result.user,
                needsRoleSelection: result.needsRoleSelection,
                message: 'Google authentication successful'
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : 'Google authentication failed',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
    async selectRole(req, res) {
        try {
            logger_1.logger.debug?.('=== SELECT ROLE DEBUG ===');
            logger_1.logger.debug?.('Request cookies:', req.cookies);
            logger_1.logger.debug?.('Request user:', req.user);
            const roleData = req.body;
            const userId = req.user?.id; // Assuming you have auth middleware that sets req.user
            logger_1.logger.debug?.('Extracted userId:', userId);
            logger_1.logger.debug?.('Role data:', roleData);
            if (!userId) {
                logger_1.logger.warn('No userId found - returning 401');
                res.status(HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED).json({
                    error: 'User not authenticated',
                    code: ErrorCode_1.ErrorCode.UNAUTHORIZED,
                    status: HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED
                });
                return;
            }
            if (!roleData.role || !['user', 'interviewer'].includes(roleData.role)) {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: 'Invalid role. Must be either "user" or "interviewer"',
                    code: ErrorCode_1.ErrorCode.VALIDATION_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
                return;
            }
            const result = await this._googleAuthService.selectRole(userId, roleData);
            res.clearCookie('temp_auth');
            const jwt = require('jsonwebtoken');
            const payload = {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            };
            const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 15 * 60 * 1000, // 15 minutes
                path: '/'
            });
            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({
                user: result.user,
                message: 'Role selection successful'
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.BAD_REQUEST).json({
                    error: error instanceof Error ? error.message : 'Role selection failed',
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.BAD_REQUEST
                });
            }
        }
    }
}
exports.AuthController = AuthController;
