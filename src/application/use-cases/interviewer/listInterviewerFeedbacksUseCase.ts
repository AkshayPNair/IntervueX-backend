import { IListInterviewerFeedbacksService } from "../../../domain/interfaces/IListInterviewerFeedbacksService";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";


export class ListInterviewerFeedbacksUseCase implements IListInterviewerFeedbacksService {
    constructor(private _feedbackRepository: IFeedbackRepository) { }

    async execute(interviewerId: string, page: number, limit: number, searchTerm: string, sortBy: string) {
       try {
           const { feedbacks, total } = await this._feedbackRepository.getPaginatedFeedbacksByInterviewer(
               interviewerId, page, limit, searchTerm, sortBy
           );
           const totalPages = Math.ceil(total / limit);

           const responseData = feedbacks.map(feedback => ({
               id: feedback.id,
               bookingId: feedback.bookingId,
               interviewerId: feedback.interviewerId,
               userId: feedback.userId,
               overallRating: feedback.overallRating,
               technicalRating: feedback.technicalRating,
               communicationRating: feedback.communicationRating,
               problemSolvingRating: feedback.problemSolvingRating,
               overallFeedback: feedback.overallFeedback,
               strengths: feedback.strengths,
               improvements: feedback.improvements,
               createdAt: feedback.createdAt,
           }));

           return {
               data: responseData,
               pagination: {
                   currentPage: page,
                   totalPages,
                   totalItems: total,
                   limit,
               }
           };
       } catch (error) {
           if (error instanceof AppError) {
               throw error;
           }
           throw new AppError(ErrorCode.INTERNAL_ERROR, 'Failed to get feedbacks', HttpStatusCode.INTERNAL_SERVER);
       }
   }

}