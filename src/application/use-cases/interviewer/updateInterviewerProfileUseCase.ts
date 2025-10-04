import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { UpdateInterviewerProfileDTO, InterviewerProfileDTO, SignupInterviewerDTO } from "../../../domain/dtos/interviewer.dto";
import { toInterviewerProfileDTO} from "../../../application/mappers/interviewerMapper";
import { IUpdateInterviewerProfileService } from "../../../domain/interfaces/IUpdateInterviewerProfileService";

export class UpdateInterviewerProfileUseCase implements IUpdateInterviewerProfileService{
    constructor(
        private _userRepository:IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async execute(userId:string,updateData:UpdateInterviewerProfileDTO):Promise<InterviewerProfileDTO>{
        const user=await this._userRepository.findUserById(userId)
        if (!user || user.role !== 'interviewer') {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        const interviewerProfile=await this._interviewerRepository.findByUserId(userId)
        if (!interviewerProfile) {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer profile not found',
                HttpStatusCode.NOT_FOUND
            );
        }

                // Validate profile picture URL (should be from Cloudinary for images)
                if (updateData.profilePic !== undefined && updateData.profilePic) {
                    const isValidImageUrl = updateData.profilePic.includes('cloudinary.com') || 
                                           updateData.profilePic.startsWith('http');
                    if (!isValidImageUrl) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Invalid profile picture URL. Only image files are allowed',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate resume URL (should be from S3 and be a PDF)
                if (updateData.resume !== undefined && updateData.resume) {
                    // Check if it's a valid S3 URL
                    const isS3Url = updateData.resume.includes('.s3.') || updateData.resume.includes('amazonaws.com');
                    
                    // Check if it's a PDF file
                    const isPdfFile = updateData.resume.toLowerCase().endsWith('.pdf');
                    
                    if (!isS3Url) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Invalid resume URL',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (!isPdfFile) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Only PDF files are allowed for resume',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate name
                if (updateData.name !== undefined && updateData.name) {
                    const trimmedName = updateData.name.trim();
                    
                    if (!trimmedName) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Name is required',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (trimmedName.length < 2) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Name must be at least 2 characters long',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/^\d+$/.test(trimmedName)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Name cannot be only numbers',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/[^a-zA-Z\s]/.test(trimmedName)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Name cannot contain special characters or numbers',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate job title
                if (updateData.jobTitle !== undefined && updateData.jobTitle) {
                    const trimmedJobTitle = updateData.jobTitle.trim();
                    
                    if (!trimmedJobTitle) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Job title is required',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (trimmedJobTitle.length < 2) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Job title must be at least 2 characters long',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/^\d+$/.test(trimmedJobTitle)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Job title cannot be only numbers',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/[^a-zA-Z\s]/.test(trimmedJobTitle)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Job title cannot contain special characters or numbers',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate years of experience
                if (updateData.yearsOfExperience !== undefined) {
                    if (updateData.yearsOfExperience < 0) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Years of experience cannot be negative',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (updateData.yearsOfExperience > 50) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Years of experience cannot exceed 50',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate professional bio
                if (updateData.professionalBio !== undefined && updateData.professionalBio) {
                    const trimmedBio = updateData.professionalBio.trim();
                    
                    if (!trimmedBio) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Professional bio is required',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (trimmedBio.length < 10) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Professional bio must be at least 10 characters long',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/^\d+$/.test(trimmedBio)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Professional bio cannot be only numbers',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (/[^a-zA-Z0-9\s]/.test(trimmedBio)) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Professional bio cannot contain special characters',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate technical skills
                if (updateData.technicalSkills !== undefined) {
                    if (updateData.technicalSkills.length === 0) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'At least one technical skill is required',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    // Validate each skill
                    for (const skill of updateData.technicalSkills) {
                        const trimmedSkill = skill.trim();
                        
                        if (!trimmedSkill) {
                            throw new AppError(
                                ErrorCode.VALIDATION_ERROR,
                                'Skill cannot be empty',
                                HttpStatusCode.BAD_REQUEST
                            );
                        }
                        
                        if (trimmedSkill.length < 2) {
                            throw new AppError(
                                ErrorCode.VALIDATION_ERROR,
                                'Each skill must be at least 2 characters long',
                                HttpStatusCode.BAD_REQUEST
                            );
                        }
                        
                        if (/^\d+$/.test(trimmedSkill)) {
                            throw new AppError(
                                ErrorCode.VALIDATION_ERROR,
                                'Skill cannot be only numbers',
                                HttpStatusCode.BAD_REQUEST
                            );
                        }
                        
                        if (/[^a-zA-Z0-9\s]/.test(trimmedSkill)) {
                            throw new AppError(
                                ErrorCode.VALIDATION_ERROR,
                                'Skill cannot contain special characters',
                                HttpStatusCode.BAD_REQUEST
                            );
                        }
                    }
                    
                    // Check for duplicate skills
                    const uniqueSkills = new Set(updateData.technicalSkills.map(s => s.trim().toLowerCase()));
                    if (uniqueSkills.size !== updateData.technicalSkills.length) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Duplicate skills are not allowed',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        
                // Validate hourly rate
                if (updateData.hourlyRate !== undefined) {
                    if (updateData.hourlyRate < 0) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Hourly rate cannot be negative',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    if (updateData.hourlyRate > 10000) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Hourly rate cannot be more than 10000',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        

       if (updateData.name && updateData.name !== user.name) {
            await this._userRepository.updateUser(userId, { name: updateData.name });
          }

        const profileUpdateData: Partial<UpdateInterviewerProfileDTO> = {};
        if (updateData.profilePic !== undefined) profileUpdateData.profilePic = updateData.profilePic;
        if (updateData.jobTitle !== undefined) profileUpdateData.jobTitle = updateData.jobTitle;
        if (updateData.yearsOfExperience !== undefined) profileUpdateData.yearsOfExperience = updateData.yearsOfExperience;
        if (updateData.professionalBio !== undefined) profileUpdateData.professionalBio = updateData.professionalBio;
        if (updateData.technicalSkills !== undefined) profileUpdateData.technicalSkills = updateData.technicalSkills;
        if (updateData.resume !== undefined) profileUpdateData.resume = updateData.resume;
        if (updateData.hourlyRate !== undefined) profileUpdateData.hourlyRate = updateData.hourlyRate;

        if (Object.keys(profileUpdateData).length > 0) {
            await this._interviewerRepository.updateByUserId(userId, profileUpdateData);
        }

        const updatedUser = await this._userRepository.findUserById(userId);
        const updatedProfile = await this._interviewerRepository.findByUserId(userId);

        return toInterviewerProfileDTO(updatedUser!, updatedProfile!);
    }
}