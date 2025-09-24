"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listConversationsUseCase = void 0;
const conversationMapper_1 = require("../../../application/mappers/conversationMapper");
class listConversationsUseCase {
    constructor(_conversationRepository, _userRepository) {
        this._conversationRepository = _conversationRepository;
        this._userRepository = _userRepository;
    }
    async execute(userId, role) {
        const conversations = await this._conversationRepository.listConversations(userId, role);
        const userIds = new Set(conversations.map(c => c.userId));
        const interviewerIds = new Set(conversations.map(c => c.interviewerId));
        const userNameMap = new Map();
        const interviewerNameMap = new Map();
        await Promise.all([
            ...Array.from(userIds).map(async (id) => {
                try {
                    const u = await this._userRepository.findUserById(id);
                    if (u?.name)
                        userNameMap.set(id, u.name);
                }
                catch (_) { }
            }),
            ...Array.from(interviewerIds).map(async (id) => {
                try {
                    const u = await this._userRepository.findUserById(id);
                    if (u?.name)
                        interviewerNameMap.set(id, u.name);
                }
                catch (_) { }
            })
        ]);
        return conversations.map(conversation => {
            const dto = (0, conversationMapper_1.toConversationDTO)(conversation);
            dto.userName = userNameMap.get(conversation.userId);
            dto.interviewerName = interviewerNameMap.get(conversation.interviewerId);
            return dto;
        });
    }
}
exports.listConversationsUseCase = listConversationsUseCase;
