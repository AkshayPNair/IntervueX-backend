import { GoogleLoginDTO, RoleSelectionDTO, GoogleAuthResponse } from "../dtos/googleAuth.dto";

export interface IGoogleAuthService{
    googleLogin(googleData:GoogleLoginDTO):Promise<GoogleAuthResponse>
    selectRole(userId:string,roleData:RoleSelectionDTO):Promise<GoogleAuthResponse>
}