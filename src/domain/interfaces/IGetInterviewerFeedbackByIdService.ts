import { FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IGetInterviewerFeedbackByIdService{
    execute(interviewerId:string, feedbackId:string):Promise<FeedbackResponseDTO>
}