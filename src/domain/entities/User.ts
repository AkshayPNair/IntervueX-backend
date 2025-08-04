export class User {
    constructor(
        public name: string,
        public email: string,
        public password: string,
        public otp: string | null = null,
        public otpExpiry: Date | null = null,
        public isVerified: boolean = false,
        public isApproved: boolean = false,
        public role: "user" | "interviewer" | "admin" = "user",
        public id?: string,
        public isBlocked: boolean = false,
        public totalSessions: number = 0,
        public hasSubmittedVerification:boolean=false,
        public isRejected:boolean=false,
        public rejectedReason?:string,
        public createdAt?:Date,
        public updatedAt?:Date
    ) { }
}

export interface UserDatabaseResult {
    name: string;
    email: string;
    password: string;
    role: "user" | "interviewer" | "admin";
    otp?: string | null;
    otpExpiry?: Date | null;
    isVerified?: boolean;
    isApproved?: boolean;
    isBlocked?: boolean;
    totalSessions?: number; 
    hasSubmittedVerification?:boolean;
    isRejected?:boolean,
    rejectedReason?:string,
    _id?: string;
    id?: string;
    createdAt?:Date;
    updatedAt?:Date;
}