export interface MessageDTO {
    id: string;
    conversationId: string;
    senderId: string;
    recipientId: string;
    text: string;
    readAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface SendMessageDTO {
    conversationId: string;
    recipientId: string;
    text: string;
}