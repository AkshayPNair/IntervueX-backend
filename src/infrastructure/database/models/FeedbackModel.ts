import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFeedbackDocument extends Document {
    bookingId: Types.ObjectId;
    interviewerId: Types.ObjectId;
    userId: Types.ObjectId;
    overallRating: number;
    technicalRating: number;
    communicationRating: number;
    problemSolvingRating: number;
    overallFeedback?: string;
    strengths?: string;
    improvements?: string;
    createdAt: Date;
    updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedbackDocument>({
    bookingId: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true
    },
    interviewerId: {
        type: Schema.Types.ObjectId,
        ref: 'Interviewer',
        required: true,
        index: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    overallRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    technicalRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    communicationRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    problemSolvingRating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    overallFeedback: {
        type: String
    },
    strengths: {
        type: String
    },
    improvements: {
        type: String
    },
}, {
    timestamps: true,
    collection: 'feedbacks'
})

FeedbackSchema.index({ bookingId: 1 }, { unique: true })

export const FeedbackModel = mongoose.model<IFeedbackDocument>("Feedback", FeedbackSchema)