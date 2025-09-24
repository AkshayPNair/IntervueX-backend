"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListInterviewerFeedbacksUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ListInterviewerFeedbacksUseCase {
    constructor(_feedbackRepository) {
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(interviewerId) {
        try {
            const list = await this._feedbackRepository.getFeedbacksByInterviewer(interviewerId);
            return list.map(feedback => ({
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
            }));
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get feedbacks', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.ListInterviewerFeedbacksUseCase = ListInterviewerFeedbacksUseCase;
