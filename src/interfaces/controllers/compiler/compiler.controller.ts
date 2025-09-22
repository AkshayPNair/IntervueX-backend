import { Request, Response } from 'express';
import { HttpStatusCode } from '../../../utils/HttpStatusCode';
import { ErrorCode } from '../../../application/error/ErrorCode';
import { AppError } from '../../../application/error/AppError';
import { IRunCodeService } from '../../../domain/interfaces/IRunCodeService';
import { CompileRunDTO } from '../../../domain/dtos/compiler.dto';
import { IListLanguagesService } from '../../../domain/interfaces/IListLanguagesService';

export class CompilerController {
    constructor(
        private _runCodeService: IRunCodeService,
        private _listLanguagesService: IListLanguagesService
    ) { }

    async runCode(req: Request, res: Response) {
        try {
            const compileData: CompileRunDTO = req.body;

            // Validation
            if (!compileData.source) {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Source code is required',
                    HttpStatusCode.BAD_REQUEST
                );
            }

            if (!compileData.languageId || typeof compileData.languageId !== 'number') {
                throw new AppError(
                    ErrorCode.VALIDATION_ERROR,
                    'Valid language ID is required',
                    HttpStatusCode.BAD_REQUEST
                );
            }

            const result = await this._runCodeService.execute(compileData);
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

    async listLanguages(_req: Request, res: Response) {
        try {
            const result = await this._listLanguagesService.execute();
            res.status(HttpStatusCode.OK).json(result);
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({
                error: error instanceof Error ? error.message : "An unexpected error occurred",
                code: ErrorCode.UNKNOWN_ERROR,
                status: HttpStatusCode.INTERNAL_SERVER
            });
        }
    }
}