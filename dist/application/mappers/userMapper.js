"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toInterviewerProfileDTO = exports.toUpdateUserProfileDTO = exports.toUserProfileDTO = exports.toAdminUserListDTOs = exports.toAdminUserListDTO = exports.toUserPersistence = exports.toLoginUserDTO = exports.toUserDomain = void 0;
const User_1 = require("../../domain/entities/User");
const toUserDomain = (dto) => {
    const id = ('_id' in dto && dto._id) ? dto._id.toString() : ('id' in dto ? dto.id : undefined);
    return new User_1.User(dto.name, dto.email, dto.password ?? '', dto.otp ?? null, dto.otpExpiry ?? null, dto.isVerified ?? false, dto.isApproved ?? false, dto.role, id, dto.isBlocked ?? false, dto.totalSessions ?? 0, dto.hasSubmittedVerification ?? false, dto.isRejected ?? false, dto.rejectedReason ?? undefined, dto.profilePicture ?? undefined, dto.resume ?? undefined, dto.skills ?? [], 'createdAt' in dto ? dto.createdAt : undefined, 'updatedAt' in dto ? dto.updatedAt : undefined, dto.isGoogleUser ?? false, dto.googleId ?? undefined);
};
exports.toUserDomain = toUserDomain;
const toLoginUserDTO = (body) => {
    return {
        email: body.email,
        password: body.password,
    };
};
exports.toLoginUserDTO = toLoginUserDTO;
const toUserPersistence = (user) => {
    return {
        name: user.name,
        email: user.email,
        password: user.password,
        otp: user.otp,
        otpExpiry: user.otpExpiry,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        role: user.role,
        isBlocked: user.isBlocked,
        totalSessions: user.totalSessions,
        hasSubmittedVerification: user.hasSubmittedVerification,
        isRejected: user.isRejected,
        rejectedReason: user.rejectedReason,
        profilePicture: user.profilePicture,
        resume: user.resume,
        skills: user.skills,
        isGoogleUser: user.isGoogleUser,
        googleId: user.googleId,
        ...(user.id && { _id: user.id })
    };
};
exports.toUserPersistence = toUserPersistence;
const toAdminUserListDTO = (user) => {
    return {
        id: user.id || '',
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        totalSessions: user.totalSessions
    };
};
exports.toAdminUserListDTO = toAdminUserListDTO;
const toAdminUserListDTOs = (users) => {
    return users.map(exports.toAdminUserListDTO);
};
exports.toAdminUserListDTOs = toAdminUserListDTOs;
const toUserProfileDTO = (user) => ({
    id: user.id || '',
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    resume: user.resume,
    skills: user.skills || []
});
exports.toUserProfileDTO = toUserProfileDTO;
const toUpdateUserProfileDTO = (data) => {
    const dto = {};
    if (data.name !== undefined)
        dto.name = data.name;
    if (data.profilePicture !== undefined)
        dto.profilePicture = data.profilePicture;
    if (data.resume !== undefined)
        dto.resume = data.resume;
    if (data.skills !== undefined)
        dto.skills = data.skills;
    return dto;
};
exports.toUpdateUserProfileDTO = toUpdateUserProfileDTO;
const toInterviewerProfileDTO = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    profilePicture: user.interviewerProfile?.profilePic,
    jobTitle: user.interviewerProfile?.jobTitle,
    professionalBio: user.interviewerProfile?.professionalBio,
    yearsOfExperience: user.interviewerProfile?.yearsOfExperience,
    technicalSkills: user.interviewerProfile?.technicalSkills || [],
    rating: 4.5,
    hourlyRate: user.interviewerProfile?.hourlyRate
});
exports.toInterviewerProfileDTO = toInterviewerProfileDTO;
