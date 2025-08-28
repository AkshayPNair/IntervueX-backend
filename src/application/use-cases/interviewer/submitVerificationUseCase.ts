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