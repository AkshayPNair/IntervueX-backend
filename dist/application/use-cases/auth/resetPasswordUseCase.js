"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ResetPasswordUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(dto) {
        const user = await this._userRepository.findUserByEmail(dto.email);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_OTP, "Invalid or expired OTP", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (!user.isVerified) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "Please verify your email first'", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const hashedPassword = await bcryptjs_1.default.hash(dto.newPassword, 10);
        await this._userRepository.updatePassword(dto.email, hashedPassword);
        await this._userRepository.updateOtp(dto.email, null, null);
    }
}
exports.ResetPasswordUseCase = ResetPasswordUseCase;
