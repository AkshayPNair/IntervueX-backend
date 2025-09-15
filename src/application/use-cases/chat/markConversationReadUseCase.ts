import { IConversationRepository } from "../../../domain/interfaces/IConversationRepository";

export class MarkConversationReadUseCase {
    constructor(private _conversationRepository:IConversationRepository){}
    
    async execute(conversationId:string,userId:string):Promise<void>{
        await this._conversationRepository.markConversationRead(conversationId,userId)
    }
}