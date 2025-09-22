import { IConversationRepository } from "../../../domain/interfaces/IConversationRepository";
import { ConversationDTO } from "../../../domain/dtos/conversation.dto";
import { IListConversationsService } from "../../../domain/interfaces/IListConversationsService";
import { toConversationDTO } from "../../../application/mappers/conversationMapper";
import { IUserRepository } from "../../../domain/interfaces/IUserRepository";

export class listConversationsUseCase implements IListConversationsService{
    constructor(
        private _conversationRepository:IConversationRepository,
        private _userRepository:IUserRepository
    ){}

    async execute(userId: string, role: "user" | "interviewer"): Promise<ConversationDTO[]> {
        const conversations=await this._conversationRepository.listConversations(userId,role)
        const userIds = new Set(conversations.map(c => c.userId))
        const interviewerIds = new Set(conversations.map(c => c.interviewerId))

        const userNameMap = new Map<string, string>()
        const interviewerNameMap = new Map<string, string>()

        await Promise.all([
            ...Array.from(userIds).map(async (id) => {
                try {
                    const u = await this._userRepository.findUserById(id)
                    if (u?.name) userNameMap.set(id, u.name)
                } catch (_) {}
            }),
            ...Array.from(interviewerIds).map(async (id) => {
                try {
                    const u = await this._userRepository.findUserById(id)
                    if (u?.name) interviewerNameMap.set(id, u.name)
                } catch (_) {}
            })
        ])

        return conversations.map(conversation => {
            const dto = toConversationDTO(conversation)
            dto.userName = userNameMap.get(conversation.userId)
            dto.interviewerName = interviewerNameMap.get(conversation.interviewerId)
            return dto
        })
    }
}