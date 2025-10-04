import { InterviewerRating } from "../entities/InterviewerRating";

export interface IListInterviewerRatingsService {
    execute(interviewerId: string): Promise<InterviewerRating[]>
}