import {User} from "../entities/User";

export interface UserWithInterviewerProfile {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    skills?: string[];
    interviewerProfile?: {
        profilePic?: string;
        jobTitle?: string;
        yearsOfExperience?: number;
        professionalBio?: string;
        technicalSkills?: string[];
        hourlyRate?:number;
    };
}

export interface IUserRepository{
    createUser(user:User):Promise<User>;
    findUserByEmail(email:string):Promise<User|null>;
    findUserByGoogleId(googleId:string):Promise<User|null>;
    deleteUserByEmail(email:string):Promise<void>;
    verifyOtp(email:string,otp:string):Promise<User|null>;
    updateUserVerification(email:string):Promise<void>;
    getAllUsers(searchQuery?: string, role?: string, status?: string, page?: number, pageSize?: number):Promise<{ users: User[], total: number }>;
    blockUserById(userId:string):Promise<void>;
    unblockUserById(userId:string):Promise<void>;
    updateOtp(email:string,otp:string|null,otpExpiry:Date|null):Promise<void>;
    updatePassword(email:string,newPassword:string):Promise<void>;
    findUserById(userId: string): Promise<User|null>;
    findPendingInterviewers(searchQuery?: string): Promise<User[]>;
    updateUser(userId: string, update: Partial<User>): Promise<void>;
    deleteUserById(userId: string): Promise<void>;
    updateUserProfile(userId:string,profileData:{name?:string; profilePicture?:string; resume?:string; skills?:string[]}):Promise<User|null>;
    findApprovedInterviewersWithProfiles(searchQuery?: string):Promise<UserWithInterviewerProfile[]>;
    findApprovedInterviewerById(interviewerId: string): Promise<UserWithInterviewerProfile | null>;
    findAdmin(): Promise<User | null>;
}