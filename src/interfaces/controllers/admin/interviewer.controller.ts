import { Request, Response } from 'express';
import { IGetPendingInterviewersService } from '../../../domain/interfaces/IGetPendingInterviewersService';
import { IApproveInterviewerService } from '../../../domain/interfaces/IApproveInterviewerService';
import { IRejectInterviewerService } from '../../../domain/interfaces/IRejectInterviewerService';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { AppError } from '../../../application/error/AppError';

export class AdminInterviewerController {
    constructor(
        private _getPendingInterviewersService: IGetPendingInterviewersService,
        private _approveInterviewerService: IApproveInterviewerService,
        private _rejectInterviewerService: IRejectInterviewerService
    ) { }

    async getPendingInterviewers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this._getPendingInterviewersService.execute()
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

    async approveInterviewer(req: Request, res: Response): Promise<void> {
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

    async rejectInterviewer(req: Request, res: Response): Promise<void> {
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

}