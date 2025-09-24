"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthUseCase = void 0;
const googleAuthMapper_1 = require("../../../application/mappers/googleAuthMapper");
const jwtService_1 = require("../../../infrastructure/external/services/jwtService");
const HttpStatusCode_1 = require("../../../utils/HttpStatusCode");
const AppError_1 = require("../../../application/error/AppError");
const ErrorCode_1 = require("../../../application/error/ErrorCode");
const logger_1 = require("../../../utils/logger");
class GoogleAuthUseCase {
    constructor(_userRepository, _interviewerRepository) {
        this._userRepository = _userRepository;
        this._interviewerRepository = _interviewerRepository;
    }
    async googleLogin(googleData) {
        try {
            logger_1.logger.info('GoogleAuthUseCase: Starting Google login', { hasData: !!googleData });
            let existingUser = await this._userRepository.findUserByGoogleId(googleData.googleId);
            logger_1.logger.debug?.('GoogleAuthUseCase: Found existing user by Google ID', { exists: !!existingUser });
            if (!existingUser) {
                existingUser = await this._userRepository.findUserByEmail(googleData.email);
            }
            if (existingUser) {
                if (!existingUser.isGoogleUser || !existingUser.googleId) {
                    await this._userRepository.updateUser(existingUser.id, {
                        isGoogleUser: true,
                        googleId: googleData.googleId,
                        profilePicture: googleData.profilePicture || existingUser.profilePicture
                    });
                    existingUser.isGoogleUser = true;
                    existingUser.googleId = googleData.googleId,
                        existingUser.profilePicture = googleData.profilePicture || existingUser.profilePicture;
                }
                const token = (0, jwtService_1.signJwt)({
                    userId: existingUser.id,
                    email: existingUser.email,
                    role: existingUser.role
                }, existingUser.role);
                return (0, googleAuthMapper_1.toGoogleAuthResponse)(existingUser, token, false, false);
            }
            else {
                const userCreationData = (0, googleAuthMapper_1.toGoogleUserCreationDTO)(googleData, 'user');
                const newUser = (0, googleAuthMapper_1.toGoogleUserDomain)(userCreationData);
                const createdUser = await this._userRepository.createUser(newUser);
                const token = (0, jwtService_1.signJwt)({
                    userId: createdUser.id,
                    email: createdUser.email,
                    role: createdUser.role
                }, createdUser.role);
                return (0, googleAuthMapper_1.toGoogleAuthResponse)(createdUser, token, true, true);
            }
        }
        catch (error) {
            logger_1.logger.error('GoogleAuthUseCase: Error during Google login', { error });
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INVALID_TOKEN, 'Google Authentication failed', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
        }
    }
    async selectRole(userId, roleData) {
        try {
            const user = await this._userRepository.findUserById(userId);
            if (!user) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.NOT_FOUND, 'User not found', HttpStatusCode_1.HttpStatusCode.NOT_FOUND);
            }
            if (!user.isGoogleUser) {
                throw new AppError_1.AppError(ErrorCode_1.ErrorCode.UNAUTHORIZED, 'Role selection is only available for google users', HttpStatusCode_1.HttpStatusCode.UNAUTHORIZED);
            }
            await this._userRepository.updateUser(userId, {
                role: roleData.role
            });
            user.role = roleData.role;
            if (roleData.role === 'interviewer') {
                const existingInterviewer = await this._interviewerRepository.findByUserId(userId);
                if (!existingInterviewer) {
                    await this._interviewerRepository.createInterviewerProfile({
                        userId: userId,
                        profilePic: user.profilePicture,
                        jobTitle: undefined,
                        yearsOfExperience: undefined,
                        professionalBio: undefined,
                        technicalSkills: [],
                        resume: undefined
                    });
                }
            }
            // Generate new JWT token with updated role
            const token = (0, jwtService_1.signJwt)({
                userId: user.id,
                email: user.email,
                role: user.role
            }, user.role);
            return (0, googleAuthMapper_1.toGoogleAuthResponse)(user, token, false, false);
        }
        catch (error) {
            throw new AppError_1.AppError(ErrorCode_1.ErrorCode.INTERNAL_ERROR, 'Role selection failed', HttpStatusCode_1.HttpStatusCode.INTERNAL_SERVER);
        }
    }
}
exports.GoogleAuthUseCase = GoogleAuthUseCase;
