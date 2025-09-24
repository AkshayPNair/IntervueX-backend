"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserProfileUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const userMapper_1 = require("../../mappers/userMapper");
class UpdateUserProfileUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(userId, updateData) {
        const user = await this._userRepository.findUserById(userId);
        if (!user || user.role !== 'user') {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const userUpdateData = {};
        if (updateData.name !== undefined)
            userUpdateData.name = updateData.name;
        if (updateData.profilePicture !== undefined)
            userUpdateData.profilePicture = updateData.profilePicture;
        if (updateData.resume !== undefined)
            userUpdateData.resume = updateData.resume;
        if (updateData.skills !== undefined)
            userUpdateData.skills = updateData.skills;
        if (Object.keys(userUpdateData).length > 0) {
            await this._userRepository.updateUserProfile(userId, userUpdateData);
        }
        const updatedUser = await this._userRepository.findUserById(userId);
        return (0, userMapper_1.toUserProfileDTO)(updatedUser);
    }
}
exports.UpdateUserProfileUseCase = UpdateUserProfileUseCase;
