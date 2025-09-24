"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitVerificationUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class SubmitVerificationUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(userId, interviewerData) {
        const user = await this._userRepository.findUserById(userId);
        if (!user || user.role !== 'interviewer') {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'Interviewer not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const existingProfile = await this._interviewerRepository.findByUserId(userId);
        if (existingProfile) {
            await this._interviewerRepository.updateByUserId(userId, interviewerData);
        }
        else {
            await this._interviewerRepository.createInterviewerProfile({
                userId,
                ...interviewerData
            });
        }
        await this._userRepository.updateUser(userId, {
            hasSubmittedVerification: true,
            isRejected: false,
            rejectedReason: undefined,
            isApproved: false
        });
    }
}
exports.SubmitVerificationUseCase = SubmitVerificationUseCase;
