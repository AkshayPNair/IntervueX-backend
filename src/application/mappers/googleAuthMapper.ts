import {User} from '../../domain/entities/User'
import { GoogleUserCreationDTO, GoogleLoginDTO,GoogleAuthResponse } from '../../domain/dtos/googleAuth.dto'

export const toGoogleUserDomain=(dto:GoogleUserCreationDTO):User=>{
    return new User(
        dto.name,
        dto.email,
        '',
        null,
        null,
        dto.isVerified,
        false,
        dto.role,
        undefined,
        false,
        0,
        false,
        false,
        undefined,
        dto.profilePicture,
        undefined,
        [],
        undefined,
        undefined,
        dto.isGoogleUser,
        dto.googleId
    )
}

export const toGoogleAuthResponse=(
    user:User,
    token:string,
    isNewUser:boolean,
    needsRoleSelection:boolean
):GoogleAuthResponse=>{
    return{
        user:{
            id:user.id!,
            name:user.name,
            email:user.email,
            role:user.role,
            isVerified:user.isVerified,
            profilePicture:user.profilePicture,
            isNewUser
        },
        token,
        needsRoleSelection
    }
}

export const toGoogleUserCreationDTO=(
    googleData:GoogleLoginDTO,
    role:"user"|"interviewer"="user"
):GoogleUserCreationDTO=>{
    return{
        name:googleData.name,
        email:googleData.email,
        profilePicture:googleData.profilePicture,
        googleId:googleData.googleId,
        role,
        isVerified:true,
        isGoogleUser:true,
        
    }
}