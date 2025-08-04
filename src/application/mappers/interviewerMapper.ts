import { SignupInterviewerDTO } from "../../domain/dtos/interviewer.dto";
import { Interviewer } from "../../domain/entities/Interviewer";

export const toInterviewerDomain=(dto:SignupInterviewerDTO, userId:string): Interviewer=>{
    return new Interviewer(
        userId,
        dto.profilePic,
        dto.jobTitle,
        dto.yearsOfExperience,
        dto.professionalBio,
        dto.technicalSkills,
        dto.resume
    );
};

export const toInterviewerPersistence = (interviewer: Interviewer) => ({
    userId: interviewer.userId,
    profilePic: interviewer.profilePic,
    jobTitle: interviewer.jobTitle,
    yearsOfExperience: interviewer.yearsOfExperience,
    professionalBio: interviewer.professionalBio,
    technicalSkills: interviewer.technicalSkills,
    resume: interviewer.resume,
});





