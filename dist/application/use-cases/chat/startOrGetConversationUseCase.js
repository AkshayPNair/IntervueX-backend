"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartOrGetConversationUseCase = void 0;
class StartOrGetConversationUseCase {
    constructor(_conversationRepository) {
        this._conversationRepository = _conversationRepository;
    }
    async execute(userId, interviewerId) {
        return this._conversationRepository.startOrGetConversation(userId, interviewerId);
    }
}
exports.StartOrGetConversationUseCase = StartOrGetConversationUseCase;
