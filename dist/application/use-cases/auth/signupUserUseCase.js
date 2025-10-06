"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignupUserUseCase = void 0;
const generateOtp_1 = require("../../../utils/generateOtp");
const userMapper_1 = require("../../mappers/userMapper");
const interviewerMapper_1 = require("../../mappers/interviewerMapper");
const hashPassword_1 = require("../../../utils/hashPassword");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SignupUserUseCase {
    constructor(_userRepository, _interviewerRepository, _emailService) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
        this._emailService = _emailService;
    }
    async execute(userDto, interviewerDto) {
        // Validation
        if (!userDto.name || userDto.name.trim().length < 2) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name must be at least 2 characters long', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (userDto.name.trim().length > 30) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name must be 30 characters or less', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userDto.email || !emailRegex.test(userDto.email)) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid email format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!userDto.password || !passwordRegex.test(userDto.password)) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (userDto.role === "admin") {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Admin signup not allowed', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        if (!["user", "interviewer"].includes(userDto.role)) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid role. Must be user or interviewer', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const existingUser = await this._userRepository.findUserByEmail(userDto.email);
        if (existingUser) {
            if (existingUser.isVerified) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_ALREADY_EXISTS, 'User with this email already exists', HttpStatusCode_1.HttpStatusCode.CONFLICT);
            }
            else {
                await this._userRepository.deleteUserByEmail(userDto.email);
            }
        }
        const otp = (0, generateOtp_1.generateOtp)();
        const otpExpiry = new Date(Date.now() + 2 * 60 * 1000);
        const hashedPassword = await (0, hashPassword_1.hashPassword)(userDto.password);
        const userDomain = (0, userMapper_1.toUserDomain)({ ...userDto, password: hashedPassword, otp, otpExpiry, isVerified: false, isGoogleUser: userDto.isGoogleUser ?? false, googleId: userDto.googleId ?? undefined });
        const user = await this._userRepository.createUser(userDomain);
        if (userDto.role === "interviewer" && interviewerDto && user.id) {
            const interviewerDomain = (0, interviewerMapper_1.toInterviewerDomain)(interviewerDto, user.id);
            await this._interviewerRepository.createInterviewer(interviewerDomain);
        }
        await this._emailService.sendEmail(userDto.email, `Your OTP : ${otp}`);
    }
}
exports.SignupUserUseCase = SignupUserUseCase;
