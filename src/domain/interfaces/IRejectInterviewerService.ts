export interface IRejectInterviewerService{
    execute(interviewerId:string,rejectedReason?:string):Promise<void>
}