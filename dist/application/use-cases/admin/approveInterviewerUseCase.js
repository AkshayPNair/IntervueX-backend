"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApproveInterviewerUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const logger_1 = require("../../../utils/logger");
class ApproveInterviewerUseCase {
    constructor(_userRepository, _emailService) {
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async execute(interviewerId) {
        try {
            const user = await this._userRepository.findUserById(interviewerId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, "Interviewer not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (user.role !== "interviewer") {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "User is not an interviewer", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (user.isApproved) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "Interviewer is already approved", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            await this._userRepository.updateUser(interviewerId, { isApproved: true, isRejected: false, rejectedReason: undefined });
            try {
                await this._emailService.sendApprovalEmail(user.email, user.name);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send approval email:', emailError);
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.ApproveInterviewerUseCase = ApproveInterviewerUseCase;
