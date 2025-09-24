"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInterviewerProfileUseCase = void 0;
const AppError_1 = require("../../error/AppError");
const ErrorCode_1 = require("../../error/ErrorCode");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const interviewerMapper_1 = require("../../../application/mappers/interviewerMapper");
class UpdateInterviewerProfileUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async execute(userId, updateData) {
        const user = await this._userRepository.findUserById(userId);
        if (!user || user.role !== 'interviewer') {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'Interviewer not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        const interviewerProfile = await this._interviewerRepository.findByUserId(userId);
        if (!interviewerProfile) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.USER_NOT_FOUND, 'Interviewer profile not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
        }
        if (updateData.name && updateData.name !== user.name) {
            await this._userRepository.updateUser(userId, { name: updateData.name });
        }
        const profileUpdateData = {};
        if (updateData.profilePic !== undefined)
            profileUpdateData.profilePic = updateData.profilePic;
        if (updateData.jobTitle !== undefined)
            profileUpdateData.jobTitle = updateData.jobTitle;
        if (updateData.yearsOfExperience !== undefined)
            profileUpdateData.yearsOfExperience = updateData.yearsOfExperience;
        if (updateData.professionalBio !== undefined)
            profileUpdateData.professionalBio = updateData.professionalBio;
        if (updateData.technicalSkills !== undefined)
            profileUpdateData.technicalSkills = updateData.technicalSkills;
        if (updateData.resume !== undefined)
            profileUpdateData.resume = updateData.resume;
        if (updateData.hourlyRate !== undefined)
            profileUpdateData.hourlyRate = updateData.hourlyRate;
        if (Object.keys(profileUpdateData).length > 0) {
            await this._interviewerRepository.updateByUserId(userId, profileUpdateData);
        }
        const updatedUser = await this._userRepository.findUserById(userId);
        const updatedProfile = await this._interviewerRepository.findByUserId(userId);
        return (0, interviewerMapper_1.toInterviewerProfileDTO)(updatedUser, updatedProfile);
    }
}
exports.UpdateInterviewerProfileUseCase = UpdateInterviewerProfileUseCase;
