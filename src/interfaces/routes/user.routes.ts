import express from 'express';
import { UserRepository } from '../../infrastructure/database/repositories/userRepository';
import { GetUserProfileUseCase } from '../../application/use-cases/user/getUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/updateUserProfileUseCase';
import { GetAllInterviewerUseCase } from '../../application/use-cases/user/getAllInterviewersUseCase';
import { GetInterviewerByIdUseCase } from '../../application/use-cases/user/getInterviewerByIdUseCase';
import { GenerateAvailableSlotsUseCase } from '../../application/use-cases/user/generateAvailableSlotsUseCase';
import { CreateBookingUseCase } from '../../application/use-cases/user/createBookingUseCase';
import { GetUserBookingsUseCase } from '../../application/use-cases/user/getUserBookingsUseCase';
import { CreateRazorpayOrderUseCase } from '../../application/use-cases/user/createRazorpayOrderUseCase';
import { CancelBookingUseCase } from '../../application/use-cases/user/cancelBookingUseCase';
import { GetWalletSummaryUseCase } from '../../application/use-cases/wallet/getWalletSummaryUseCase';
import { ListWalletTransactionsUseCase } from '../../application/use-cases/wallet/listWalletTransactionsUseCase';
import { UserController } from '../controllers/user/user.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireUser } from '../middleware/roleMiddleware';
import { uploadFields, handleCombinedUploads } from '../middleware/combinedUpload';
import { SlotRuleRepository } from '../../infrastructure/database/repositories/slotRuleRepository';
import { BookingRepository } from '../../infrastructure/database/repositories/bookingRepository';
import { WalletRepository } from '../../infrastructure/database/repositories/walletRepository';
import { CompleteBookingUseCase } from '../../application/use-cases/user/completeBookingUseCase';
import { FeedbackRepository } from '../../infrastructure/database/repositories/feedbackRepository';
import { ListUserFeedbacksUseCase } from '../../application/use-cases/user/listUserFeedbacksUseCase';
import { GetUserFeedbackByIdUseCase } from '../../application/use-cases/user/getUserFeedbackByIdUseCase';
import { SubmitInterviewerRatingUseCase } from '../../application/use-cases/user/submitInterviewerRatingUseCase';
import { GetInterviewerRatingByBookingIdUseCase } from '../../application/use-cases/user/getInterviewerRatingByBookingIdUseCase';

const router = express.Router();
router.use(authenticateToken,requireUser);

const userRepository = new UserRepository();
const slotRuleRepository=new SlotRuleRepository();
const bookingRepository = new BookingRepository();
const walletRepository=new WalletRepository();
const feedbackRepository = new FeedbackRepository();

const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const getAllInterviewersUseCase=new GetAllInterviewerUseCase(userRepository);
const getInterviewerByIdUseCase=new GetInterviewerByIdUseCase(userRepository);
const generateAvailableSlotsUseCase=new GenerateAvailableSlotsUseCase(slotRuleRepository,bookingRepository);
const createBookingUseCase = new CreateBookingUseCase(bookingRepository, userRepository, walletRepository);
const getUserBookingsUseCase = new GetUserBookingsUseCase(bookingRepository, userRepository);
const createRazorpayOrderUseCase = new CreateRazorpayOrderUseCase();
const cancelBookingUseCase=new CancelBookingUseCase(bookingRepository,userRepository,walletRepository);
const getWalletSummaryUseCase=new GetWalletSummaryUseCase(walletRepository);
const listWalletTransactionsUseCase=new ListWalletTransactionsUseCase(walletRepository)
const completeBookingUseCase=new CompleteBookingUseCase(bookingRepository)
const listUserFeedbacksUseCase = new ListUserFeedbacksUseCase(feedbackRepository);
const getUserFeedbackByIdUseCase = new GetUserFeedbackByIdUseCase(feedbackRepository);
const submitInterviewerRatingUseCase=new SubmitInterviewerRatingUseCase(feedbackRepository, bookingRepository)
const getInterviewerRatingByBookingIdUseCase=new GetInterviewerRatingByBookingIdUseCase(feedbackRepository)
const userController = new UserController(
    getUserProfileUseCase, 
    updateUserProfileUseCase,
    getAllInterviewersUseCase,
    getInterviewerByIdUseCase,
    generateAvailableSlotsUseCase,
    createBookingUseCase,
    getUserBookingsUseCase,
    createRazorpayOrderUseCase,
    cancelBookingUseCase,
    getWalletSummaryUseCase,
    listWalletTransactionsUseCase,
    completeBookingUseCase,
    listUserFeedbacksUseCase,
    getUserFeedbackByIdUseCase,
    submitInterviewerRatingUseCase,
    getInterviewerRatingByBookingIdUseCase
);

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', uploadFields, handleCombinedUploads, (req, res) => userController.updateProfile(req, res));
router.get('/interviewers',(req,res)=>userController.getAllInterviewers(req,res))
router.get('/interviewers/:id',(req,res)=>userController.getInterviewerById(req,res))
router.get('/book-session/:id',(req,res)=>userController.getAvailableSlots(req,res))
router.post('/bookings',(req,res)=>userController.createBooking(req,res))
router.get('/bookings',(req,res)=>userController.getUserBookings(req,res))
router.post('/razorpay/create-order',(req,res)=>userController.createRazorpayOrder(req,res))
router.post('/bookings/cancel',(req,res)=>userController.cancelBooking(req,res))
router.get('/wallet/summary',(req,res)=>userController.getWalletSummary(req,res))
router.get('/wallet/transactions',(req,res)=>userController.getWalletTransactions(req,res))
router.post('/bookings/complete',(req,res)=> userController.completeBooking(req,res))
router.get('/feedback', (req, res) => userController.listFeedbacks(req, res))
router.get('/feedback/:id', (req, res) => userController.getFeedbackById(req, res))
router.post('/rating',(req,res)=>userController.submitInterviewerRating(req,res))
router.get('/rating/:bookingId',(req,res)=>userController.getInterviewerRatingByBookingId(req,res))
export default router;
