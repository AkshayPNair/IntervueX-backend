import { InterviewerDashboardDTO } from "../dtos/dashboard.dto";

export interface IGetInterviewerDashboardService{
    execute(interviewerId:string):Promise<InterviewerDashboardDTO>
}