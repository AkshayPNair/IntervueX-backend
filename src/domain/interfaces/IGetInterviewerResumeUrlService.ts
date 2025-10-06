export interface IGetInterviewerResumeUrlService {
    execute(userId: string): Promise<string>;
}