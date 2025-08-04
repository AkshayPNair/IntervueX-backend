import { Request, Response } from 'express';
import { GetPendingInterviewersUseCase } from '../../../application/use-cases/admin/getPendingInterviewersUseCase';
import { ApproveInterviewerUseCase } from '../../../application/use-cases/admin/approveInterviewerUseCase';
import { RejectInterviewerUseCase } from '../../../application/use-cases/admin/rejectInterviewerUseCase';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { AppError } from '../../../application/error/AppError';

export class AdminInterviewerController {
    constructor(
        private _getPendingInterviewersUseCase: GetPendingInterviewersUseCase,
        private _approveInterviewewUseCase: ApproveInterviewerUseCase,
        private _rejectInterviewerUseCase: RejectInterviewerUseCase
    ) { }

    async getPendingInterviewers(req: Request, res: Response): Promise<void> {
        try {
            const result = await this._getPendingInterviewersUseCase.execute()
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
            const result = await this._approveInterviewewUseCase.execute(id)
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
            const result = await this._rejectInterviewerUseCase.execute(id,rejectedReason);
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