import { Feedback } from "../../domain/entities/Feedback";
import { InterviewerRating } from "../../domain/entities/InterviewerRating";
import { FeedbackResponseDTO, InterviewerFeedbackResponseDTO } from "../../domain/dtos/feedback.dto";

export const toFeedbackResponseDTO=(feedback:Feedback):FeedbackResponseDTO=>({
    id:feedback.id,
    bookingId:feedback.bookingId,
    interviewerId:feedback.interviewerId,
    userId:feedback.userId,
    overallRating:feedback.overallRating,
    technicalRating:feedback.technicalRating,
    communicationRating:feedback.communicationRating,
    problemSolvingRating:feedback.problemSolvingRating,
    overallFeedback:feedback.overallFeedback,
    strengths:feedback.strengths,
    improvements:feedback.improvements,
    createdAt:feedback.createdAt
})

export const toInterviewerFeedbackResponseDTO=(rating:InterviewerRating):InterviewerFeedbackResponseDTO=>({
    id:rating.id,
    bookingId:rating.bookingId,
    interviewerId:rating.interviewerId,
    userId:rating.userId,
    rating:rating.rating,
    comment:rating.comment,
    createdAt:rating.createdAt
})
    