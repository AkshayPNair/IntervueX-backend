import { SignupInterviewerDTO, InterviewerProfileDTO, UpdateInterviewerProfileDTO } from "../../domain/dtos/interviewer.dto";
import { Interviewer } from "../../domain/entities/Interviewer";
import { User } from '../../domain/entities/User'

export const toInterviewerDomain = (dto: SignupInterviewerDTO, userId: string): Interviewer => {
    return new Interviewer(
        userId,
        dto.profilePic,
        dto.jobTitle,
        dto.yearsOfExperience,
        dto.professionalBio,
        dto.technicalSkills,
        dto.resume,
    );
};

export const toInterviewerProfileDTO = (user: User, interviewer: Interviewer): InterviewerProfileDTO => ({
    user: {
        id: user.id||'',
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
        hourlyRate:interviewer.hourlyRate
    }
})

export const toInterviewerPersistence = (interviewer: Interviewer) => ({
    userId: interviewer.userId,
    profilePic: interviewer.profilePic,
    jobTitle: interviewer.jobTitle,
    yearsOfExperience: interviewer.yearsOfExperience,
    professionalBio: interviewer.professionalBio,
    technicalSkills: interviewer.technicalSkills,
    resume: interviewer.resume,
    hourlyRate:interviewer.hourlyRate
});

interface RawUpdateData {
    name?: string;
    profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
    hourlyRate?:number
}

export const toUpdateInterviewerProfileDTO = (data: RawUpdateData): UpdateInterviewerProfileDTO => {
    const dto: UpdateInterviewerProfileDTO = {};

    if(data.name !== undefined) dto.name = data.name;
    if(data.profilePic !== undefined) dto.profilePic = data.profilePic;
    if(data.jobTitle !== undefined) dto.jobTitle = data.jobTitle;
    if(data.yearsOfExperience !== undefined) dto.yearsOfExperience = data.yearsOfExperience;
    if(data.professionalBio !== undefined) dto.professionalBio = data.professionalBio;
    if(data.technicalSkills !== undefined) dto.technicalSkills = data.technicalSkills;
    if(data.resume !== undefined) dto.resume = data.resume;
    if(data.hourlyRate !== undefined) dto.hourlyRate = data.hourlyRate;

    return dto;
};





