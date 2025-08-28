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