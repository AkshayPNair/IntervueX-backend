import express from "express";
import { UserRepository } from "../../infrastructure/database/repositories/userRepository";
import { InterviewerRepository } from "../../infrastructure/database/repositories/interviewerRepository";
import { GetAllUsersUseCase } from "../../application/use-cases/admin/getAllUsersUseCase";
import { AdminUserController } from "../controllers/admin/user.controller";
import { AdminInterviewerController } from "../controllers/admin/interviewer.controller";
import { requireAdmin } from "../middleware/roleMiddleware";
import { authenticateToken } from "../middleware/authMiddleware";
import { BlockUserUseCase } from "../../application/use-cases/admin/blockUserUseCase";
import { UnblockUserUseCase } from "../../application/use-cases/admin/unblockUserUseCase";
import { GetPendingInterviewersUseCase } from "../../application/use-cases/admin/getPendingInterviewersUseCase";
import { ApproveInterviewerUseCase } from "../../application/use-cases/admin/approveInterviewerUseCase";
import { RejectInterviewerUseCase } from "../../application/use-cases/admin/rejectInterviewerUseCase";
import { EmailService } from "../../infrastructure/external/services/emailService";
import { WalletRepository } from "../../infrastructure/database/repositories/walletRepository";
import { GetWalletSummaryUseCase } from "../../application/use-cases/wallet/getWalletSummaryUseCase";
import { ListWalletTransactionsUseCase } from "../../application/use-cases/wallet/listWalletTransactionsUseCase";
import { AdminWalletController } from "../controllers/admin/wallet.controller";

const router = express.Router();
router.use(authenticateToken)
router.use(requireAdmin)

const userRepository = new UserRepository();
const interviewerRepository=new InterviewerRepository();
const emailService=new EmailService();
const walletRepository = new WalletRepository();

const getAllUsersUseCase = new GetAllUsersUseCase(userRepository);
const blockUserUseCase = new BlockUserUseCase(userRepository);
const unblockUserUseCase = new UnblockUserUseCase(userRepository);
const adminUserController = new AdminUserController(getAllUsersUseCase, blockUserUseCase, unblockUserUseCase);

const getPendingInterviewersUseCase = new GetPendingInterviewersUseCase(userRepository, interviewerRepository);
const approveInterviewerUseCase = new ApproveInterviewerUseCase(userRepository,emailService);
const rejectInterviewerUseCase = new RejectInterviewerUseCase(userRepository,emailService);
const adminInterviewerController = new AdminInterviewerController(
  getPendingInterviewersUseCase,
  approveInterviewerUseCase,
  rejectInterviewerUseCase
);

const getWalletSummaryUseCase = new GetWalletSummaryUseCase(walletRepository);
const listWalletTransactionsUseCase = new ListWalletTransactionsUseCase(walletRepository);
const adminWalletController = new AdminWalletController(getWalletSummaryUseCase, listWalletTransactionsUseCase);



router.get('/users', (req, res) => adminUserController.getAllUsers(req, res));
router.patch('/block/:id', (req, res) => adminUserController.blockUser(req, res));
router.patch('/unblock/:id', (req, res) => adminUserController.unblockUser(req, res));

router.get('/interviewer/pending',(req,res)=>adminInterviewerController.getPendingInterviewers(req,res))
router.patch('/interviewer/approve/:id',(req,res)=>adminInterviewerController.approveInterviewer(req,res))
router.patch('/interviewer/reject/:id',(req,res)=>adminInterviewerController.rejectInterviewer(req,res))

router.get('/wallet/summary', (req, res) => adminWalletController.getSummary(req, res));
router.get('/wallet/transactions', (req, res) => adminWalletController.getTransactions(req, res));

export default router;