"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtpUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const logger_1 = require("../../../utils/logger");
class ResendOtpUseCase {
    constructor(_userRepository, _emailService) {
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async execute(email) {
        logger_1.logger.info('ResendOtpUseCase received email', { email });
        const user = await this._userRepository.findUserByEmail(email);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_CREDENTIALS, "User not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        if (user.isVerified) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_ALREADY_EXISTS, "User already verified", HttpStatusCode_1.HttpStatusCode.CONFLICT);
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
        await this._userRepository.updateOtp(email, otp, otpExpiry);
        await this._emailService.sendEmail(email, `Your OTP: ${otp}`);
        logger_1.logger.info('Resend OTP generated', { otp });
    }
}
exports.ResendOtpUseCase = ResendOtpUseCase;
