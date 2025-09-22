import express from 'express'
import { authenticateToken } from '../middleware/authMiddleware'
import { ConversationRepository } from '../../infrastructure/database/repositories/conversationRepository'
import { MessageRepository } from '../../infrastructure/database/repositories/messageRepository'
import { StartOrGetConversationUseCase } from '../../application/use-cases/chat/startOrGetConversationUseCase'
import { listConversationsUseCase } from '../../application/use-cases/chat/listConversationsUseCase'
import { listMessagesUseCase } from '../../application/use-cases/chat/listMessagesUseCase'
import { MarkConversationReadUseCase } from '../../application/use-cases/chat/markConversationReadUseCase'
import { SendMessageUseCase } from '../../application/use-cases/chat/sendMessageUseCase'
import { ChatController } from '../controllers/chat/chat.controller'
import { UserRepository } from '../../infrastructure/database/repositories/userRepository'

const router= express.Router()
router.use(authenticateToken)

const conversationRepository=new ConversationRepository()
const messageRepository=new MessageRepository()
const userRepository=new UserRepository()

const startOrGetConversationUseCase=new StartOrGetConversationUseCase(conversationRepository)
const listConversationsUsecase=new listConversationsUseCase(conversationRepository,userRepository)
const listMessagesUsecase=new listMessagesUseCase(messageRepository)
const markConversationReadUseCase=new MarkConversationReadUseCase(conversationRepository)
const sendMessageUseCase=new SendMessageUseCase(messageRepository)

const chatController=new ChatController(
    startOrGetConversationUseCase,
    listConversationsUsecase,
    listMessagesUsecase,
    markConversationReadUseCase,
    sendMessageUseCase
)

// conversation routes
router.post('/conversation', (req, res) => chatController.startOrGetConversation(req, res))
router.get('/conversations', (req, res) => chatController.listConversations(req, res))
router.patch('/:conversationId/read', (req, res) => chatController.markConversationRead(req, res))

// message routes
router.get('/:conversationId/messages', (req, res) => chatController.listMessages(req, res))
router.post('/:conversationId/messages', (req, res) => chatController.sendMessage(req, res))

export default router