import { SendMessageDTO } from "../dtos/message.dto";

export interface ISendMessageService {
    execute(conversationId: string, senderId: string, recipientId: string, text: string): Promise<SendMessageDTO>;
}