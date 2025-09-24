"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const conversationRepository_1 = require("../../infrastructure/database/repositories/conversationRepository");
const messageRepository_1 = require("../../infrastructure/database/repositories/messageRepository");
const startOrGetConversationUseCase_1 = require("../../application/use-cases/chat/startOrGetConversationUseCase");
const listConversationsUseCase_1 = require("../../application/use-cases/chat/listConversationsUseCase");
const listMessagesUseCase_1 = require("../../application/use-cases/chat/listMessagesUseCase");
const markConversationReadUseCase_1 = require("../../application/use-cases/chat/markConversationReadUseCase");
const sendMessageUseCase_1 = require("../../application/use-cases/chat/sendMessageUseCase");
const chat_controller_1 = require("../controllers/chat/chat.controller");
const userRepository_1 = require("../../infrastructure/database/repositories/userRepository");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticateToken);
const conversationRepository = new conversationRepository_1.ConversationRepository();
const messageRepository = new messageRepository_1.MessageRepository();
const userRepository = new userRepository_1.UserRepository();
const startOrGetConversationUseCase = new startOrGetConversationUseCase_1.StartOrGetConversationUseCase(conversationRepository);
const listConversationsUsecase = new listConversationsUseCase_1.listConversationsUseCase(conversationRepository, userRepository);
const listMessagesUsecase = new listMessagesUseCase_1.listMessagesUseCase(messageRepository);
const markConversationReadUseCase = new markConversationReadUseCase_1.MarkConversationReadUseCase(conversationRepository);
const sendMessageUseCase = new sendMessageUseCase_1.SendMessageUseCase(messageRepository);
const chatController = new chat_controller_1.ChatController(startOrGetConversationUseCase, listConversationsUsecase, listMessagesUsecase, markConversationReadUseCase, sendMessageUseCase);
// conversation routes
router.post('/conversation', (req, res) => chatController.startOrGetConversation(req, res));
router.get('/conversations', (req, res) => chatController.listConversations(req, res));
router.patch('/:conversationId/read', (req, res) => chatController.markConversationRead(req, res));
// message routes
router.get('/:conversationId/messages', (req, res) => chatController.listMessages(req, res));
router.post('/:conversationId/messages', (req, res) => chatController.sendMessage(req, res));
exports.default = router;
