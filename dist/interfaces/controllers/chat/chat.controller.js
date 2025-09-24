"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class ChatController {
    constructor(_startOrGetConversationService, _listConversationsService, _listMessagesService, _markConversationReadService, _sendMessageService) {
        this._startOrGetConversationService = _startOrGetConversationService;
        this._listConversationsService = _listConversationsService;
        this._listMessagesService = _listMessagesService;
        this._markConversationReadService = _markConversationReadService;
        this._sendMessageService = _sendMessageService;
    }
    async startOrGetConversation(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const interviewerId = req.body.interviewerId;
            if (!interviewerId) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.BAD_REQUEST, "interviewerId is required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._startOrGetConversationService.execute(userId, interviewerId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async listConversations(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const userId = req.user.id;
            const role = req.user.role;
            const result = await this._listConversationsService.execute(userId, role);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async listMessages(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const conversationId = req.params.conversationId;
            const limit = req.query.limit ? parseInt(req.query.limit, 50) : undefined;
            const before = req.query.before ? req.query.before : undefined;
            const result = await this._listMessagesService.execute(conversationId, limit, before);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async markConversationRead(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const conversationId = req.params.conversationId;
            const userId = req.user.id;
            await this._markConversationReadService.execute(conversationId, userId);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: 'Marked as read' });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async sendMessage(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const conversationId = req.params.conversationId;
            const senderId = req.user.id;
            const recipientId = req.body.recipientId;
            const text = req.body.text;
            if (!recipientId || !text) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.BAD_REQUEST, "recipientId and text are required", HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._sendMessageService.execute(conversationId, senderId, recipientId, text);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
}
exports.ChatController = ChatController;
