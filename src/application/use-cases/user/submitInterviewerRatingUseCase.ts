import { ISubmitInterviewerRatingService } from "../../../domain/interfaces/ISubmitInterviewerRatingService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { IBookingRepository } from "../../../domain/interfaces/IBookingRepository";
import { SubmitInterviewerFeedbackDTO, InterviewerFeedbackResponseDTO } from "../../../domain/dtos/feedback.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toInterviewerFeedbackResponseDTO } from "../../mappers/feedbackMapper";

export class SubmitInterviewerRatingUseCase implements ISubmitInterviewerRatingService{
    constructor(
        private _feedbackRepository:IFeedbackRepository,
        private _bookingRepository:IBookingRepository
    ){}

    async execute(userId: string, data: SubmitInterviewerFeedbackDTO): Promise<InterviewerFeedbackResponseDTO> {
        try {
            const booking=await this._bookingRepository.getBookingById(data.bookingId)
            if(!booking){
                throw new AppError(
                    ErrorCode.NOT_FOUND,
                    "Booking not found",
                    HttpStatusCode.NOT_FOUND
                )
            }
            if(booking.userId!==userId){
                throw new AppError(
                    ErrorCode.FORBIDDEN,
                    "Only the candidate can submit rating",
                    HttpStatusCode.FORBIDDEN
                )
            }

            const existing=await this._feedbackRepository.findInterviewerRatingByBookingId(data.bookingId)
            if(existing){
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    "Rating already submitted for this booking",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const rating = await this._feedbackRepository.createInterviewerRating(booking.interviewerId,userId,data)
            return toInterviewerFeedbackResponseDTO(rating)

        } catch (error) {
            if(error instanceof AppError){
                throw error
            }
            throw new AppError(
                ErrorCode.INTERNAL_ERROR,
                "Failed to submit rating",
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }
}

