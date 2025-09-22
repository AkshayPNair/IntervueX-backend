import { Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { FeedbackModel, IFeedbackDocument } from "../models/FeedbackModel";
import { IFeedbackRepository } from "../../../domain/interfaces/IFeedbackRepository";
import { InterviewerRatingModel, IInterviewerRatingDocument } from "../models/InterviewerRatingModel";
import { SubmitFeedbackDTO,SubmitInterviewerFeedbackDTO } from "../../../domain/dtos/feedback.dto";
import { Feedback } from "../../../domain/entities/Feedback";
import { InterviewerRating } from "../../../domain/entities/InterviewerRating";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { Type } from "@aws-sdk/client-s3";

export class FeedbackRepository extends BaseRepository<IFeedbackDocument> implements IFeedbackRepository {
    constructor() {
        super(FeedbackModel)
    }

    async createFeedback(interviewerId: string, userId: string, data: SubmitFeedbackDTO): Promise<Feedback> {
        try {
            const feedbackDoc = await this.create({
                bookingId: new Types.ObjectId(data.bookingId),
                interviewerId: new Types.ObjectId(interviewerId),
                userId: new Types.ObjectId(userId),
                overallRating: data.overallRating,
                technicalRating: data.technicalRating,
                communicationRating: data.communicationRating,
                problemSolvingRating: data.problemSolvingRating,
                overallFeedback: data.overallFeedback,
                strengths: data.strengths,
                improvements: data.improvements,
            })

            return new Feedback(
                (feedbackDoc._id as Types.ObjectId).toString(),
                feedbackDoc.bookingId.toString(),
                feedbackDoc.interviewerId.toString(),
                feedbackDoc.userId.toString(),
                feedbackDoc.overallRating,
                feedbackDoc.technicalRating,
                feedbackDoc.communicationRating,
                feedbackDoc.problemSolvingRating,
                feedbackDoc.overallFeedback,
                feedbackDoc.strengths,
                feedbackDoc.improvements,
                feedbackDoc.createdAt,
            );
        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error.name === 'ValidationError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Feedback already submitted for this booking',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid ID format',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to submit feedback',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async findByBookingId(bookingId: string): Promise<Feedback | null> {
        try {
            const doc = await this.findById(bookingId)
            if (!doc) return null
            return new Feedback(
                (doc._id as Types.ObjectId).toString(),
                doc.bookingId.toString(),
                doc.interviewerId.toString(),
                doc.userId.toString(),
                doc.overallRating,
                doc.technicalRating,
                doc.communicationRating,
                doc.problemSolvingRating,
                doc.overallFeedback,
                doc.strengths,
                doc.improvements,
                doc.createdAt,
            )
        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to fetch feedback',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async getFeedbacksByInterviewer(interviewerId: string): Promise<Feedback[]> {
        try {
            const docs = await this.findAll({ interviewerId: new Types.ObjectId(interviewerId) });
            return docs.map((doc) => new Feedback(
                (doc._id as Types.ObjectId).toString(),
                doc.bookingId.toString(),
                doc.interviewerId.toString(),
                doc.userId.toString(),
                doc.overallRating,
                doc.technicalRating,
                doc.communicationRating,
                doc.problemSolvingRating,
                doc.overallFeedback,
                doc.strengths,
                doc.improvements,
                doc.createdAt,
            ));
        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to fetch interviewer feedbacks',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async getFeedbacksByUser(userId:string):Promise<Feedback[]>{
        try {
            const docs=await this.findAll({userId:new Types.ObjectId(userId)})
            return docs.map((doc) => new Feedback(
                (doc._id as Types.ObjectId).toString(),
                doc.bookingId.toString(),
                doc.interviewerId.toString(),
                doc.userId.toString(),
                doc.overallRating,
                doc.technicalRating,
                doc.communicationRating,
                doc.problemSolvingRating,
                doc.overallFeedback,
                doc.strengths,
                doc.improvements,
                doc.createdAt,
              ));
        } catch (error) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to fetch user feedbacks',
                HttpStatusCode.INTERNAL_SERVER
              );
        }
    }

    async getFeedbackById(id: string): Promise<Feedback | null> {
        try {
            const doc = await this.findById(id)
            if (!doc) return null
            return new Feedback(
                (doc._id as Types.ObjectId).toString(),
                doc.bookingId.toString(),
                doc.interviewerId.toString(),
                doc.userId.toString(),
                doc.overallRating,
                doc.technicalRating,
                doc.communicationRating,
                doc.problemSolvingRating,
                doc.overallFeedback,
                doc.strengths,
                doc.improvements,
                doc.createdAt,
            );
        } catch (error: any) {
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid feedback ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to fetch feedback',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }
    async createInterviewerRating(interviewerId:string, userId:string, data:SubmitInterviewerFeedbackDTO):Promise<InterviewerRating>{
        try{
             const doc = await InterviewerRatingModel.create({
        bookingId: new Types.ObjectId(data.bookingId),
        interviewerId: new Types.ObjectId(interviewerId),
        userId: new Types.ObjectId(userId),
        rating: data.rating,
        comment: data.comment,
      })
      return new InterviewerRating(
        (doc._id as Types.ObjectId).toString(),
        doc.bookingId.toString(),
        doc.interviewerId.toString(),
        doc.userId.toString(),
        doc.rating,
        doc.comment,
        doc.createdAt
      )
        }catch(error:any){
            if (error.name === 'ValidationError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Rating already submitted for this booking',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid ID format',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to submit rating',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async findInterviewerRatingByBookingId(bookingId: string): Promise<InterviewerRating | null> {
        try{
            const doc = await InterviewerRatingModel.findOne({ bookingId: new Types.ObjectId(bookingId) }).exec();
      if (!doc) return null;
      return new InterviewerRating(
        (doc._id as Types.ObjectId).toString(),
        doc.bookingId.toString(),
        doc.interviewerId.toString(),
        doc.userId.toString(),
        doc.rating,
        doc.comment,
        doc.createdAt
      )
        }catch(error:any){
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid booking ID',
                    HttpStatusCode.BAD_REQUEST
                );
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to fetch rating',
                HttpStatusCode.INTERNAL_SERVER
            );
        }

    }

}