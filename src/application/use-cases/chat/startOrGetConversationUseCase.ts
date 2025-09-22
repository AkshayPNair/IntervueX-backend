import { IConversationRepository } from "../../../domain/interfaces/IConversationRepository";
import { StartConversationDTO } from "../../../domain/dtos/conversation.dto";
import { IStartOrGetConversationService } from "@/domain/interfaces/IStartOrGetConversationService";

export class StartOrGetConversationUseCase implements IStartOrGetConversationService{
    constructor(private _conversationRepository: IConversationRepository) { }
    async execute(userId: string, interviewerId: string): Promise<StartConversationDTO> {
        return this._conversationRepository.startOrGetConversation(userId, interviewerId);
    }
}