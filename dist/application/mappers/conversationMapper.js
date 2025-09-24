"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toConversationDTO = void 0;
const toConversationDTO = (conversation) => ({
    id: conversation.id,
    userId: conversation.userId,
    interviewerId: conversation.interviewerId,
    lastMessage: conversation.lastMessage || '',
    unreadForUser: conversation.unreadForUser,
    unreadForInterviewer: conversation.unreadForInterviewer,
    createdAt: (conversation.createdAt ?? new Date()).toISOString(),
    updatedAt: (conversation.updatedAt ?? new Date()).toISOString(),
});
exports.toConversationDTO = toConversationDTO;
