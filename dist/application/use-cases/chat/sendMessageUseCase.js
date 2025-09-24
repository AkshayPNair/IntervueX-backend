"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendMessageUseCase = void 0;
class SendMessageUseCase {
    constructor(_messageRepository) {
        this._messageRepository = _messageRepository;
    }
    async execute(conversationId, senderId, recipientId, text) {
        return await this._messageRepository.addMessage(conversationId, senderId, recipientId, text);
    }
}
exports.SendMessageUseCase = SendMessageUseCase;
