"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetInterviewerByIdUseCase = void 0;
const userMapper_1 = require("../../mappers/userMapper");
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GetInterviewerByIdUseCase {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    async execute(interviewerId) {
        const interviewer = await this._userRepository.findApprovedInterviewerById(interviewerId);
        if (!interviewer) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, "Interviewer not found", HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        return (0, userMapper_1.toInterviewerProfileDTO)(interviewer);
    }
}
exports.GetInterviewerByIdUseCase = GetInterviewerByIdUseCase;
