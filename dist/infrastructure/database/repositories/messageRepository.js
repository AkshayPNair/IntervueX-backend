"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRepository = void 0;
const baseRepository_1 = require("./baseRepository");
const MessageModel_1 = require("../models/MessageModel");
const ConversationModel_1 = require("../models/ConversationModel");
const Message_1 = require("../../../domain/entities/Message");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class MessageRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(MessageModel_1.MessageModel);
    }
    async addMessage(conversationId, senderId, recipientId, text) {
        try {
            const body = (text ?? '').trim();
            if (!body) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Message text cannot be empty', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const msgDoc = await this.create({ conversationId, senderId, recipientId, text: body });
            const convo = await ConversationModel_1.ConversationModel.findById(conversationId);
            if (convo) {
                convo.lastMessage = msgDoc.text;
                if (convo.userId === recipientId) {
                    convo.unreadForUser += 1;
                }
                else if (convo.interviewerId === recipientId) {
                    convo.unreadForInterviewer += 1;
                }
                await convo.save();
            }
            return new Message_1.Message(msgDoc.conversationId, msgDoc.senderId, msgDoc.recipientId, msgDoc.text, msgDoc.readAt, msgDoc._id.toString(), msgDoc.createdAt, msgDoc.updatedAt);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid ID format', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to add message', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async listMessages(conversationId, limit, before) {
        const query = { conversationId };
        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }
        const messages = await MessageModel_1.MessageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit || 50);
        return messages.map((msg) => new Message_1.Message(msg.conversationId, msg.senderId, msg.recipientId, msg.text, msg.readAt, msg._id.toString(), msg.createdAt, msg.updatedAt));
    }
}
exports.MessageRepository = MessageRepository;
