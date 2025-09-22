import { Conversation } from '../../domain/entities/Conversation';
import { ConversationDTO } from '../../domain/dtos/conversation.dto';

export const toConversationDTO=(conversation:Conversation):ConversationDTO=>({
    id:conversation.id!,
    userId:conversation.userId,
    interviewerId:conversation.interviewerId,
    lastMessage:conversation.lastMessage || '',
    unreadForUser:conversation.unreadForUser,
    unreadForInterviewer:conversation.unreadForInterviewer,
    createdAt:(conversation.createdAt ?? new Date()).toISOString(),
    updatedAt:(conversation.updatedAt ?? new Date()).toISOString(),
})