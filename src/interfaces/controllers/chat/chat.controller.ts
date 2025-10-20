import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IStartOrGetConversationService } from "../../../domain/interfaces/IStartOrGetConversationService";
import { IListConversationsService } from "../../../domain/interfaces/IListConversationsService";
import { IListMessagesService } from "../../../domain/interfaces/IListMessagesService";
import { IMarkConversationReadService } from "../../../domain/interfaces/IMarkConversationReadService";
import { ISendMessageService } from "../../../domain/interfaces/ISendMessageService";
export class ChatController {
    constructor(
        private _startOrGetConversationService: IStartOrGetConversationService,
        private _listConversationsService: IListConversationsService,
        private _listMessagesService: IListMessagesService,
        private _markConversationReadService: IMarkConversationReadService,
        private _sendMessageService: ISendMessageService
    ) { }

    async startOrGetConversation(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const requesterId = req.user.id
            const role = req.user.role as "user" | "interviewer"
            let userId: string
            let interviewerId: string
            if (role === "user") {
                interviewerId = req.body.interviewerId
                if (!interviewerId) {
                    throw new AppError(
                        ErrorCode.BAD_REQUEST,
                        "interviewerId is required",
                        HttpStatusCode.BAD_REQUEST
                    )
                }
                userId = requesterId
            } else {
                userId = req.body.userId
                if (!userId) {
                    throw new AppError(
                        ErrorCode.BAD_REQUEST,
                        "userId is required",
                        HttpStatusCode.BAD_REQUEST
                    )
                }
                interviewerId = requesterId
            }
            const result = await this._startOrGetConversationService.execute(userId, interviewerId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async listConversations(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId = req.user.id
            const role = req.user.role as "user" | "interviewer";
            const result = await this._listConversationsService.execute(userId, role);
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async listMessages(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const conversationId = req.params.conversationId
            const limit = req.query.limit ? parseInt(req.query.limit as string, 50) : undefined
            const before = req.query.before ? req.query.before as string : undefined

            const result = await this._listMessagesService.execute(conversationId, limit, before)
            res.status(HttpStatusCode.OK).json(result)

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async markConversationRead(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const conversationId = req.params.conversationId
            const userId = req.user.id

            await this._markConversationReadService.execute(conversationId, userId)
            res.status(HttpStatusCode.OK).json({ message: 'Marked as read' });

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

    async sendMessage(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const conversationId = req.params.conversationId
            const senderId = req.user.id
            const recipientId = req.body.recipientId
            const text = req.body.text

            if (!recipientId || !text) {
                throw new AppError(
                    ErrorCode.BAD_REQUEST,
                    "recipientId and text are required",
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const result = await this._sendMessageService.execute(conversationId, senderId, recipientId, text)
            res.status(HttpStatusCode.OK).json(result)

        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }

}