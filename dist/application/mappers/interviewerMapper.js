"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUpdateInterviewerProfileDTO = exports.toInterviewerPersistence = exports.mapRepositoryToInterviewerDTO = exports.toInterviewerProfileDTO = exports.toInterviewerDomain = void 0;
const Interviewer_1 = require("../../domain/entities/Interviewer");
const toInterviewerDomain = (dto, userId) => {
    return new Interviewer_1.Interviewer(userId, dto.profilePic, dto.jobTitle, dto.yearsOfExperience, dto.professionalBio, dto.technicalSkills, dto.resume, dto.hourlyRate);
};
exports.toInterviewerDomain = toInterviewerDomain;
const toInterviewerProfileDTO = (user, interviewer) => ({
    user: {
        id: user.id || '',
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        totalSessions: user.totalSessions || 0
    },
    profile: {
        profilePic: interviewer.profilePic,
        jobTitle: interviewer.jobTitle,
        yearsOfExperience: interviewer.yearsOfExperience,
        professionalBio: interviewer.professionalBio,
        technicalSkills: interviewer.technicalSkills || [],
        resume: interviewer.resume,
        hourlyRate: interviewer.hourlyRate
    }
});
exports.toInterviewerProfileDTO = toInterviewerProfileDTO;
const mapRepositoryToInterviewerDTO = (interviewer) => {
    return {
        user: {
            id: interviewer._id,
            name: interviewer.name,
            email: interviewer.email,
            isVerified: true,
            isApproved: true,
            totalSessions: 0,
        },
        profile: {
            profilePic: interviewer.interviewerProfile?.profilePic,
            jobTitle: interviewer.interviewerProfile?.jobTitle,
            yearsOfExperience: interviewer.interviewerProfile?.yearsOfExperience,
            professionalBio: interviewer.interviewerProfile?.professionalBio,
            technicalSkills: interviewer.interviewerProfile?.technicalSkills || [],
            resume: undefined,
            hourlyRate: interviewer.interviewerProfile?.hourlyRate
        }
    };
};
exports.mapRepositoryToInterviewerDTO = mapRepositoryToInterviewerDTO;
const toInterviewerPersistence = (interviewer) => ({
    userId: interviewer.userId,
    profilePic: interviewer.profilePic,
    jobTitle: interviewer.jobTitle,
    yearsOfExperience: interviewer.yearsOfExperience,
    professionalBio: interviewer.professionalBio,
    technicalSkills: interviewer.technicalSkills,
    resume: interviewer.resume,
    hourlyRate: interviewer.hourlyRate
});
exports.toInterviewerPersistence = toInterviewerPersistence;
const toUpdateInterviewerProfileDTO = (data) => {
    const dto = {};
    if (data.name !== undefined)
        dto.name = data.name;
    if (data.profilePic !== undefined)
        dto.profilePic = data.profilePic;
    if (data.jobTitle !== undefined)
        dto.jobTitle = data.jobTitle;
    if (data.yearsOfExperience !== undefined)
        dto.yearsOfExperience = data.yearsOfExperience;
    if (data.professionalBio !== undefined)
        dto.professionalBio = data.professionalBio;
    if (data.technicalSkills !== undefined)
        dto.technicalSkills = data.technicalSkills;
    if (data.resume !== undefined)
        dto.resume = data.resume;
    if (data.hourlyRate !== undefined)
        dto.hourlyRate = data.hourlyRate;
    return dto;
};
exports.toUpdateInterviewerProfileDTO = toUpdateInterviewerProfileDTO;
