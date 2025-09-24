"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwtService_1 = require("../../infrastructure/external/services/jwtService");
const AppError_1 = require("../../application/error/AppError");
const ErrorCode_1 = require("../../application/error/ErrorCode");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HttpStatusCode_1 = require("../../utils/HttpStatusCode");
const authenticateToken = (req, res, next) => {
    const token = req.cookies.access_token || req.cookies.temp_auth;
    if (!token) {
        throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Access token required', 401);
    }
    try {
        let verified;
        if (req.cookies.access_token) {
            verified = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
        }
        else if (req.cookies.temp_auth) {
            const decoded = jsonwebtoken_1.default.decode(token);
            if (!decoded || !decoded.role) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const role = decoded.role;
            verified = (0, jwtService_1.verifyJwt)(token, role);
        }
        else {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'No valid token found', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        // Check if user is blocked
        if (verified.isBlocked) {
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            res.clearCookie('temp_auth');
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'User is blocked', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        req.user = {
            id: verified.id || verified.userId,
            email: verified.email,
            role: verified.role,
            isBlocked: verified.isBlocked,
        };
        next();
    }
    catch (error) {
        throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Invalid token', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
    }
};
exports.authenticateToken = authenticateToken;
