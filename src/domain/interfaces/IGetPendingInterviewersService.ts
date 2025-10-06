export interface IGetPendingInterviewersService{
    execute(searchQuery?: string):Promise<{
        success:boolean;
        interviewers:Array<{
            id:string;
            name:string;
            email:string;
            createdAt?:Date;
            profile:any;
        }>
    }>
}