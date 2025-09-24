"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyOtpUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class VerifyOtpUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(dto) {
        const user = await this._userRepository.findUserByEmail(dto.email);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_OTP, 'Invalid or expired OTP', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (!user.otp || user.otp !== dto.otp) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_OTP, 'Invalid OTP', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (!user.otpExpiry || user.otpExpiry < new Date()) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.EXPIRED_OTP, 'OTP has expired', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (dto.type === 'reset-password') {
            if (!user.isVerified) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Please verify your account first', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
        }
        else {
            if (user.isVerified) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_ALREADY_EXISTS, 'User already exists', HttpStatusCode_1.HttpStatusCode.CONFLICT);
            }
        }
        await this._userRepository.updateUserVerification(dto.email);
    }
}
exports.VerifyOtpUseCase = VerifyOtpUseCase;
