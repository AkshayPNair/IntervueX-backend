import { FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IListInterviewerFeedbacksService {
    execute(interviewerId: string): Promise<FeedbackResponseDTO[]>;
}