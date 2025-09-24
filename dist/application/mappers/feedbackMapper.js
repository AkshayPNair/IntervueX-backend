"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInterviewerFeedbackResponseDTO = exports.toFeedbackResponseDTO = void 0;
const toFeedbackResponseDTO = (feedback) => ({
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
    createdAt: feedback.createdAt
});
exports.toFeedbackResponseDTO = toFeedbackResponseDTO;
const toInterviewerFeedbackResponseDTO = (rating) => ({
    id: rating.id,
    bookingId: rating.bookingId,
    interviewerId: rating.interviewerId,
    userId: rating.userId,
    rating: rating.rating,
    comment: rating.comment,
    createdAt: rating.createdAt
});
exports.toInterviewerFeedbackResponseDTO = toInterviewerFeedbackResponseDTO;
