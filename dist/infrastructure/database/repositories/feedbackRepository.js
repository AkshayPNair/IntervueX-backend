"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const FeedbackModel_1 = require("../models/FeedbackModel");
const InterviewerRatingModel_1 = require("../models/InterviewerRatingModel");
const Feedback_1 = require("../../../domain/entities/Feedback");
const InterviewerRating_1 = require("../../../domain/entities/InterviewerRating");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class FeedbackRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(FeedbackModel_1.FeedbackModel);
    }
    async createFeedback(interviewerId, userId, data) {
        try {
            const feedbackDoc = await this.create({
                bookingId: new mongoose_1.Types.ObjectId(data.bookingId),
                interviewerId: new mongoose_1.Types.ObjectId(interviewerId),
                userId: new mongoose_1.Types.ObjectId(userId),
                overallRating: data.overallRating,
                technicalRating: data.technicalRating,
                communicationRating: data.communicationRating,
                problemSolvingRating: data.problemSolvingRating,
                overallFeedback: data.overallFeedback,
                strengths: data.strengths,
                improvements: data.improvements,
            });
            return new Feedback_1.Feedback(feedbackDoc._id.toString(), feedbackDoc.bookingId.toString(), feedbackDoc.interviewerId.toString(), feedbackDoc.userId.toString(), feedbackDoc.overallRating, feedbackDoc.technicalRating, feedbackDoc.communicationRating, feedbackDoc.problemSolvingRating, feedbackDoc.overallFeedback, feedbackDoc.strengths, feedbackDoc.improvements, feedbackDoc.createdAt);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            if (error.name === 'ValidationError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Feedback already submitted for this booking', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid ID format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to submit feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async findByBookingId(bookingId) {
        try {
            const doc = await this.findById(bookingId);
            if (!doc)
                return null;
            return new Feedback_1.Feedback(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.overallRating, doc.technicalRating, doc.communicationRating, doc.problemSolvingRating, doc.overallFeedback, doc.strengths, doc.improvements, doc.createdAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getFeedbacksByInterviewer(interviewerId) {
        try {
            const docs = await this.findAll({ interviewerId: new mongoose_1.Types.ObjectId(interviewerId) });
            return docs.map((doc) => new Feedback_1.Feedback(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.overallRating, doc.technicalRating, doc.communicationRating, doc.problemSolvingRating, doc.overallFeedback, doc.strengths, doc.improvements, doc.createdAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch interviewer feedbacks', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getFeedbacksByUser(userId) {
        try {
            const docs = await this.findAll({ userId: new mongoose_1.Types.ObjectId(userId) });
            return docs.map((doc) => new Feedback_1.Feedback(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.overallRating, doc.technicalRating, doc.communicationRating, doc.problemSolvingRating, doc.overallFeedback, doc.strengths, doc.improvements, doc.createdAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch user feedbacks', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getFeedbackById(id) {
        try {
            const doc = await this.findById(id);
            if (!doc)
                return null;
            return new Feedback_1.Feedback(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.overallRating, doc.technicalRating, doc.communicationRating, doc.problemSolvingRating, doc.overallFeedback, doc.strengths, doc.improvements, doc.createdAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid feedback ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch feedback', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async createInterviewerRating(interviewerId, userId, data) {
        try {
            const doc = await InterviewerRatingModel_1.InterviewerRatingModel.create({
                bookingId: new mongoose_1.Types.ObjectId(data.bookingId),
                interviewerId: new mongoose_1.Types.ObjectId(interviewerId),
                userId: new mongoose_1.Types.ObjectId(userId),
                rating: data.rating,
                comment: data.comment,
            });
            return new InterviewerRating_1.InterviewerRating(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.rating, doc.comment, doc.createdAt);
        }
        catch (error) {
            if (error.name === 'ValidationError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Rating already submitted for this booking', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid ID format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to submit rating', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async findInterviewerRatingByBookingId(bookingId) {
        try {
            const doc = await InterviewerRatingModel_1.InterviewerRatingModel.findOne({ bookingId: new mongoose_1.Types.ObjectId(bookingId) }).exec();
            if (!doc)
                return null;
            return new InterviewerRating_1.InterviewerRating(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.rating, doc.comment, doc.createdAt);
        }
        catch (error) {
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid booking ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch rating', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getInterviewerRatingsByInterviewer(interviewerId) {
        try {
            const docs = await InterviewerRatingModel_1.InterviewerRatingModel.find({ interviewerId: new mongoose_1.Types.ObjectId(interviewerId) }).exec();
            return docs.map((doc) => new InterviewerRating_1.InterviewerRating(doc._id.toString(), doc.bookingId.toString(), doc.interviewerId.toString(), doc.userId.toString(), doc.rating, doc.comment, doc.createdAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to fetch interviewer ratings', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.FeedbackRepository = FeedbackRepository;
