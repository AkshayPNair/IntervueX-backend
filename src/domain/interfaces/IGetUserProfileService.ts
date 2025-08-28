import { UserProfileDTO } from "../dtos/user.dto";

export interface IGetUserProfileService{
    execute(userId:string):Promise<UserProfileDTO>
}