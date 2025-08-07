import { Request, Response } from 'express';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { AppError } from '../../../application/error/AppError';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { GetUserProfileUseCase } from '../../../application/use-cases/user/getUserProfileUseCase';
import { GetAllInterviewerUseCase } from '../../../application/use-cases/user/getAllInterviewersUseCase';
import { GetInterviewerByIdUseCase } from '../../../application/use-cases/user/getInterviewerByIdUseCase';
import { UpdateUserProfileUseCase } from '../../../application/use-cases/user/updateUserProfileUseCase';
import { UpdateUserProfileDTO } from '../../../domain/dtos/user.dto';
import { toUpdateUserProfileDTO } from '../../../application/mappers/userMapper';



export class UserController {
    constructor(
        private _getUserProfileUseCase:GetUserProfileUseCase,
        private _updateUserProfileUseCase:UpdateUserProfileUseCase,
        private _getAllInterviewersUseCase:GetAllInterviewerUseCase,
        private _getInterviewerByIdUseCase:GetInterviewerByIdUseCase
    ) { }

    async getProfile(req: AuthenticatedRequest, res: Response){
        try {
           
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            
            const userId=req.user.id
            const result=await this._getUserProfileUseCase.execute(userId)
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

            const rawUpdateData = {
                name: req.body.name,
                profilePicture: req.body.profilePic || req.body.profilePicture,
               resume: req.body.resume || req.body.resumeUrl,
                skills: Array.isArray(req.body.skills) 
                    ? req.body.skills 
                    : (req.body.skills ? JSON.parse(req.body.skills) : undefined),
            };

            const updateData: UpdateUserProfileDTO = toUpdateUserProfileDTO(rawUpdateData);

            const result = await this._updateUserProfileUseCase.execute(userId, updateData);
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

    async getAllInterviewers(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    'User not authenticated',
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const result=await this._getAllInterviewersUseCase.execute()
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

    async getInterviewerById(req:AuthenticatedRequest,res:Response){
        try {
            if(!req.user){
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }

            const {id}=req.params
            if(!id){
                throw new AppError(
                    ErrorCode.BAD_REQUEST,
                    'Interviewer ID is required',
                    HttpStatusCode.BAD_REQUEST
                )
            }

            const result=await this._getInterviewerByIdUseCase.execute(id)
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