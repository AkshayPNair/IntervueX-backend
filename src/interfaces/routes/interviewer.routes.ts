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

const router= express.Router()
router.use(authenticateToken,requireInterviewer)

const userRepository=new UserRepository()
const interviewerRespository=new InterviewerRepository()
const submitVerificationUseCase=new SubmitVerificationUseCase(userRepository,interviewerRespository);
const getVerificationStatusUseCase=new GetVerificationStatusUseCase(userRepository,interviewerRespository);
const getInterviewerProfileUseCase=new GetInterviewerProfileUseCase(userRepository,interviewerRespository)
const updateInterviewerProfileUseCase=new UpdateInterviewerProfileUseCase(userRepository,interviewerRespository)
const interviewerController=new InterviewerController(submitVerificationUseCase,getVerificationStatusUseCase,getInterviewerProfileUseCase,updateInterviewerProfileUseCase)


router.post('/submit-verification',uploadFields,handleCombinedUploads,(req,res)=>interviewerController.submitVerification(req,res))
router.get('/verification-status',(req,res)=>interviewerController.getVerificationStatus(req,res))
router.get('/profile',(req,res)=>interviewerController.getProfile(req,res))
router.put('/profile',uploadFields,handleCombinedUploads,(req,res)=>interviewerController.updateProfile(req,res))

export default router 