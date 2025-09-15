import {IListUserFeedbacksService} from '../../../domain/interfaces/IListUserFeedbacksService'
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";


export class ListUserFeedbacksUseCase implements IListUserFeedbacksService {
    constructor(private _feedbackRepository: IFeedbackRepository) { }

    async execute(userId: string){
        try {
            const list = await this._feedbackRepository.getFeedbacksByUser(userId)
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
            }))
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