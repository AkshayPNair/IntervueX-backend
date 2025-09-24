"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUserController = void 0;
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class AdminUserController {
    constructor(_getAllUsersService, _blockUserService, _unblockUserService) {
        this._getAllUsersService = _getAllUsersService;
        this._blockUserService = _blockUserService;
        this._unblockUserService = _unblockUserService;
    }
    async getAllUsers(req, res) {
        try {
            const users = await this._getAllUsersService.execute();
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ users });
        }
        catch (error) {
            res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                error: "Failed to fetch users"
            });
        }
    }
    async blockUser(req, res) {
        try {
            await this._blockUserService.execute(req.params.id);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "User blocked successfully" });
        }
        catch (error) {
            res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                error: "Failed to block user"
            });
        }
    }
    async unblockUser(req, res) {
        try {
            await this._unblockUserService.execute(req.params.id);
            res.status(HttpStatusCode_1.HttpStatusCode.OK).json({ message: "User unblocked successfully" });
        }
        catch (error) {
            res.status(HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER).json({
                error: "Failed to unblock user"
            });
        }
    }
}
exports.AdminUserController = AdminUserController;
