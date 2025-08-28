export interface IApproveInterviewerService{
    execute(interviewerId:string):Promise<void>
}