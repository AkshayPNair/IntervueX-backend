import { InterviewerFeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IGetUserRatingByBookingIdService {
  execute(interviewerId: string, bookingId: string): Promise<InterviewerFeedbackResponseDTO>
}