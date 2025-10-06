import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { IListAdminSessionsService } from "../../../domain/interfaces/IListAdminSessionsService";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";

export class AdminSessionController{
    constructor(private _ListAdminSessionsService:IListAdminSessionsService){}

    async listSessions(req:AuthenticatedRequest,res:Response){
        try {
            const searchQuery = req.query.search as string | undefined;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
            const result = await this._ListAdminSessionsService.execute(searchQuery, page, pageSize);
            res.status(HttpStatusCode.OK).json(result);
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
}