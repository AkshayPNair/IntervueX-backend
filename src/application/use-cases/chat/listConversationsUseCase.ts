import { IConversationRepository } from "../../../domain/interfaces/IConversationRepository";
import { ConversationDTO } from "../../../domain/dtos/conversation.dto";
import { IListConversationsService } from "../../../domain/interfaces/IListConversationsService";
import { toConversationDTO } from "../../../application/mappers/conversationMapper";

export class listConversationsUseCase implements IListConversationsService{
    constructor(
        private _conversationRepository:IConversationRepository
    ){}

    async execute(userId: string, role: "user" | "interviewer"): Promise<ConversationDTO[]> {
        const conversations=await this._conversationRepository.listConversations(userId,role)
        return conversations.map(conversation => toConversationDTO(conversation))
    }
}