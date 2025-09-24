"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitInterviewerRatingUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const feedbackMapper_1 = require("../../mappers/feedbackMapper");
class SubmitInterviewerRatingUseCase {
    constructor(_feedbackRepository, _bookingRepository) {
        this._feedbackRepository = _feedbackRepository;
        this._bookingRepository = _bookingRepository;
    }
    async execute(userId, data) {
        try {
            const booking = await this._bookingRepository.getBookingById(data.bookingId);
            if (!booking) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (booking.userId !== userId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, "Only the candidate can submit rating", HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            const existing = await this._feedbackRepository.findInterviewerRatingByBookingId(data.bookingId);
            if (existing) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, "Rating already submitted for this booking", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const rating = await this._feedbackRepository.createInterviewerRating(booking.interviewerId, userId, data);
            return (0, feedbackMapper_1.toInterviewerFeedbackResponseDTO)(rating);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, "Failed to submit rating", HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.SubmitInterviewerRatingUseCase = SubmitInterviewerRatingUseCase;
