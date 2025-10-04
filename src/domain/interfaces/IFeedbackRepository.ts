import { Document } from "mongoose";
import { IBaseRepository } from "./IBaseRepository";
import { Feedback } from "../entities/Feedback";
import { SubmitFeedbackDTO,SubmitInterviewerFeedbackDTO } from "../dtos/feedback.dto";
import { InterviewerRating } from "../entities/InterviewerRating";

export interface IFeedbackRepository extends IBaseRepository<Document>{
    createFeedback(interviewerId:string,userId:string,data:SubmitFeedbackDTO):Promise<Feedback>
    findByBookingId(bookingId:string):Promise<Feedback | null>
    getFeedbacksByInterviewer(interviewerId: string): Promise<Feedback[]>
    getFeedbackById(id: string): Promise<Feedback | null>
    getFeedbacksByUser(userId: string): Promise<Feedback[]>;
    createInterviewerRating(interviewerId:string,userId:string,data:SubmitInterviewerFeedbackDTO):Promise<InterviewerRating>
    findInterviewerRatingByBookingId(bookingId:string):Promise<InterviewerRating|null>
    getInterviewerRatingsByInterviewer(interviewerId: string): Promise<InterviewerRating[]>
}