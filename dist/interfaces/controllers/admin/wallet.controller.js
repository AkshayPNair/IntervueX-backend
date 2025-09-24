"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWalletController = void 0;
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class AdminWalletController {
    constructor(_getWalletSummaryService, _listWalletTransactionsService) {
        this._getWalletSummaryService = _getWalletSummaryService;
        this._listWalletTransactionsService = _listWalletTransactionsService;
    }
    async getSummary(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const adminId = req.user.id;
            const role = "admin";
            const data = await this._getWalletSummaryService.execute(adminId, role);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
    async getTransactions(req, res) {
        try {
            if (!req.user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, "User not authenticated", HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            const adminId = req.user.id;
            const role = "admin";
            const data = await this._listWalletTransactionsService.execute(adminId, role);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(data);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({ error: error.message, code: error.code, status: error.status });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER,
                });
            }
        }
    }
}
exports.AdminWalletController = AdminWalletController;
