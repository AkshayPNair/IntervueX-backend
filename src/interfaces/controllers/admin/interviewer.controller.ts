import {  Response } from 'express';
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { IGetPendingInterviewersService } from '../../../domain/interfaces/IGetPendingInterviewersService';
import { IApproveInterviewerService } from '../../../domain/interfaces/IApproveInterviewerService';
import { IRejectInterviewerService } from '../../../domain/interfaces/IRejectInterviewerService';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { IGetInterviewerResumeUrlService } from '../../../domain/interfaces/IGetInterviewerResumeUrlService';
import { AppError } from '../../../application/error/AppError';

export class AdminInterviewerController {
    constructor(
        private _getPendingInterviewersService: IGetPendingInterviewersService,
        private _approveInterviewerService: IApproveInterviewerService,
        private _rejectInterviewerService: IRejectInterviewerService,
        private _getInterviewerResumeUrlService: IGetInterviewerResumeUrlService,
    ) { }

    async getPendingInterviewers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const searchQuery = req.query.search as string | undefined;
            const result = await this._getPendingInterviewersService.execute(searchQuery)
            res.status(HttpStatusCode.OK).json(result)
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                })
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async approveInterviewer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const result = await this._approveInterviewerService.execute(id)
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
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }

    async rejectInterviewer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const {rejectedReason}=req.body;
            const result = await this._rejectInterviewerService.execute(id,rejectedReason);
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
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    
    async getResumeUrl(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const signedUrl = await this._getInterviewerResumeUrlService.execute(userId);
            res.status(HttpStatusCode.OK).json({ url: signedUrl });
        } catch (error) {
            if (error instanceof AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            } else {
                res.status(HttpStatusCode.INTERNAL_SERVER).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }


}