import { UpdateInterviewerProfileDTO, InterviewerProfileDTO } from "../dtos/interviewer.dto";

export interface IUpdateInterviewerProfileService{
    execute(userId:string,updateData:UpdateInterviewerProfileDTO):Promise<InterviewerProfileDTO>
}