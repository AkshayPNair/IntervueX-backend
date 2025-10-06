import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IGetWalletSummaryService } from "../../../domain/interfaces/IGetWalletSummaryService";
import { IListWalletTransactionsService } from "../../../domain/interfaces/IListWalletTransactionsService";

export class AdminWalletController {
    constructor(
        private _getWalletSummaryService: IGetWalletSummaryService,
        private _listWalletTransactionsService: IListWalletTransactionsService
    ) { }

    async getSummary(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const adminId = req.user.id
            const role = "admin"
            const data = await this._getWalletSummaryService.execute(adminId, role)
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

    async getTransactions(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) {
                throw new AppError(
                    ErrorCode.UNAUTHORIZED,
                    "User not authenticated",
                    HttpStatusCode.UNAUTHORIZED
                )
            }
            const adminId = req.user.id
            const role = "admin"
            const searchQuery = req.query.search as string | undefined;
            const data = await this._listWalletTransactionsService.execute(adminId, role, searchQuery)
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