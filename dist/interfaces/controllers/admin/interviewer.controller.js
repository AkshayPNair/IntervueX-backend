"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminInterviewerController = void 0;
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const AppError_1 = require("../../../application/error/AppError");
class AdminInterviewerController {
    constructor(_getPendingInterviewersService, _approveInterviewerService, _rejectInterviewerService) {
        this._getPendingInterviewersService = _getPendingInterviewersService;
        this._approveInterviewerService = _approveInterviewerService;
        this._rejectInterviewerService = _rejectInterviewerService;
    }
    async getPendingInterviewers(req, res) {
        try {
            const result = await this._getPendingInterviewersService.execute();
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async approveInterviewer(req, res) {
        try {
            const { id } = req.params;
            const result = await this._approveInterviewerService.execute(id);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async rejectInterviewer(req, res) {
        try {
            const { id } = req.params;
            const { rejectedReason } = req.body;
            const result = await this._rejectInterviewerService.execute(id, rejectedReason);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                res.status(error.status).json({
                    error: error.message,
                    code: error.code,
                    status: error.status
                });
            }
            else {
                res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                    error: 'Internal server error',
                    code: 'INTERNAL_SERVER_ERROR',
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
}
exports.AdminInterviewerController = AdminInterviewerController;
