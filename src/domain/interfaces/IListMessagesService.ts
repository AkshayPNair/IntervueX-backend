import { MessageDTO } from "../dtos/message.dto";

export interface IListMessagesService{
    execute(conversationId:string,limit?:number,before?:string):Promise<MessageDTO[]>
}