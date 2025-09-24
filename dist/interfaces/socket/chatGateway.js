"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const conversationRepository_1 = require("../../infrastructure/database/repositories/conversationRepository");
const messageRepository_1 = require("../../infrastructure/database/repositories/messageRepository");
const sendMessageUseCase_1 = require("../../application/use-cases/chat/sendMessageUseCase");
const markConversationReadUseCase_1 = require("../../application/use-cases/chat/markConversationReadUseCase");
class ChatGateway {
    constructor(io) {
        this.io = io;
        this._messageRepository = new messageRepository_1.MessageRepository();
        this._conversationRepository = new conversationRepository_1.ConversationRepository();
        this._sendMessageUseCase = new sendMessageUseCase_1.SendMessageUseCase(this._messageRepository);
        this._markConversationReadUseCase = new markConversationReadUseCase_1.MarkConversationReadUseCase(this._conversationRepository);
    }
    register() {
        this.io.on('connection', (socket) => this.handleConnection(socket));
    }
    handleConnection(socket) {
        // Join a conversation room
        socket.on('chat:join', ({ conversationId }) => {
            if (!conversationId)
                return;
            socket.join(`conv:${conversationId}`);
            socket.emit('chat:joined', { conversationId });
        });
        //leave a conversation room
        socket.on('chat:leave', ({ conversationId }) => {
            if (!conversationId)
                return;
            socket.leave(`conv:${conversationId}`);
            socket.emit('chat:left', { conversationId });
        });
        socket.on('chat:send', async ({ conversationId, senderId, recipientId, text }) => {
            try {
                if (!conversationId || !senderId || !recipientId || !text?.trim())
                    return;
                const saved = await this._sendMessageUseCase.execute(conversationId, senderId, recipientId, text);
                // Broadcast to all members in the conversation room
                this.io.to(`conv:${conversationId}`).emit('chat:new-message', saved);
            }
            catch (error) {
                socket.emit('chat:error', { message: error.message });
            }
        });
        socket.on('chat:typing', ({ conversationId, from }) => {
            if (!conversationId)
                return;
            socket.to(`conv:${conversationId}`).emit('chat:typing', { from });
        });
        socket.on('chat:stop-typing', ({ conversationId, from }) => {
            if (!conversationId)
                return;
            socket.to(`conv:${conversationId}`).emit('chat:stop-typing', { from });
        });
        socket.on('chat:mark-read', async ({ conversationId, recipientId }) => {
            if (!conversationId || !recipientId)
                return;
            try {
                const result = await this._markConversationReadUseCase.execute(conversationId, recipientId);
                // Broadcast to all members in the room that messages are read
                this.io.to(`conv:${conversationId}`).emit('chat:messages-read', result);
            }
            catch (error) {
                socket.emit('chat:error', { message: error.message });
            }
        });
    }
}
exports.ChatGateway = ChatGateway;
