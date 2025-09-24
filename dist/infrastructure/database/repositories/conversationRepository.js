"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationRepository = void 0;
const baseRepository_1 = require("./baseRepository");
const ConversationModel_1 = require("../models/ConversationModel");
const Conversation_1 = require("../../../domain/entities/Conversation");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ConversationRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(ConversationModel_1.ConversationModel);
    }
    async startOrGetConversation(userId, interviewerId) {
        try {
            const doc = await ConversationModel_1.ConversationModel.findOneAndUpdate({ userId, interviewerId }, { $setOnInsert: { userId, interviewerId } }, { upsert: true, new: true });
            return new Conversation_1.Conversation(doc.userId, doc.interviewerId, doc.lastMessage ?? '', doc.unreadForUser ?? 0, doc.unreadForInterviewer ?? 0, doc._id.toString(), doc.createdAt, doc.updatedAt);
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to start or get conversation', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async listConversations(userId, role) {
        try {
            const filter = role === "user" ? { userId } : { interviewerId: userId };
            const docs = await ConversationModel_1.ConversationModel.find(filter).sort({ updatedAt: -1 }).exec();
            return docs.map(doc => new Conversation_1.Conversation(doc.userId, doc.interviewerId, doc.lastMessage ?? '', doc.unreadForUser ?? 0, doc.unreadForInterviewer ?? 0, doc._id.toString(), doc.createdAt, doc.updatedAt));
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to list conversations', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async markConversationRead(conversationId, readerId) {
        try {
            const doc = await ConversationModel_1.ConversationModel.findById(conversationId).exec();
            if (!doc)
                return;
            const update = {};
            if (doc.userId === readerId) {
                update.unreadForUser = 0;
            }
            else if (doc.interviewerId === readerId) {
                update.unreadForInterviewer = 0;
            }
            await ConversationModel_1.ConversationModel.findByIdAndUpdate(conversationId, update, {
                new: true,
            }).exec();
        }
        catch (error) {
            if (error?.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid conversation ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to mark conversation as read', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
    async getConversationById(conversationId) {
        try {
            const doc = await this.findById(conversationId);
            return doc ? new Conversation_1.Conversation(doc.userId, doc.interviewerId, doc.lastMessage ?? '', doc.unreadForUser ?? 0, doc.unreadForInterviewer ?? 0, doc._id.toString(), doc.createdAt, doc.updatedAt) : null;
        }
        catch (error) {
            if (error?.name === 'CastError') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid conversation ID', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.DATABASE_ERROR, 'Failed to get conversation', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.ConversationRepository = ConversationRepository;
