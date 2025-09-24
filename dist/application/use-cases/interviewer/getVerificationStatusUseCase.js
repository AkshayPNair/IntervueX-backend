"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetVerificationStatusUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
class GetVerificationStatusUseCase {
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
        return {
            hasSubmittedVerification: user.hasSubmittedVerification,
            isApproved: user.isApproved,
            isRejected: user.isRejected,
            rejectedReason: user.rejectedReason,
            profileExists: !!interviewerProfile,
            verificationData: interviewerProfile ? {
                jobTitle: interviewerProfile.jobTitle,
                yearsOfExperience: interviewerProfile.yearsOfExperience,
                professionalBio: interviewerProfile.professionalBio,
                technicalSkills: interviewerProfile.technicalSkills,
                profilePic: interviewerProfile.profilePic,
                resume: interviewerProfile.resume
            } : null
        };
    }
}
exports.GetVerificationStatusUseCase = GetVerificationStatusUseCase;
