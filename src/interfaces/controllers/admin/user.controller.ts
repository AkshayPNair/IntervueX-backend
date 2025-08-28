import { Request, Response } from "express";
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

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this._getAllUsersService.execute();
            res.status(HttpStatusCode.OK).json({ users });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to fetch users" 
            });
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            await this._blockUserService.execute(req.params.id);
            res.status(HttpStatusCode.OK).json({ message: "User blocked successfully" });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to block user" 
            });
        }
    }

    async unblockUser(req: Request, res: Response) {
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