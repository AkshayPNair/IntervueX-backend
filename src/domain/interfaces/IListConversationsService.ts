import { ConversationDTO } from "../dtos/conversation.dto";

export interface IListConversationsService{
    execute(userId:string,role:'user'|'interviewer'):Promise<ConversationDTO[]>
}