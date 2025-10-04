import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { UpdateUserProfileDTO, UserProfileDTO } from "../../../domain/dtos/user.dto";
import { toUserProfileDTO } from "../../mappers/userMapper";
import { IUpdateUserProfileService } from "../../../domain/interfaces/IUpdateUserProfileService";

export class UpdateUserProfileUseCase implements IUpdateUserProfileService{
    constructor(
        private _userRepository: IUserRepository
    ) { }

    async execute(userId: string, updateData: UpdateUserProfileDTO): Promise<UserProfileDTO> {
        const user = await this._userRepository.findUserById(userId)
        if (!user || user.role !== 'user') {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'User not found',
                HttpStatusCode.NOT_FOUND
            );
        }

                // Validate profile picture URL (should be from Cloudinary for images)
                if (updateData.profilePicture !== undefined && updateData.profilePicture) {
                    const isValidImageUrl = updateData.profilePicture.includes('cloudinary.com') || 
                                           updateData.profilePicture.startsWith('http');
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
        
                // Validate skills
                if (updateData.skills !== undefined) {
                    
                    if (updateData.skills.length === 0) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'At least one skill is required',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                    
                    // Validate each skill
                    for (const skill of updateData.skills) {
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
                    const uniqueSkills = new Set(updateData.skills.map(s => s.trim().toLowerCase()));
                    if (uniqueSkills.size !== updateData.skills.length) {
                        throw new AppError(
                            ErrorCode.VALIDATION_ERROR,
                            'Duplicate skills are not allowed',
                            HttpStatusCode.BAD_REQUEST
                        );
                    }
                }
        

        const userUpdateData:Partial<{
            name:string;
            profilePicture:string;
            resume:string;
            skills:string[];
        }>={}

        if (updateData.name !== undefined) userUpdateData.name = updateData.name;
        if (updateData.profilePicture !== undefined) userUpdateData.profilePicture = updateData.profilePicture;
        if (updateData.resume !== undefined) userUpdateData.resume = updateData.resume;
        if (updateData.skills !== undefined) userUpdateData.skills = updateData.skills;

        if (Object.keys(userUpdateData).length > 0) {
            await this._userRepository.updateUserProfile(userId, userUpdateData);
        }

        const updatedUser = await this._userRepository.findUserById(userId);
        return toUserProfileDTO(updatedUser!);
    }
}