"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireInterviewerOrAdmin = exports.requireUser = exports.requireInterviewer = exports.requireAdmin = exports.requireRole = void 0;
const AppError_1 = require("../../application/error/AppError");
const ErrorCode_1 = require("../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../utils/HttpStatusCode");
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Authentication required', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, 'Insufficient permissions', HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.requireAdmin = (0, exports.requireRole)(['admin']);
exports.requireInterviewer = (0, exports.requireRole)(['interviewer']);
exports.requireUser = (0, exports.requireRole)(['user']);
exports.requireInterviewerOrAdmin = (0, exports.requireRole)(['interviewer', 'admin']);
