import { IListInterviewerRatingsService } from "../../../domain/interfaces/IListInterviewerRatingsService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class ListInterviewerRatingsUseCase implements IListInterviewerRatingsService {
    constructor(private _feedbackRepository: IFeedbackRepository) { }

    async execute(interviewerId: string) {
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
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get ratings', HttpStatusCode.INTERNAL_SERVER);
        }
    }
}