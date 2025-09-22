import { Types } from 'mongoose';
import { BaseRepository } from './baseRepository';
import { MessageModel, IMessageDocument } from '../models/MessageModel';
import { ConversationModel } from '../models/ConversationModel';
import { Message } from '../../../domain/entities/Message';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { IMessageRepository } from '../../../domain/interfaces/IMessageRepository';


export class MessageRepository extends BaseRepository<IMessageDocument> implements IMessageRepository {
    constructor() {
        super(MessageModel)
    }

    async addMessage(conversationId: string, senderId: string, recipientId: string, text: string): Promise<Message> {
        try {
            const body = (text ?? '').trim()
            if (!body) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Message text cannot be empty',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const msgDoc = await this.create({ conversationId, senderId, recipientId, text: body })

            const convo = await ConversationModel.findById(conversationId)
            if (convo) {
                convo.lastMessage = msgDoc.text
                if (convo.userId === recipientId) {
                    convo.unreadForUser += 1
                } else if (convo.interviewerId === recipientId) {
                    convo.unreadForInterviewer += 1
                }
                await convo.save()
            }

            return new Message(
                msgDoc.conversationId,
                msgDoc.senderId,
                msgDoc.recipientId,
                msgDoc.text,
                msgDoc.readAt,
                (msgDoc._id as Types.ObjectId).toString(),
                msgDoc.createdAt,
                msgDoc.updatedAt
            );


        } catch (error: any) {
            if (error instanceof AppError) {
                throw error;
            }
            if (error.name === 'CastError') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Invalid ID format',
                    HttpStatusCode.BAD_REQUEST
                )
            }
            throw new AppError(
                ErrorCode.DATABASE_ERROR,
                'Failed to add message',
                HttpStatusCode.INTERNAL_SERVER
            );
        }
    }

    async listMessages(conversationId: string, limit?: number, before?: string): Promise<Message[]> {
        const query: { conversationId: string; createdAt?: { $lt: Date } } = { conversationId };

        if (before) {
            query.createdAt = { $lt: new Date(before) };
        }

        const messages = await MessageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit || 50);

        return messages.map((msg) => new Message(
            msg.conversationId,
            msg.senderId,
            msg.recipientId,
            msg.text,
            msg.readAt,
            (msg._id as Types.ObjectId).toString(),
            msg.createdAt,
            msg.updatedAt
        ));
    }
}