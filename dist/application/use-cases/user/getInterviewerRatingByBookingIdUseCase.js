"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerRatingByBookingIdUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const feedbackMapper_1 = require("../../mappers/feedbackMapper");
class GetInterviewerRatingByBookingIdUseCase {
    constructor(_feedbackRepository) {
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(userId, bookingId) {
        try {
            const rating = await this._feedbackRepository.findInterviewerRatingByBookingId(bookingId);
            if (!rating) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Rating not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (rating.userId !== userId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.FORBIDDEN, "You are not allowed to view this rating", HttpStatusCode_1.HttpStatusCode.FORBIDDEN);
            }
            return (0, feedbackMapper_1.toInterviewerFeedbackResponseDTO)(rating);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, "Failed to fetch rating", HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GetInterviewerRatingByBookingIdUseCase = GetInterviewerRatingByBookingIdUseCase;
