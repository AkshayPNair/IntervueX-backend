import { SubmitFeedbackDTO, FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface ISubmitFeedbackService{
    execute(interviewerId:string,userId:string,data:SubmitFeedbackDTO):Promise<FeedbackResponseDTO>
}