import { Request, Response } from 'express';
import { AppError } from '../../../application/error/AppError';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ISubmitVerificationService } from '../../../domain/interfaces/ISubmitVerificationService';
import { IGetVerificationStatusService } from '../../../domain/interfaces/IGetVerificationStatusService';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { IGetInterviewerProfileService } from '../../../domain/interfaces/IGetInterviewerProfileService';
import { IUpdateInterviewerProfileService } from '../../../domain/interfaces/IUpdateInterviewerProfileService';
import { IGetInterviewerBookingsService } from '../../../domain/interfaces/IGetInterviewerBookingsService';
import { UpdateInterviewerProfileDTO, SignupInterviewerDTO } from '../../../domain/dtos/interviewer.dto';
import { toUpdateInterviewerProfileDTO } from '../../../application/mappers/interviewerMapper';
import { ISaveSlotRuleService } from '../../../domain/interfaces/ISaveSlotRuleService';
import { IGetSlotRuleService } from '../../../domain/interfaces/IGetSlotRuleService';
import { SaveSlotRuleDTO } from '../../../domain/dtos/slotRule.dto';
import { IGetWalletSummaryService } from '../../../domain/interfaces/IGetWalletSummaryService';
import { IListWalletTransactionsService } from '../../../domain/interfaces/IListWalletTransactionsService';

export class InterviewerController{
    constructor(
        private _submitVerificationService: ISubmitVerificationService,
        private _getVerificationStatusService: IGetVerificationStatusService,
        private _getInterviewerProfileService: IGetInterviewerProfileService,
        private _updateInterviewerProfileService: IUpdateInterviewerProfileService,
        private _saveSlotRuleService: ISaveSlotRuleService,
        private _getSlotRuleService: IGetSlotRuleService,
        private _getInterviewerBookingsService: IGetInterviewerBookingsService,
        private _getWalletSummaryService: IGetWalletSummaryService,
        private _listWalletTransactionsService: IListWalletTransactionsService
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

            const result=await this._submitVerificationService.execute(userId, interviewerData)
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
            const result=await this._getVerificationStatusService.execute(userId)
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
            const result=await this._getInterviewerProfileService.execute(userId)
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

            const result = await this._updateInterviewerProfileService.execute(userId, updateData);
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

            const result=await this._saveSlotRuleService.execute(userId,slotRuleData);
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
            const result=await this._getSlotRuleService.execute(userId)
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

    async getBookings(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                 throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                );
            }

            const userId=req.user.id;
            const result=await this._getInterviewerBookingsService.execute(userId)
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

    async getSummary(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId=req.user.id
            const role="interviewer"
            const data=await this._getWalletSummaryService.execute(userId,role)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ 
                    error: error.message, 
                    code: error.code, 
                    status: error.status });
              } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                  error: error instanceof Error ? error.message : "An unexpected error occurred",
                  code: ErrorCode.UNKNOWN_ERROR,
                  status: HttpStatusCode.INTERNAL_SERVER,
                });
              }
        }
    }

    async getTransactions(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const userId=req.user.id
            const role="interviewer"
            const data=await this._listWalletTransactionsService.execute(userId,role)
            res.status(HttpStatusCode.OK).json(data)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
              } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                  error: error instanceof Error ? error.message : "An unexpected error occurred",
                  code: ErrorCode.UNKNOWN_ERROR,
                  status: HttpStatusCode.INTERNAL_SERVER,
                });
              }
        }
    }

}