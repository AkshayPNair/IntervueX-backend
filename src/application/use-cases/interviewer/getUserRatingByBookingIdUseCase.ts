import { IGetUserRatingByBookingIdService } from "../../../domain/interfaces/IGetUserRatingByBookingIdService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { InterviewerFeedbackResponseDTO } from "../../../domain/dtos/feedback.dto";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { toInterviewerFeedbackResponseDTO } from "../../mappers/feedbackMapper";

export class GetUserRatingByBookingIdUseCase implements IGetUserRatingByBookingIdService {
  constructor(private _feedbackRepository: IFeedbackRepository) {}

  async execute(interviewerId: string, bookingId: string): Promise<InterviewerFeedbackResponseDTO> {
    try {
      const rating = await this._feedbackRepository.findInterviewerRatingByBookingId(bookingId)
      if (!rating) {
        throw new AppError(
          ErrorCode.NOT_FOUND,
          "Rating not found",
          HttpStatusCode.NOT_FOUND
        )
      }
      if (rating.interviewerId !== interviewerId) {
        throw new AppError(
          ErrorCode.FORBIDDEN,
          "You are not allowed to view this rating",
          HttpStatusCode.FORBIDDEN
        )
      }
      return toInterviewerFeedbackResponseDTO(rating)
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        "Failed to fetch rating",
        HttpStatusCode.INTERNAL_SERVER
      )
    }
  }
}