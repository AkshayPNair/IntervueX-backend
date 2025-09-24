"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerFeedbackByIdUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GetInterviewerFeedbackByIdUseCase {
    constructor(_feedbackRepository) {
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(interviewerId, feedbackId) {
        try {
            const feedback = await this._feedbackRepository.getFeedbackById(feedbackId);
            if (!feedback) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'Feedback not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (feedback.interviewerId !== interviewerId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, 'Not allowed', HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            return {
                id: feedback.id,
                bookingId: feedback.bookingId,
                interviewerId: feedback.interviewerId,
                userId: feedback.userId,
                overallRating: feedback.overallRating,
                technicalRating: feedback.technicalRating,
                communicationRating: feedback.communicationRating,
                problemSolvingRating: feedback.problemSolvingRating,
                overallFeedback: feedback.overallFeedback,
                strengths: feedback.strengths,
                improvements: feedback.improvements,
                createdAt: feedback.createdAt,
            };
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetInterviewerFeedbackByIdUseCase = GetInterviewerFeedbackByIdUseCase;
