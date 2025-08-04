import { Request, Response } from "express";
import { GetAllUsersUseCase } from "../../../application/use-cases/admin/getAllUsersUseCase";
import { BlockUserUseCase } from "../../../application/use-cases/admin/blockUserUseCase";
import { UnblockUserUseCase } from "../../../application/use-cases/admin/unblockUserUseCase";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class AdminUserController {
    constructor(
        private _getAllUsersUseCase: GetAllUsersUseCase,
        private _blockUserUseCase: BlockUserUseCase,
        private _unblockUserUseCase: UnblockUserUseCase
    ) { }

    async getAllUsers(req: Request, res: Response) {
        try {
            const users = await this._getAllUsersUseCase.execute();
            res.status(HttpStatusCode.OK).json({ users });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to fetch users" 
            });
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            await this._blockUserUseCase.execute(req.params.id);
            res.status(HttpStatusCode.OK).json({ message: "User blocked successfully" });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to block user" 
            });
        }
    }

    async unblockUser(req: Request, res: Response) {
        try {
            await this._unblockUserUseCase.execute(req.params.id);
            res.status(HttpStatusCode.OK).json({ message: "User unblocked successfully" });
        } catch (error) {
            res.status(HttpStatusCode.INTERNAL_SERVER).json({ 
                error: "Failed to unblock user" 
            });
        }
    }
}