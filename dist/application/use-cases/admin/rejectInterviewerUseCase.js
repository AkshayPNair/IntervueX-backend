"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectInterviewerUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const logger_1 = require("../../../utils/logger");
class RejectInterviewerUseCase {
    constructor(_userRepository, _emailService) {
        this._userRepository = _userRepository;
        this._emailService = _emailService;
    }
    async execute(interviewerId, rejectedReason) {
        try {
            const user = await this._userRepository.findUserById(interviewerId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, "Interviewer not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (user.role !== "interviewer") {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "User is not an interviewer", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (user.isApproved) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "Cannot reject an already approved interviewer", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const finalRejectionReason = rejectedReason || "Application did not meet requirements";
            await this._userRepository.updateUser(interviewerId, {
                isApproved: false,
                isRejected: true,
                rejectedReason: finalRejectionReason
            });
            try {
                await this._emailService.sendRejectionEmail(user.email, user.name, finalRejectionReason);
            }
            catch (emailError) {
                logger_1.logger.error('Failed to send rejection email', { error: emailError });
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.RejectInterviewerUseCase = RejectInterviewerUseCase;
