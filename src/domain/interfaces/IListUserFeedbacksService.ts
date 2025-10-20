import { FeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IListUserFeedbacksService {
    execute(userId: string, page: number, limit: number): Promise<{ data: FeedbackResponseDTO[]; pagination: { currentPage: number; totalPages: number; totalItems: number; limit: number } }>;
}