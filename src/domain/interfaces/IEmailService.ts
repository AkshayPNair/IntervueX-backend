export interface IEmailService {
    sendEmail(to: string, otp: string): Promise<void>;
    sendApprovalEmail(to: string, userName: string): Promise<void>;
    sendRejectionEmail(to: string, userName: string, rejectedReason: string): Promise<void>;
    sendSessionReminderEmail(params: {
        to: string;
        recipientName: string;
        counterpartName: string;
        date: string; // YYYY-MM-DD
        startTime: string; // HH:mm
        minutesLeft: 5 | 15;
        role: 'user' | 'interviewer';
    }): Promise<void>;
}