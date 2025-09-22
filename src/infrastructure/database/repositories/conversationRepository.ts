import { Types } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { ConversationModel, IConversationDocument } from "../models/ConversationModel";
import { Conversation } from "../../../domain/entities/Conversation";
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { IConversationRepository } from "../../../domain/interfaces/IConversationRepository";

export class ConversationRepository extends BaseRepository<IConversationDocument> implements IConversationRepository {
    constructor() {
        super(ConversationModel)
    }

    async startOrGetConversation(userId: string, interviewerId: string): Promise<Conversation> {
        try {
            const doc = await ConversationModel.findOneAndUpdate(
                { userId, interviewerId },
                { $setOnInsert: { userId, interviewerId } },
                { upsert: true, new: true }
            )
            return new Conversation(
                doc.userId,
                doc.interviewerId,
                doc.lastMessage ?? '',
                doc.unreadForUser ?? 0,
                doc.unreadForInterviewer ?? 0,
                (doc._id as Types.ObjectId).toString(),
                doc.createdAt,
                doc.updatedAt
            )
        } catch (error: any) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to start or get conversation',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

    async listConversations(userId: string, role: "user" | "interviewer"): Promise<Conversation[]> {
        try {
            const filter = role === "user" ? { userId } : { interviewerId: userId }
            const docs = await ConversationModel.find(filter).sort({ updatedAt: -1 }).exec();
            return docs.map(doc => new Conversation(
                doc.userId,
                doc.interviewerId,
                doc.lastMessage ?? '',
                doc.unreadForUser ?? 0,
                doc.unreadForInterviewer ?? 0,
                (doc._id as Types.ObjectId).toString(),
                doc.createdAt,
                doc.updatedAt
            ));
        } catch (error: any) {
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to list conversations',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

    async markConversationRead(conversationId: string, readerId: string): Promise<void> {
        try {
            const doc = await ConversationModel.findById(conversationId).exec()
            if (!doc) return

            const update: Partial<IConversationDocument> = {}
            if (doc.userId === readerId) {
                update.unreadForUser = 0
            } else if (doc.interviewerId === readerId) {
                update.unreadForInterviewer = 0
            }

            await ConversationModel.findByIdAndUpdate(conversationId, update, {
                new: true,
            }).exec()
        } catch (error: any) {
            if(error?.name === 'CastError'){
                throw new AppError(ErrorCode.VALIDATION_ERROR,'Invalid conversation ID',HttpStatusCode.BAD_REQUEST)
            }
            throw new AppError(ErrorCode.DATABASE_ERROR,'Failed to mark conversation as read',HttpStatusCode.INTERNAL_SERVER)
        }
    }

    async getConversationById(conversationId: string): Promise<Conversation | null> {
        try {
            const doc = await this.findById(conversationId)
            return doc ? new Conversation(
                doc.userId,
                doc.interviewerId,
                doc.lastMessage ?? '',
                doc.unreadForUser ?? 0,
                doc.unreadForInterviewer ?? 0,
                (doc._id as Types.ObjectId).toString(),
                doc.createdAt,
                doc.updatedAt
            ) : null
        } catch (error: any) {
            if (error?.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid conversation ID',
                    HttpStatusCode.BAD_REQUEST
                )
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to get conversation',
                HttpStatusCode.INTERNAL_SERVER
            )
        }
    }

}