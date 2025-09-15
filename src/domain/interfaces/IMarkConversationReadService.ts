export interface IMarkConversationReadService {
    execute(conversationId: string, userId: string): Promise<void>;
}