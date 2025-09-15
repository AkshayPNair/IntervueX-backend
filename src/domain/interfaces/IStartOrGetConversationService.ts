import { StartConversationDTO } from "../dtos/conversation.dto";

export interface IStartOrGetConversationService{
    execute(userId:string,interviewerId:string):Promise<StartConversationDTO>
}