import { InterviewerProfileDTO } from "../dtos/user.dto";

export interface IGetInterviewerByIdService{
    execute(interviewerId:string):Promise<InterviewerProfileDTO>
}