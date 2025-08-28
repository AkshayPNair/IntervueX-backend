import express from 'express';
import { InterviewerRepository } from '../../infrastructure/database/repositories/interviewerRepository';
import { UserRepository } from '../../infrastructure/database/repositories/userRepository';
import { SubmitVerificationUseCase } from '../../application/use-cases/interviewer/submitVerificationUseCase';
import { InterviewerController } from '../controllers/interviewer/interviewer.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireInterviewer } from '../middleware/roleMiddleware';
import { uploadFields,handleCombinedUploads } from '../middleware/combinedUpload';
import { GetVerificationStatusUseCase } from '../../application/use-cases/interviewer/getVerificationStatusUseCase';
import { GetInterviewerProfileUseCase } from '../../application/use-cases/interviewer/getInterviewerProfileUseCase';
import { UpdateInterviewerProfileUseCase } from '../../application/use-cases/interviewer/updateInterviewerProfileUseCase';
import { GetInterviewerBookingsUseCase } from '../../application/use-cases/interviewer/getInterviewerBookingsUseCase';
import { SaveSlotRuleUseCase } from '../../application/use-cases/interviewer/saveSlotRuleUseCase';
import { GetSlotRuleUseCase } from '../../application/use-cases/interviewer/getSlotRuleUseCase';
import { SlotRuleRepository } from '../../infrastructure/database/repositories/slotRuleRepository';
import { BookingRepository } from '../../infrastructure/database/repositories/bookingRepository';
import { WalletRepository } from '../../infrastructure/database/repositories/walletRepository';
import { GetWalletSummaryUseCase } from '../../application/use-cases/wallet/getWalletSummaryUseCase';
import { ListWalletTransactionsUseCase } from '../../application/use-cases/wallet/listWalletTransactionsUseCase';


const router= express.Router()
router.use(authenticateToken,requireInterviewer)

const userRepository=new UserRepository()
const interviewerRespository=new InterviewerRepository()
const slotRuleRepository=new SlotRuleRepository()
const bookingRepository=new BookingRepository()
const walletRepository=new WalletRepository()

const submitVerificationUseCase=new SubmitVerificationUseCase(userRepository,interviewerRespository);
const getVerificationStatusUseCase=new GetVerificationStatusUseCase(userRepository,interviewerRespository);
const getInterviewerProfileUseCase=new GetInterviewerProfileUseCase(userRepository,interviewerRespository)
const updateInterviewerProfileUseCase=new UpdateInterviewerProfileUseCase(userRepository,interviewerRespository)
const saveSlotRuleUseCase=new SaveSlotRuleUseCase(slotRuleRepository)
const getSlotRuleUseCase=new GetSlotRuleUseCase(slotRuleRepository)
const getInterviewerBookingsUseCase=new GetInterviewerBookingsUseCase(bookingRepository,userRepository)
const getWalletSummaryUseCase = new GetWalletSummaryUseCase(walletRepository);
const listWalletTransactionsUseCase = new ListWalletTransactionsUseCase(walletRepository);
const interviewerController=new InterviewerController(submitVerificationUseCase,getVerificationStatusUseCase,getInterviewerProfileUseCase,updateInterviewerProfileUseCase,saveSlotRuleUseCase,getSlotRuleUseCase,getInterviewerBookingsUseCase,getWalletSummaryUseCase, listWalletTransactionsUseCase)


router.post('/submit-verification',uploadFields,handleCombinedUploads,(req,res)=>interviewerController.submitVerification(req,res))
router.get('/verification-status',(req,res)=>interviewerController.getVerificationStatus(req,res))

router.get('/profile',(req,res)=>interviewerController.getProfile(req,res))
router.put('/profile',uploadFields,handleCombinedUploads,(req,res)=>interviewerController.updateProfile(req,res))

router.post('/slot-rules',(req,res)=>interviewerController.saveSlotRule(req,res))
router.get('/slot-rules',(req,res)=>interviewerController.getSlotRule(req,res))

router.get('/bookings',(req,res)=>interviewerController.getBookings(req,res))

router.get('/wallet/summary', (req, res) => interviewerController.getSummary(req, res));
router.get('/wallet/transactions', (req, res) => interviewerController.getTransactions(req, res));

export default router 