import { IUserRepository,UserWithInterviewerProfile } from "../../../domain/interfaces/IUserRepository";
import { InterviewerProfileDTO } from "../../../domain/dtos/user.dto";
import { toInterviewerProfileDTO } from "../../mappers/userMapper";
import { IGetAllInterviewersService } from "../../../domain/interfaces/IGetAllInterviewersService";

export class GetAllInterviewerUseCase implements IGetAllInterviewersService{
    constructor(
        private _userRepository:IUserRepository
    ){}

     async execute(searchQuery?: string):Promise<InterviewerProfileDTO[]>{
        const interviewers=await this._userRepository.findApprovedInterviewersWithProfiles(searchQuery);
        
        return interviewers.map(interviewer=>toInterviewerProfileDTO(interviewer))
    }
}