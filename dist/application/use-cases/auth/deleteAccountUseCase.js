"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteAccountUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class DeleteAccountUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(userId) {
        const user = await this._userRepository.findUserById(userId);
        if (!user) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        // If interviewer, remove interviewer profile first
        if (user.role === 'interviewer') {
            await this._interviewerRepository.deleteByUserId(userId);
        }
        // Hard delete user
        await this._userRepository.deleteUserById(userId);
    }
}
exports.DeleteAccountUseCase = DeleteAccountUseCase;
