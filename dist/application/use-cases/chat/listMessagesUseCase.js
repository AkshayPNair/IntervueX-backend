"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMessagesUseCase = void 0;
const messageMapper_1 = require("../../../application/mappers/messageMapper");
class listMessagesUseCase {
    constructor(_messageRepository) {
        this._messageRepository = _messageRepository;
    }
    async execute(conversationId, limit, before) {
        const messages = await this._messageRepository.listMessages(conversationId, limit, before);
        return messages.map(message => (0, messageMapper_1.toMessageDTO)(message));
    }
}
exports.listMessagesUseCase = listMessagesUseCase;
