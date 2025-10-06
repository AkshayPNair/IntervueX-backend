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
        // Validate profile picture URL (should be from Cloudinary for images)
        if (updateData.profilePicture !== undefined && updateData.profilePicture) {
            const isValidImageUrl = updateData.profilePicture.includes('cloudinary.com') ||
                updateData.profilePicture.startsWith('http');
            if (!isValidImageUrl) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid profile picture URL. Only image files are allowed', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
        }
        // Validate resume URL (should be from S3 and be a PDF)
        if (updateData.resume !== undefined && updateData.resume) {
            // Check if it's a valid S3 URL
            const isS3Url = updateData.resume.includes('.s3.') || updateData.resume.includes('amazonaws.com');
            // Check if it's a PDF file
            const isPdfFile = updateData.resume.toLowerCase().endsWith('.pdf');
            if (!isS3Url) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Invalid resume URL', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (!isPdfFile) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Only PDF files are allowed for resume', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
        }
        // Validate name
        if (updateData.name !== undefined && updateData.name) {
            const trimmedName = updateData.name.trim();
            if (!trimmedName) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (trimmedName.length < 2) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name must be at least 2 characters long', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (/^\d+$/.test(trimmedName)) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name cannot be only numbers', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            if (/[^a-zA-Z\s]/.test(trimmedName)) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Name cannot contain special characters or numbers', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
        }
        // Validate skills
        if (updateData.skills !== undefined) {
            if (updateData.skills.length === 0) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'At least one skill is required', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
            // Validate each skill
            for (const skill of updateData.skills) {
                const trimmedSkill = skill.trim();
                if (!trimmedSkill) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Skill cannot be empty', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
                if (trimmedSkill.length < 2) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Each skill must be at least 2 characters long', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
                if (/^\d+$/.test(trimmedSkill)) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Skill cannot be only numbers', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
                if (/[^a-zA-Z0-9\s]/.test(trimmedSkill)) {
                    throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Skill cannot contain special characters', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
                }
            }
            // Check for duplicate skills
            const uniqueSkills = new Set(updateData.skills.map(s => s.trim().toLowerCase()));
            if (uniqueSkills.size !== updateData.skills.length) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.VALIDATION_ERROR, 'Duplicate skills are not allowed', HttpStatusCode_1.HttpStatusCode.BAD_REQUEST);
            }
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
