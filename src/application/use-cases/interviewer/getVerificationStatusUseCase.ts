import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { IInterviewerRepository } from "../../../domain/interfaces/IInterviewerRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";

export class GetVerificationStatusUseCase{
    constructor(
        private _userRepository:IUserRepository,
        private _interviewerRepository:IInterviewerRepository
    ){}

    async execute(userId:string){
        const user=await this._userRepository.findUserById(userId)
        if(!user || user.role!=='interviewer'){
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'Interviewer not found',
                HttpStatusCode.NOT_FOUND
            )
        }
        const interviewerProfile=await this._interviewerRepository.findByUserId(userId)

        return{
            hasSubmittedVerification:user.hasSubmittedVerification,
            isApproved: user.isApproved,
            isRejected:user.isRejected,
            rejectedReason:user.rejectedReason,
            profileExists: !!interviewerProfile,
            verificationData: interviewerProfile ? {
                jobTitle: interviewerProfile.jobTitle,
                yearsOfExperience: interviewerProfile.yearsOfExperience,
                professionalBio: interviewerProfile.professionalBio,
                technicalSkills: interviewerProfile.technicalSkills,
                profilePic: interviewerProfile.profilePic,
                resume: interviewerProfile.resume
            } : null
        }
    }


}