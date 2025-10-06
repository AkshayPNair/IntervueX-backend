import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { IGetAllUsersService } from "../../../domain/interfaces/IGetAllUsersService";
import { IBlockUserService } from "../../../domain/interfaces/IBlockUserService";
import { IUnblockUserService } from "../../../domain/interfaces/IUnblockUserService";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class AdminUserController {
    constructor(
        private _getAllUsersService: IGetAllUsersService,
        private _blockUserService: IBlockUserService,
        private _unblockUserService: IUnblockUserService
    ) { }

    async getAllUsers(req:AuthenticatedRequest, res: Response) {
        try {
            const searchQuery = req.query.search as string | undefined;
            const role = req.query.role as string | undefined;
            const status = req.query.isBlocked !== undefined ? (req.query.isBlocked === 'true' ? 'Blocked' : 'Active') : undefined;
            const page = req.query.page ? parseInt(req.query.page as string) : undefined;
            const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string) : undefined;
            const { users, total } = await this._getAllUsersService.execute(searchQuery, role, status, page, pageSize);
            res.status(HttpStatusCode.OK).json({ users, total, page, pageSize });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({
                error: "Failed to fetch users"
            });
        }
    }

    async blockUser(req: AuthenticatedRequest, res: Response) {
        try {
            await this._blockUserService.execute(req.params.id);
            res.status(HttpStatusCode.OK).json({ message: "User blocked successfully" });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to block user" 
            });
        }
    }

    async unblockUser(req: AuthenticatedRequest, res: Response) {
        try {
            await this._unblockUserService.execute(req.params.id);
            res.status(HttpStatusCode.OK).json({ message: "User unblocked successfully" });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to unblock user" 
            });
        }
    }
}