import { Message } from "../entities/Message";

export interface IMessageRepository {
  addMessage(conversationId: string, senderId: string, recipientId: string, text: string): Promise<Message>;
  listMessages(conversationId: string, limit?: number, before?: string): Promise<Message[]>;
}