"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminSessionController = void 0;
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const AppError_1 = require("../../../application/error/AppError");
class AdminSessionController {
    constructor(_ListAdminSessionsService) {
        this._ListAdminSessionsService = _ListAdminSessionsService;
    }
    async listSessions(req, res) {
        try {
            const result = await this._ListAdminSessionsService.execute();
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
exports.AdminSessionController = AdminSessionController;
