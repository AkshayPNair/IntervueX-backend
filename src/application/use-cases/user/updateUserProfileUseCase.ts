import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { UpdateUserProfileDTO, UserProfileDTO } from "../../../domain/dtos/user.dto";
import { toUserProfileDTO } from "../../mappers/userMapper";

export class UpdateUserProfileUseCase {
    constructor(
        private _userRepository: IUserRepository
    ) { }

    async execute(userId: string, updateData: UpdateUserProfileDTO): Promise<UserProfileDTO> {
        const user = await this._userRepository.findUserById(userId)
        if (!user || user.role !== 'user') {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'User not found',
                HttpStatusCode.NOT_FOUND
            );
        }

        const userUpdateData:Partial<{
            name:string;
            profilePicture:string;
            resume:string;
            skills:string[];
        }>={}

        if (updateData.name !== undefined) userUpdateData.name = updateData.name;
        if (updateData.profilePicture !== undefined) userUpdateData.profilePicture = updateData.profilePicture;
        if (updateData.resume !== undefined) userUpdateData.resume = updateData.resume;
        if (updateData.skills !== undefined) userUpdateData.skills = updateData.skills;

        if (Object.keys(userUpdateData).length > 0) {
            await this._userRepository.updateUserProfile(userId, userUpdateData);
        }

        const updatedUser = await this._userRepository.findUserById(userId);
        return toUserProfileDTO(updatedUser!);
    }
}