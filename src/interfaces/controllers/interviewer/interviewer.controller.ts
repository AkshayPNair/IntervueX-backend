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

export class InterviewerController{
    constructor(
        private _submitVerificationUseCase: SubmitVerificationUseCase,
        private _getVerificationStatusUseCase: GetVerificationStatusUseCase,
        private _getInterviewerProfileUseCase: GetInterviewerProfileUseCase,
        private _updateInterviewerProfileUseCase:UpdateInterviewerProfileUseCase
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

}