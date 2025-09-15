import { Server, Socket } from 'socket.io';
import { ConversationRepository } from '../../infrastructure/database/repositories/conversationRepository';
import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository';
import { SendMessageUseCase } from '../../application/use-cases/chat/sendMessageUseCase';
import { MarkConversationReadUseCase } from '../../application/use-cases/chat/markConversationReadUseCase';

export class ChatGateway {
    private _messageRepository = new MessageRepository()
    private _conversationRepository = new ConversationRepository()
    private _sendMessageUseCase = new SendMessageUseCase(this._messageRepository)
    private _markConversationReadUseCase = new MarkConversationReadUseCase(this._conversationRepository)

    constructor(private io: Server) { }

    public register() {
        this.io.on('connection', (socket: Socket) => this.handleConnection(socket))
    }

    private handleConnection(socket: Socket) {
        // Join a conversation room
        socket.on('chat:join', ({ conversationId }: { conversationId: string }) => {
            if (!conversationId) return;
            socket.join(`conv:${conversationId}`)
            socket.emit('chat:joined', { conversationId })
        })

        //leave a conversation room
        socket.on('chat:leave', ({ conversationId }: { conversationId: string }) => {
            if (!conversationId) return;
            socket.leave(`conv:${conversationId}`)
            socket.emit('chat:left', { conversationId })
        })

        socket.on(
            'chat:send',
            async ({ conversationId, senderId, recipientId, text }: { conversationId: string; senderId: string; recipientId: string; text: string }) => {
                try {
                    if (!conversationId || !senderId || !recipientId || !text?.trim()) return;
                    const saved = await this._sendMessageUseCase.execute(conversationId, senderId, recipientId, text);
                    // Broadcast to all members in the conversation room
                    this.io.to(`conv:${conversationId}`).emit('chat:new-message', saved);
                } catch (error) {
                    socket.emit('chat:error', { message: (error as Error).message });
                }
            }
        )

        socket.on('chat:typing', ({ conversationId, from }: { conversationId: string, from: string }) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('chat:typing', { from });
        })

        socket.on('chat:stop-typing', ({ conversationId, from }: { conversationId: string; from: string }) => {
            if (!conversationId) return;
            socket.to(`conv:${conversationId}`).emit('chat:stop-typing', { from });
        })

        socket.on(
            'chat:mark-read',
            async ({ conversationId, recipientId }: { conversationId: string; recipientId: string }) => {
                if (!conversationId || !recipientId) return;
        
                try {
                    const result = await this._markConversationReadUseCase.execute(conversationId, recipientId);
                    // Broadcast to all members in the room that messages are read
                    this.io.to(`conv:${conversationId}`).emit('chat:messages-read', result);
                } catch (error) {
                    socket.emit('chat:error', { message: (error as Error).message });
                }
            }
        )    
    }
}