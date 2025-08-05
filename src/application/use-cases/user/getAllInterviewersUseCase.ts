import { IUserRepository,UserWithInterviewerProfile } from "../../../domain/interfaces/IUserRepository";
import { InterviewerProfileDTO } from "../../../domain/dtos/user.dto";
import { toInterviewerProfileDTO } from "../../mappers/userMapper";

export class GetAllInterviewerUseCase{
    constructor(
        private _userRepository:IUserRepository
    ){}

    async execute():Promise<InterviewerProfileDTO[]>{
        const interviewers=await this._userRepository.findApprovedInterviewersWithProfiles();

        return interviewers.map(interviewer=>toInterviewerProfileDTO(interviewer))
    }
}