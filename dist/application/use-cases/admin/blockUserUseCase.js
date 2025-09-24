"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockUserUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
class BlockUserUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId) {
        try {
            await this._userRepository.blockUserById(userId);
        }
        catch (error) {
            let message = "Failed to block user";
            if (error instanceof Error) {
                message = error.message;
            }
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, message, 500);
        }
    }
}
exports.BlockUserUseCase = BlockUserUseCase;
