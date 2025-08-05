import express from 'express';
import { UserRepository } from '../../infrastructure/database/repositories/userRepository';
import { GetUserProfileUseCase } from '../../application/use-cases/user/getUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../application/use-cases/user/updateUserProfileUseCase';
import { GetAllInterviewerUseCase } from '../../application/use-cases/user/getAllInterviewersUseCase';
import { GetInterviewerByIdUseCase } from '../../application/use-cases/user/getInterviewerByIdUseCase';
import { UserController } from '../controllers/user/user.controller';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireUser } from '../middleware/roleMiddleware';
import { uploadFields, handleCombinedUploads } from '../middleware/combinedUpload';

const router = express.Router();
router.use(authenticateToken,requireUser);

const userRepository = new UserRepository();
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
const updateUserProfileUseCase = new UpdateUserProfileUseCase(userRepository);
const getAllInterviewersUseCase=new GetAllInterviewerUseCase(userRepository)
const getInterviewerByIdUseCase=new GetInterviewerByIdUseCase(userRepository)
const userController = new UserController(getUserProfileUseCase, updateUserProfileUseCase,getAllInterviewersUseCase,getInterviewerByIdUseCase);

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', uploadFields, handleCombinedUploads, (req, res) => userController.updateProfile(req, res));
router.get('/interviewers',(req,res)=>userController.getAllInterviewers(req,res))
router.get('/interviewers/:id',(req,res)=>userController.getInterviewerById(req,res))

export default router;
