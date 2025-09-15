import { IMessageRepository } from "../../../domain/interfaces/IMessageRepository";
import { MessageDTO } from "../../../domain/dtos/message.dto";
import { toMessageDTO } from "../../../application/mappers/messageMapper";
import { IListMessagesService } from "../../../domain/interfaces/IListMessagesService";

export class listMessagesUseCase implements IListMessagesService{
    constructor(private _messageRepository:IMessageRepository){}
    
    async execute(conversationId:string,limit?:number,before?:string):Promise<MessageDTO[]>{
        const messages=await this._messageRepository.listMessages(conversationId,limit,before)
        return messages.map(message=>toMessageDTO(message))
    }
}