import { Conversation } from "../entities/Conversation";

export interface IConversationRepository {
  startOrGetConversation(userId: string, interviewerId: string): Promise<Conversation>;
  listConversations(userId: string, role: 'user' | 'interviewer'): Promise<Conversation[]>;
  markConversationRead(conversationId: string, readerId: string): Promise<void>;
  getConversationById(conversationId: string): Promise<Conversation | null>;
}