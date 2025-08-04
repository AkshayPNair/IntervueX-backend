export interface IEmailService {
    sendEmail(to: string, otp: string): Promise<void>;
    sendApprovalEmail(to:string,userName:string):Promise<void>;
    sendRejectionEmail(to:string,userName:string,rejectedReason:string):Promise<void>;
}