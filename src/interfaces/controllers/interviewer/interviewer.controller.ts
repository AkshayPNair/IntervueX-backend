import { Request, Response } from 'express';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { SubmitVerificationUseCase } from '../../../application/use-cases/interviewer/submitVerificationUseCase';
import { GetVerificationStatusUseCase } from '../../../application/use-cases/interviewer/getVerificationStatusUseCase';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { GetInterviewerProfileUseCase } from '../../../application/use-cases/interviewer/getInterviewerProfileUseCase';
import { UpdateInterviewerProfileUseCase } from '../../../application/use-cases/interviewer/updateInterviewerProfileUseCase';
import { UpdateInterviewerProfileDTO, SignupInterviewerDTO } from '../../../domain/dtos/interviewer.dto';
import { toUpdateInterviewerProfileDTO } from '../../../application/mappers/interviewerMapper';
import { SaveSlotRuleUseCase } from '../../../application/use-cases/interviewer/saveSlotRuleUseCase';
import { GetSlotRuleUseCase } from '../../../application/use-cases/interviewer/getSlotRuleUseCase';
import { SaveSlotRuleDTO } from '../../../domain/dtos/slotRule.dto';

export class InterviewerController{
    constructor(
        private _submitVerificationUseCase: SubmitVerificationUseCase,
        private _getVerificationStatusUseCase: GetVerificationStatusUseCase,
        private _getInterviewerProfileUseCase: GetInterviewerProfileUseCase,
        private _updateInterviewerProfileUseCase:UpdateInterviewerProfileUseCase,
        private _saveSlotRuleUseCase:SaveSlotRuleUseCase,
        private _getSlotRuleUseCase:GetSlotRuleUseCase
    ){}

    async submitVerification(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id
            const files=req.files as {[fieldname:string]: Express.MulterS3.File[]}

            const interviewerData={
                profilePic: files?.profilePic?.[0]?.location||req.body.profilePic,
                jobTitle:req.body.jobTitle,
                yearsOfExperience:parseInt(req.body.yearsOfExperience),
                professionalBio: req.body.professionalBio,
                technicalSkills: Array.isArray(req.body.technicalSkills) 
                    ? req.body.technicalSkills 
                    : JSON.parse(req.body.technicalSkills || '[]'),
                resume: files?.resume?.[0]?.location || req.body.resume,
            }

            const result=await this._submitVerificationUseCase.execute(userId, interviewerData)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if(error instanceof AppError){
                res.status(error.status).json({
                    error:error.message,
                    code:error.code,
                    status:error.status
                })
            }else{
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error:error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status:HttpStatusCode.INTERNAL_SERVER
                })
            }
        }
    }

    async getVerificationStatus(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId=req.user.id
            const result=await this._getVerificationStatusUseCase.execute(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getProfile(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId=req.user.id
            const result=await this._getInterviewerProfileUseCase.execute(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async updateProfile(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId=req.user.id
            const files=req.files as {[fieldName:string]:Express.MulterS3.File[]}

            const rawUpdateData={
                name: req.body.name,
                profilePic: files?.profilePic?.[0]?.location || req.body.profilePic,
                jobTitle: req.body.jobTitle,
                yearsOfExperience: req.body.yearsOfExperience ? parseInt(req.body.yearsOfExperience) : undefined,
                professionalBio: req.body.professionalBio,
                technicalSkills: Array.isArray(req.body.technicalSkills) 
                    ? req.body.technicalSkills 
                    : (req.body.technicalSkills ? JSON.parse(req.body.technicalSkills) : undefined),
                resume: files?.resume?.[0]?.location || req.body.resume,
                hourlyRate: req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : undefined,
            }

            const updateData: UpdateInterviewerProfileDTO = toUpdateInterviewerProfileDTO(rawUpdateData);

            const result = await this._updateInterviewerProfileUseCase.execute(userId, updateData);
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async saveSlotRule(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id;
            const slotRuleData:SaveSlotRuleDTO=req.body;

            const result=await this._saveSlotRuleUseCase.execute(userId,slotRuleData);
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async getSlotRule(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const userId=req.user.id;
            const result=await this._getSlotRuleUseCase.execute(userId)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

}