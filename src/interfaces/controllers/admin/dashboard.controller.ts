import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { IGetAdminDashboardService } from "../../../domain/interfaces/IGetAdminDashboardService";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { AppError } from "../../../application/error/AppError";
import { ErrorCode } from "../../../application/error/ErrorCode";

export class AdminDashboardController {
  constructor(private _getAdminDashboardService: IGetAdminDashboardService) { }

  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const data = await this._getAdminDashboardService.execute();
      res.status(HttpStatusCode.OK).json(data);
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