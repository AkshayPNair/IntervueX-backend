import { FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IGetUserFeedbackByIdService{
    execute(userId:string, feedbackId:string):Promise<FeedbackResponseDTO>
}