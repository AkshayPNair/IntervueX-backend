"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitFeedbackUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SubmitFeedbackUseCase {
    constructor(_feedbackRepository, _bookingRepository) {
        this._feedbackRepository = _feedbackRepository;
        this._bookingRepository = _bookingRepository;
    }
    async execute(interviewerId, userId, data) {
        try {
            const booking = await this._bookingRepository.getBookingById(data.bookingId);
            if (!booking) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (booking.interviewerId !== interviewerId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, "Only the assigned interviewer can submit feedback", HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            const existing = await this._feedbackRepository.findByBookingId(data.bookingId);
            if (existing) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Feedback already submitted for this booking", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const feedback = await this._feedbackRepository.createFeedback(interviewerId, booking.userId, data);
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
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to submit feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.SubmitFeedbackUseCase = SubmitFeedbackUseCase;
