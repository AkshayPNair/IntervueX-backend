import { UpdateUserProfileDTO,UserProfileDTO } from "../dtos/user.dto";

export interface IUpdateUserProfileService{
    execute(userId:string,updateData:UpdateUserProfileDTO):Promise<UserProfileDTO>
}