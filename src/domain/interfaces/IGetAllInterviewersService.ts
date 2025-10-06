import { InterviewerProfileDTO } from "../dtos/user.dto";

export interface IGetAllInterviewersService{
    execute(searchQuery?: string):Promise<InterviewerProfileDTO[]>
}