import { LoginDTO, SignupUserDTO, UserProfileDTO, UpdateUserProfileDTO , InterviewerProfileDTO} from "../../domain/dtos/user.dto"
import { User, UserDatabaseResult } from "../../domain/entities/User"
import { AdminUserListDTO } from "../../domain/dtos/user.dto";
import { UserWithInterviewerProfile } from "../../domain/interfaces/IUserRepository";

export const toUserDomain = (dto: SignupUserDTO | UserDatabaseResult): User => {
    const id = ('_id' in dto && dto._id) ? dto._id.toString() : ('id' in dto ? dto.id : undefined);
    return new User(
        dto.name,
        dto.email,
        dto.password,
        dto.otp ?? null,
        dto.otpExpiry ?? null,
        dto.isVerified ?? false,
        dto.isApproved ?? false,
        dto.role,
        id,
        dto.isBlocked ?? false,
        dto.totalSessions ?? 0,
        dto.hasSubmittedVerification ?? false,
        dto.isRejected ?? false,
        dto.rejectedReason ?? undefined,
        dto.profilePicture ?? undefined,
        dto.resume ?? undefined,
        dto.skills ?? [],
        'createdAt' in dto ? dto.createdAt : undefined,
        'updatedAt' in dto ? dto.updatedAt : undefined
    );
}

export const toLoginUserDTO = (body: { email: string, password: string }): LoginDTO => {
    return {
        email: body.email,
        password: body.password,
    }
}

export const toUserPersistence = (user: User) => {
    return {
        name: user.name,
        email: user.email,
        password: user.password,
        otp: user.otp,
        otpExpiry: user.otpExpiry,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        role: user.role,
        isBlocked: user.isBlocked,
        totalSessions: user.totalSessions,
        hasSubmittedVerification: user.hasSubmittedVerification,
        isRejected: user.isRejected,
        rejectedReason: user.rejectedReason,
        profilePicture: user.profilePicture,
        resume: user.resume,
        skills: user.skills,
        ...(user.id && { _id: user.id })
    }
}

export const toAdminUserListDTO = (user: User): AdminUserListDTO => {

    return {
        id: user.id || '',
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        totalSessions: user.totalSessions
    }
}

export const toAdminUserListDTOs = (users: User[]): AdminUserListDTO[] => {
    return users.map(toAdminUserListDTO);
}

export const toUserProfileDTO = (user: User): UserProfileDTO => ({
    id: user.id || '',
    name: user.name,
    email: user.email,
    profilePicture: user.profilePicture,
    resume: user.resume,
    skills: user.skills || []
})

interface RawUpdateData {
    name?: string;
    profilePicture?: string;
    resume?: string;
    skills?: string[];
}

export const toUpdateUserProfileDTO = (data: RawUpdateData): UpdateUserProfileDTO => {
    const dto: UpdateUserProfileDTO = {}

    if (data.name !== undefined) dto.name = data.name;
    if (data.profilePicture !== undefined) dto.profilePicture = data.profilePicture;
    if (data.resume !== undefined) dto.resume = data.resume;
    if (data.skills !== undefined) dto.skills = data.skills;

    return dto
}

export const toInterviewerProfileDTO=(user:UserWithInterviewerProfile):InterviewerProfileDTO=>({
    id:user._id.toString(),
    name:user.name,
    email:user.email,
    profilePicture:user.interviewerProfile?.profilePic,
    jobTitle:user.interviewerProfile?.jobTitle,
    professionalBio:user.interviewerProfile?.professionalBio,
    yearsOfExperience:user.interviewerProfile?.yearsOfExperience,
    technicalSkills:user.interviewerProfile?.technicalSkills||[],
    rating:4.5,
    hourlyRate:150
})