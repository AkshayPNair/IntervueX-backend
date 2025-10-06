"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListInterviewerRatingsUseCase = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ListInterviewerRatingsUseCase {
    constructor(_feedbackRepository) {
        this._feedbackRepository = _feedbackRepository;
    }
    async execute(interviewerId) {
        try {
            const ratings = await this._feedbackRepository.getInterviewerRatingsByInterviewer(interviewerId);
            ratings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
            return ratings.map(rating => ({
                id: rating.id,
                bookingId: rating.bookingId,
                interviewerId: rating.interviewerId,
                userId: rating.userId,
                rating: rating.rating,
                comment: rating.comment,
                createdAt: rating.createdAt,
            }));
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Failed to get ratings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.ListInterviewerRatingsUseCase = ListInterviewerRatingsUseCase;
