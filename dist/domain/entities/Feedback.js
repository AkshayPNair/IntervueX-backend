"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Feedback = void 0;
class Feedback {
    constructor(id, bookingId, interviewerId, userId, overallRating, technicalRating, communicationRating, problemSolvingRating, overallFeedback, strengths, improvements, createdAt = new Date()) {
        this.id = id;
        this.bookingId = bookingId;
        this.interviewerId = interviewerId;
        this.userId = userId;
        this.overallRating = overallRating;
        this.technicalRating = technicalRating;
        this.communicationRating = communicationRating;
        this.problemSolvingRating = problemSolvingRating;
        this.overallFeedback = overallFeedback;
        this.strengths = strengths;
        this.improvements = improvements;
        this.createdAt = createdAt;
    }
}
exports.Feedback = Feedback;
