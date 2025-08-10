export interface GoogleLoginDTO{
    email:string;
    name:string;
    profilePicture?:string;
    googleId:string;
}

export interface GoogleUserCreationDTO{
    name:string;
    email:string;
    profilePicture?:string;
    googleId:string;
    role:'user'|'interviewer';
    isVerified:boolean;
    isGoogleUser:boolean;
}

export interface RoleSelectionDTO{
    role:"user"|"interviewer"
}

export interface GoogleAuthResponse{
    user:{
        id:string;
        name:string;
        email:string;
        role:"user"|"interviewer"|"admin";
        isVerified:boolean;
        profilePicture?: string;
        isNewUser: boolean;
    }
    token:string;
    needsRoleSelection:boolean
}