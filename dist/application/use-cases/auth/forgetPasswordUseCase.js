"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgetPasswordUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const generateOtp_1 = require("../../../utils/generateOtp");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ForgetPasswordUseCase {
    constructor(_userRepository, _emailService) {
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async execute(dto) {
        const user = await this._userRepository.findUserByEmail(dto.email);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_CREDENTIALS, "User not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        if (!user.isVerified) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "Please verify your account first", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const otp = (0, generateOtp_1.generateOtp)();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);
        await this._userRepository.updateOtp(dto.email, otp, otpExpiry);
        await this._emailService.sendEmail(dto.email, otp);
    }
}
exports.ForgetPasswordUseCase = ForgetPasswordUseCase;
