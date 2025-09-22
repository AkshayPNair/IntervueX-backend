import { ISubmitFeedbackService } from "../../../domain/interfaces/ISubmitFeedbackService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { SubmitFeedbackDTO, FeedbackResponseDTO } from "../../../domain/dtos/feedback.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class SubmitFeedbackUseCase implements ISubmitFeedbackService {
    constructor(
        private _feedbackRepository: IFeedbackRepository,
        private _bookingRepository: IBookingRepository
    ) { }

    async execute(interviewerId: string, userId: string, data: SubmitFeedbackDTO): Promise<FeedbackResponseDTO> {
        try {
            const booking = await this._bookingRepository.getBookingById(data.bookingId)
            if (!booking) {
                throw new AppError(ErrorCode.NOT_FOUND, "Booking not found", HttpStatusCode.NOT_FOUND);
            }
            if (booking.interviewerId !== interviewerId) {
                throw new AppError(
                    ErrorCode.FORBIDDEN,
                    "Only the assigned interviewer can submit feedback",
                    HttpStatusCode.FORBIDDEN
                )
            }

            const existing = await this._feedbackRepository.findByBookingId(data.bookingId)
            if (existing) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "Feedback already submitted for this booking",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const feedback = await this._feedbackRepository.createFeedback(interviewerId, booking.userId, data)

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
            throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to submit feedback', HttpStatusCode.INTERNAL_SERVER);
        }
    }
}