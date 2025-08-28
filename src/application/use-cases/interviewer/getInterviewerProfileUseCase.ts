import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { InterviewerProfileDTO } from "../../../domain/dtos/interviewer.dto";
import { toInterviewerProfileDTO } from "../../../application/mappers/interviewerMapper";
import { IGetInterviewerProfileService } from "../../../domain/interfaces/IGetInterviewerProfileService";

export class GetInterviewerProfileUseCase implements IGetInterviewerProfileService{
    constructor(
        private _userRepository:IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async execute(userId:string):Promise<InterviewerProfileDTO>{
        const user=await this._userRepository.findUserById(userId);
        if(!user||user.role!=='interviewer'){
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        const interviewerProfile=await this._interviewerRepository.findByUserId(userId)
        if(!interviewerProfile){
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer profile not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        return toInterviewerProfileDTO(user,interviewerProfile)
    }
}