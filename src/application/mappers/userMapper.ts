import { LoginDTO, SignupUserDTO } from "../../domain/dtos/user.dto"
import { User, UserDatabaseResult } from "../../domain/entities/User"
import { AdminUserListDTO } from "../../domain/dtos/user.dto";

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
        dto.hasSubmittedVerification??false,
        dto.isRejected??false,
        dto.rejectedReason??undefined,
        'createdAt' in dto ? dto.createdAt : undefined,
        'updatedAt' in dto ?dto.updatedAt : undefined
    );
}

export const toLoginUserDTO=(body: {email:string,password:string}): LoginDTO =>{
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
        hasSubmittedVerification:user.hasSubmittedVerification,
        isRejected: user.isRejected,
        rejectedReason: user.rejectedReason,
        ...(user.id && { _id: user.id })
    }
}

export const toAdminUserListDTO=(user:User):AdminUserListDTO=>{

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

export const toAdminUserListDTOs=(users:User[]):AdminUserListDTO[]=>{
    return users.map(toAdminUserListDTO);
}