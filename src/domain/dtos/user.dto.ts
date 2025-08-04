export interface SignupUserDTO{
    name:string;
    email:string;
    password:string;
    role: "user" | "interviewer" | "admin";
    otp?: string;
    otpExpiry?: Date;
    isVerified: boolean;
    isApproved?: boolean;
    isBlocked:boolean;
    totalSessions?: number;
    hasSubmittedVerification?:boolean;
    isRejected?:boolean,
    rejectedReason?:string
}
export interface LoginDTO{
    email:string;
    password:string;
}
export interface VerifyOtpDTO{
    email:string;
    otp:string;
    name?:string;
    password?:string;
    type?: 'signup' | 'reset-password';
}

export interface UpdateOtpDTO {
    otp: string | null;
    otpExpiry: Date | null;
}

export interface ForgetPasswordDTO{
    email:string;
}

export interface ResetPasswordDTO{
    email:string;
    otp:string;
    newPassword:string;
}
export interface AdminUserListDTO {
    id: string;
    name: string;
    email: string;
    role: string;
    isVerified: boolean;
    isApproved?: boolean;
    isBlocked: boolean;
    totalSessions?: number; 
    createdAt?: Date;
    updatedAt?: Date;
}
