"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
class Conversation {
    constructor(userId, interviewerId, lastMessage = '', unreadForUser = 0, unreadForInterviewer = 0, id, createdAt, updatedAt) {
        this.userId = userId;
        this.interviewerId = interviewerId;
        this.lastMessage = lastMessage;
        this.unreadForUser = unreadForUser;
        this.unreadForInterviewer = unreadForInterviewer;
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
exports.Conversation = Conversation;
