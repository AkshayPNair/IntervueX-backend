export class User {
    constructor(
        public name: string,
        public email: string,
        public password: string='',
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
        public profilePicture?: string,
        public resume?: string,
        public skills: string[] = [],
        public createdAt?:Date,
        public updatedAt?:Date,
        public  isGoogleUser:boolean=false,
        public googleId?:string
    ) { }
}

export interface UserDatabaseResult {
    name: string;
    email: string;
    password?: string;
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
    profilePicture?: string;
    resume?: string;
    skills?: string[];
    _id?: string;
    id?: string;
    createdAt?:Date;
    updatedAt?:Date;
    isGoogleUser?:boolean;
    googleId?:string;
}
