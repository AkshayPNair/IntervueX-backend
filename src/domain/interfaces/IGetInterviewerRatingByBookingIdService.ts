import { InterviewerFeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IGetInterviewerRatingByBookingIdService{
    execute(userId:string, bookingId:string):Promise<InterviewerFeedbackResponseDTO>
}