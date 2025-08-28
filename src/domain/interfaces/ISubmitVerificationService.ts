import { SignupInterviewerDTO } from "../dtos/interviewer.dto";

export interface ISubmitVerificationService{
    execute(userId:string,interviewerData:SignupInterviewerDTO):Promise<void>
}