import { IUserRepository, UserWithInterviewerProfile } from "../../../domain/interfaces/IUserRepository";
import { InterviewerProfileDTO } from "../../../domain/dtos/user.dto";
import { toInterviewerProfileDTO } from "../../mappers/userMapper";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { IGetInterviewerByIdService } from "../../../domain/interfaces/IGetInterviewerByIdService";

export class GetInterviewerByIdUseCase implements IGetInterviewerByIdService{
    constructor(
        private _userRepository:IUserRepository
    ){}

    async execute(interviewerId:string):Promise<InterviewerProfileDTO>{
        const interviewer=await this._userRepository.findApprovedInterviewerById(interviewerId)

        if (!interviewer) {
            throw new AppError(
                ErrorCode.NOT_FOUND,
                "Interviewer not found",
                HttpStatusCode.NOT_FOUND
            );
        }

        return toInterviewerProfileDTO(interviewer)
    }
}
