import { IMessageRepository } from "../../../domain/interfaces/IMessageRepository";
import {  SendMessageDTO } from "../../../domain/dtos/message.dto";
import { ISendMessageService } from "../../../domain/interfaces/ISendMessageService";

export class SendMessageUseCase implements ISendMessageService{
    constructor(private _messageRepository: IMessageRepository) { }

    async execute(conversationId: string,senderId: string,recipientId: string,text: string):Promise<SendMessageDTO>{
        return await this._messageRepository.addMessage(conversationId,senderId,recipientId,text)
    }
    
}