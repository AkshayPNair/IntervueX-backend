"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkConversationReadUseCase = void 0;
class MarkConversationReadUseCase {
    constructor(_conversationRepository) {
        this._conversationRepository = _conversationRepository;
    }
    async execute(conversationId, userId) {
        await this._conversationRepository.markConversationRead(conversationId, userId);
    }
}
exports.MarkConversationReadUseCase = MarkConversationReadUseCase;
