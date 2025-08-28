import { InterviewerProfileDTO } from "../dtos/interviewer.dto";

export interface IGetInterviewerProfileService{
    execute(userId:string):Promise<InterviewerProfileDTO>
}