import { IUserRepository } from "../../../domain/interfaces/IUserRepository";
import { AppError } from "../../error/AppError";
import { ErrorCode } from "../../error/ErrorCode";
import { HttpStatusCode } from "../../../utils/HttpStatusCode";
import { UserProfileDTO } from "../../../domain/dtos/user.dto";
import { toUserProfileDTO } from "../../mappers/userMapper";
import { IGetUserProfileService } from "../../../domain/interfaces/IGetUserProfileService";

export class GetUserProfileUseCase implements IGetUserProfileService{
    constructor(
        private _userRepository: IUserRepository
    ) { }

    async execute(userId: string): Promise<UserProfileDTO> {
        const user = await this._userRepository.findUserById(userId)
        if (!user || user.role !== 'user') {
            throw new AppError(
                ErrorCode.USER_NOT_FOUND,
                'User not found',
                HttpStatusCode.NOT_FOUND
            );
        }
        return toUserProfileDTO(user)
    }
}