"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilerController = void 0;
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const AppError_1 = require("../../../application/error/AppError");
class CompilerController {
    constructor(_runCodeService, _listLanguagesService) {
        this._runCodeService = _runCodeService;
        this._listLanguagesService = _listLanguagesService;
    }
    async runCode(req, res) {
        try {
            const compileData = req.body;
            // Validation
            if (!compileData.source) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Source code is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (!compileData.languageId || typeof compileData.languageId !== 'number') {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Valid language ID is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            const result = await this._runCodeService.execute(compileData);
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
                    error: error instanceof Error ? error.message : "An unexpected error occurred",
                    code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                    status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
                });
            }
        }
    }
    async listLanguages(_req, res) {
        try {
            const result = await this._listLanguagesService.execute();
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json(result);
        }
        catch (error) {
            res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                error: error instanceof Error ? error.message : "An unexpected error occurred",
                code: ErrorCode_1.ErrorCode.UNKNOWN_ERROR,
                status: HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER
            });
        }
    }
}
exports.CompilerController = CompilerController;
