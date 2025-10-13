import { FeedbackResponseDTO, PaginatedFeedbackResponseDTO } from "../dtos/feedback.dto";

export interface IListInterviewerFeedbacksService {
    execute(interviewerId: string, page: number, limit: number,searchTerm: string, sortBy: string): Promise<PaginatedFeedbackResponseDTO>;
}