"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const bcryptjs_1 = require("bcryptjs");
const hashPassword_1 = require("../../../utils/hashPassword");
class ChangePasswordUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId, dto) {
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const isMatch = await (0, bcryptjs_1.compare)(dto.currentPassword, user.password);
        if (!isMatch) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
        const sameAsCurrent = await (0, bcryptjs_1.compare)(dto.newPassword, user.password);
        if (sameAsCurrent) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'New password must be different from current password', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
        }
        const newHashed = await (0, hashPassword_1.hashPassword)(dto.newPassword);
        await this._userRepository.updateUser(user.id, { password: newHashed });
    }
}
exports.ChangePasswordUseCase = ChangePasswordUseCase;
