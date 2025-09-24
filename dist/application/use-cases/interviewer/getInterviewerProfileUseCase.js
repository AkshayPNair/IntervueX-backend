"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerProfileUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const interviewerMapper_1 = require("../../../application/mappers/interviewerMapper");
class GetInterviewerProfileUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(userId) {
        const user = await this._userRepository.findUserById(userId);
        if (!user || user.role !== 'interviewer') {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'Interviewer not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const interviewerProfile = await this._interviewerRepository.findByUserId(userId);
        if (!interviewerProfile) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'Interviewer profile not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        return (0, interviewerMapper_1.toInterviewerProfileDTO)(user, interviewerProfile);
    }
}
exports.GetInterviewerProfileUseCase = GetInterviewerProfileUseCase;
