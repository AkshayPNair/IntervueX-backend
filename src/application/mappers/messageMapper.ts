import { Message } from '../../domain/entities/Message';
import { MessageDTO } from '../../domain/dtos/message.dto';

export const toMessageDTO=(message:Message):MessageDTO=>({
    id:message.id!,
    conversationId:message.conversationId,
    senderId:message.senderId,
    recipientId:message.recipientId,
    text:message.text,
    readAt: message.readAt ? message.readAt.toISOString() : null,
    createdAt:(message.createdAt ?? new Date()).toISOString(),
    updatedAt:(message.updatedAt ?? new Date()).toISOString(),
})