import { FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IListUserFeedbacksService {
    execute(userId: string): Promise<FeedbackResponseDTO[]>;
}