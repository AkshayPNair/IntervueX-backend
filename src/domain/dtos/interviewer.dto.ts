export interface SignupInterviewerDTO {
    profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
    hourlyRate?:number;
}

export interface InterviewerProfileDTO{
    user:{
        id: string;
        name: string;
        email: string;
        isVerified: boolean;
        isApproved: boolean;
        totalSessions: number;
    }
    profile: {
        profilePic?: string;
        jobTitle?: string;
        yearsOfExperience?: number;
        professionalBio?: string;
        technicalSkills: string[];
        resume?: string;
        hourlyRate?:number;
    };
}

export interface UpdateInterviewerProfileDTO{
    name?: string;
    profilePic?: string;
    jobTitle?: string;
    yearsOfExperience?: number;
    professionalBio?: string;
    technicalSkills?: string[];
    resume?: string;
    hourlyRate?:number;
}