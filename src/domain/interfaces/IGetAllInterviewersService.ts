import { InterviewerProfileDTO } from "../dtos/user.dto";

export interface IGetAllInterviewersService{
    execute():Promise<InterviewerProfileDTO[]>
}