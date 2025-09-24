"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toMessageDTO = void 0;
const toMessageDTO = (message) => ({
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    recipientId: message.recipientId,
    text: message.text,
    readAt: message.readAt ? message.readAt.toISOString() : null,
    createdAt: (message.createdAt ?? new Date()).toISOString(),
    updatedAt: (message.updatedAt ?? new Date()).toISOString(),
});
exports.toMessageDTO = toMessageDTO;
