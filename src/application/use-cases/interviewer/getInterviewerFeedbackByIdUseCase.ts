import { IGetInterviewerFeedbackByIdService } from "../../../domain/interfaces/IGetInterviewerFeedbackByIdService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { FeedbackResponseDTO } from "../../../domain/dtos/feedback.dto";

export class GetInterviewerFeedbackByIdUseCase implements IGetInterviewerFeedbackByIdService {
    constructor(private _feedbackRepository: IFeedbackRepository) { }

    async execute(interviewerId: string, feedbackId: string): Promise<FeedbackResponseDTO> {
        try {
            const feedback = await this._feedbackRepository.getFeedbackById(feedbackId)
        if (!feedback) {
            throw new AppError(ErrorCode.NOT_FOUND, 'Feedback not found', HttpStatusCode.NOT_FOUND);
        }
        if (feedback.interviewerId !== interviewerId) {
            throw new AppError(ErrorCode.FORBIDDEN, 'Not allowed', HttpStatusCode.FORBIDDEN);
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

        }
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get feedback', HttpStatusCode.INTERNAL_SERVER);
        }
    }
}