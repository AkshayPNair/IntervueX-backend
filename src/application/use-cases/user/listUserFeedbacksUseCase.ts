import {IListUserFeedbacksService} from '../../../domain/interfaces/IListUserFeedbacksService'
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";


export class ListUserFeedbacksUseCase implements IListUserFeedbacksService {
    constructor(private _feedbackRepository: IFeedbackRepository) { }

    async execute(userId: string, page: number, limit: number) {
        try {
            const { feedbacks, total } = await this._feedbackRepository.getPaginatedFeedbacksByUser(userId, page, limit)

            const data = feedbacks.map(feedback => ({
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
            }))

            return {
                data,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit) || 1,
                    totalItems: total,
                    limit
                }
            }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                'Failed to get feedbacks',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

}