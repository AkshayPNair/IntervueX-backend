"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const bcryptjs_1 = require("bcryptjs");
const jwtService_1 = require("../../../infrastructure/external/services/jwtService");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class LoginUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(loginDto) {
        const user = await this._userRepository.findUserByEmail(loginDto.email);
        if (!user || !user.isVerified || user.isBlocked) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        const isMatch = await (0, bcryptjs_1.compare)(loginDto.password, user.password);
        if (!isMatch) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_CREDENTIALS, 'Invalid credentials', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        // Generate JWT
        const token = (0, jwtService_1.signJwt)({
            id: user.id,
            role: user.role,
            email: user.email,
        }, user.role);
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isApproved: user.isApproved,
                isBlocked: user.isBlocked,
            },
            token
        };
    }
}
exports.LoginUseCase = LoginUseCase;
