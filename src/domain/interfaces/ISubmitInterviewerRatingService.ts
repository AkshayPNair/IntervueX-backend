import { InterviewerFeedbackResponseDTO, SubmitInterviewerFeedbackDTO } from "../dtos/feedback.dto";

export interface ISubmitInterviewerRatingService{
    execute(userId:string,data:SubmitInterviewerFeedbackDTO):Promise<InterviewerFeedbackResponseDTO>
}