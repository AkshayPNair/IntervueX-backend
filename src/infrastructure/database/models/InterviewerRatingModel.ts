import mongoose, { Schema, Document, Types } from "mongoose";

export interface IInterviewerRatingDocument extends Document {
    bookingId: Types.ObjectId;
    interviewerId: Types.ObjectId;
    userId: Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InterviewerRatingSchema = new Schema<IInterviewerRatingDocument>(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            index: true,
        },
        interviewerId: {
            type: Schema.Types.ObjectId,
            ref: "Interviewer",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        comment: {
            type: String
        },
    },
    {
        timestamps: true,
        collection: "interviewer_ratings"
    }
)

InterviewerRatingSchema.index({ bookingId: 1, userId: 1 }, { unique: true })


export const InterviewerRatingModel = mongoose.model<IInterviewerRatingDocument>("InterviewerRating",InterviewerRatingSchema)