"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetUserProfileUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const userMapper_1 = require("../../mappers/userMapper");
class GetUserProfileUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId) {
        const user = await this._userRepository.findUserById(userId);
        if (!user || user.role !== 'user') {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        return (0, userMapper_1.toUserProfileDTO)(user);
    }
}
exports.GetUserProfileUseCase = GetUserProfileUseCase;
