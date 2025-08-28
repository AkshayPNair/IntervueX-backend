export interface IGetVerificationStatusService{
    execute(userId:string):Promise<{
        hasSubmittedVerification:boolean;
        isApproved:boolean;
        isRejected:boolean;
        rejectedReason?:string;
        profileExists:boolean;
        verificationData:any;
    }>
}