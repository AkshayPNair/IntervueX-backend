"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterviewerRating = void 0;
class InterviewerRating {
    constructor(id, bookingId, interviewerId, userId, rating, comment, createdAt = new Date()) {
        this.id = id;
        this.bookingId = bookingId;
        this.interviewerId = interviewerId;
        this.userId = userId;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
}
exports.InterviewerRating = InterviewerRating;
