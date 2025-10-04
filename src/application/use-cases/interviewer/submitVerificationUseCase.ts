import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { SignupInterviewerDTO } from "../../../domain/dtos/interviewer.dto";
import { ISubmitVerificationService } from "../../../domain/interfaces/ISubmitVerificationService";

export class SubmitVerificationUseCase implements ISubmitVerificationService{
    constructor(
        private _userRepository: IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async execute(userId:string, interviewerData: SignupInterviewerDTO){

        const user=await this._userRepository.findUserById(userId);
        if(!user || user.role !=='interviewer'){
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer not found',
                HttpStatusCode.NOT_FOUND
            )
        }

        const {
            profilePic,
            jobTitle,
            yearsOfExperience,
            professionalBio,
            technicalSkills,
            resume
        } = interviewerData;

        const errors: string[] = [];

        if(!profilePic){
            errors.push('Profile picture is required');
        }

        if(!jobTitle){
            errors.push('Job title is required');
        }else{
            const trimmedJobTitle = jobTitle.trim();
            if(trimmedJobTitle !== jobTitle){
                errors.push('Job title cannot start or end with spaces');
            }
            if(/^\d+$/.test(trimmedJobTitle)){
                errors.push('Job title cannot be only numbers');
            }
            if(/[^a-zA-Z\s]/.test(trimmedJobTitle)){
                errors.push('Job title cannot contain special characters or numbers');
            }
        }

        if(yearsOfExperience === undefined || yearsOfExperience === null){
            errors.push('Years of experience is required');
        }else{
            const yearsAsString = yearsOfExperience.toString();
            if(yearsAsString !== yearsAsString.trimStart()){
                errors.push('Experience cannot start with spaces');
            }
            if(/[^0-9]/.test(yearsAsString)){
                errors.push('Experience can only contain numbers');
            }
        }

        if(!professionalBio){
            errors.push('Professional bio is required');
        }else{
            const trimmedBio = professionalBio.trim();
            if(trimmedBio !== professionalBio){
                errors.push('Bio cannot start or end with spaces');
            }
            if(/^\d+$/.test(trimmedBio)){
                errors.push('Bio cannot be only numbers');
            }
            if(/[^a-zA-Z0-9\s]/.test(trimmedBio)){
                errors.push('Bio cannot contain special characters');
            }
            if(trimmedBio.length < 100){
                errors.push('Bio must be at least 100 characters long');
            }
        }

        if(!technicalSkills || technicalSkills.length === 0){
            errors.push('At least one technical skill is required');
        }else{
            const invalidSkillIndex = technicalSkills.findIndex((skill) => {
                if(!skill || !skill.trim()){
                    return true;
                }
                const trimmedSkill = skill.trim();
                if(/^\d+$/.test(trimmedSkill)){
                    errors.push('Skill cannot be only numbers');
                    return true;
                }
                if(/[^a-zA-Z0-9\s]/.test(trimmedSkill)){
                    errors.push('Skill cannot contain special characters');
                    return true;
                }
                return false;
            });

            if(invalidSkillIndex !== -1){
                errors.push('Invalid skill provided');
            }
        }

        if(!resume){
            errors.push('Resume is required');
        }

        if(errors.length > 0){
            throw new AppError(
                ErrorCode.VALIDATION_ERROR,
                errors.join(', '),
                HttpStatusCode.BAD_REQUEST
            );
        }


        const existingProfile=await this._interviewerRepository.findByUserId(userId)

        if(existingProfile){
            await this._interviewerRepository.updateByUserId(userId,interviewerData);
        }else{
            await this._interviewerRepository.createInterviewerProfile({
                userId,
                ...interviewerData
            })
        }
        await this._userRepository.updateUser(userId,{
            hasSubmittedVerification:true,
            isRejected:false,
            rejectedReason:undefined,
            isApproved:false
        })
    }
}